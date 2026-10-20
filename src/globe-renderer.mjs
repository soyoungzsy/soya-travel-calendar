import {geoOrthographic,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import topology from './world.json' with {type:'json'};
import media from './media-catalog.mjs';
import {cameraBasis,globeRadius} from './globe-math.mjs';
import {earthTextureWithBorders} from './cartography.mjs';
import {rasterizeSphere,texturePixels,softwareFrameSize} from './globe-software.mjs';

const vertex=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
uniform vec2 resolution;uniform float zoom;uniform sampler2D earth;uniform sampler2D clouds;uniform vec3 right;uniform vec3 up;uniform vec3 front;
void main(){
 vec2 q=(gl_FragCoord.xy-resolution*.5)/(min(resolution.x,resolution.y)*.46*zoom);
 float d=dot(q,q);
 if(d>1.){float halo=exp(-(d-1.)*65.)*(1.-smoothstep(1.,1.085,d))*.3;gl_FragColor=vec4(.35,.70,1.,halo);return;}
 float z=sqrt(1.-d);
 vec3 w=right*q.x+up*q.y+front*z;
 vec2 uv=vec2(atan(w.x,w.z)/6.2831853+.5,.5-asin(clamp(w.y,-1.,1.))/3.14159265);
 vec3 c=texture2D(earth,uv).rgb;
 float water=smoothstep(.005,.045,c.b-c.r)*smoothstep(-.005,.008,c.g-c.r)*(1.-smoothstep(.28,.62,max(c.r,max(c.g,c.b))));
 vec3 ocean=mix(vec3(.018,.28,.49),vec3(.07,.40,.59),smoothstep(.08,.35,c.g));
 c=mix(c,ocean,water*.88);
 float light=max(0.,dot(normalize(vec3(-.35,.35,1.)),vec3(q,z)));
 c=pow(c,vec3(.80))*(.92+.08*light);
 float cloud=pow(texture2D(clouds,uv).r,1.5)*.70;
 c=mix(c,vec3(.95,.98,1.),cloud);
 float rim=pow(1.-z,3.5);
 c=mix(c,vec3(.40,.72,.98),rim*.42);
 float edge=1.-smoothstep(1.-3./resolution.x,1.,d);
 gl_FragColor=vec4(c,edge);
}`;


export function createWebGLGlobe(canvas,{onReady,invalidate,onFailure}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)return null;
 const precision=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision?'highp':'mediump';
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source.replace('precision highp float','precision '+precision+' float'));gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Globe shader unavailable');}return s;};
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const u=Object.fromEntries(['resolution','zoom','earth','clouds','right','up','front'].map(k=>[k,gl.getUniformLocation(program,k)]));
 const texture=gl.createTexture(),cloudTexture=gl.createTexture(),textureLimit=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE)),viewport=gl.getParameter(gl.MAX_VIEWPORT_DIMS),bufferLimit=Math.min(2000,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),viewport[0],viewport[1]);
 let alive=true;
 for(const [t,rgba]of [[texture,[12,65,108,255]],[cloudTexture,[0,0,0,255]]]){gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(rgba));}
 const image=new Image(),clouds=new Image();image.fetchPriority='high';clouds.fetchPriority='low';image.decoding=clouds.decoding='async';image.onload=()=>{if(!alive)return;try{const atlas=earthTextureWithBorders(image,textureLimit);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);if(gl.getError()!==gl.NO_ERROR)throw new Error('Texture upload unavailable');onReady();invalidate();clouds.src=media.earthClouds;}catch{onFailure();}};image.onerror=()=>{if(alive)onFailure();};image.src=media.earthReal;
 clouds.onload=()=>{if(!alive||gl.isContextLost())return;try{const atlas=document.createElement('canvas'),limit=Math.min(2048,textureLimit);atlas.width=limit;atlas.height=limit/2;atlas.getContext('2d').drawImage(clouds,0,0,atlas.width,atlas.height);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,cloudTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);invalidate();}catch{/* Optional clouds must never remove the usable base globe. */}};
 const lost=e=>{e.preventDefault();if(alive)onFailure();};canvas.addEventListener('webglcontextlost',lost);
 return {render({width,height,center,zoom}){
  if(!alive||!width||!height||gl.isContextLost())return;const dpr=Math.min(devicePixelRatio||1,2,bufferLimit/Math.max(width,height)),w=Math.round(width*dpr),h=Math.round(height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.earth,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,cloudTexture);gl.uniform1i(u.clouds,1);gl.uniform2f(u.resolution,w,h);gl.uniform1f(u.zoom,zoom);
  const b=cameraBasis(center);for(const k of ['right','up','front'])gl.uniform3fv(u[k],b[k]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 },dispose(){alive=false;image.onload=image.onerror=clouds.onload=null;canvas.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteTexture(cloudTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}

export function createSoftwareGlobe(canvas,{onReady,invalidate}){
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw new Error('Canvas 2D unavailable');
 const land=feature(topology,topology.objects.countries),projection=geoOrthographic().clipAngle(90).precision(.6),path=geoPath(projection,ctx);
 let texture=null,frame=null,alive=true;
 const image=new Image();image.fetchPriority='high';image.decoding='async';image.onload=()=>{if(!alive)return;try{texture=texturePixels(earthTextureWithBorders(image,2048));}catch{}onReady();invalidate();};image.onerror=()=>{if(alive){onReady();invalidate();}};image.src=media.earthReal;
 // A usable vector globe exists immediately, including while photography loads.
 queueMicrotask(()=>{if(alive){onReady();invalidate();}});
 return {render({width,height,center,zoom,moving}){
  if(!alive||!width||!height)return;const size=softwareFrameSize(width,height,devicePixelRatio||1,moving),w=size.width,h=size.height,r=globeRadius(size,zoom);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;frame=null;}
  ctx.clearRect(0,0,w,h);
  if(texture){frame ||= ctx.createImageData(w,h);rasterizeSphere({width:w,height:h,center,zoom,texture,data:frame.data});ctx.putImageData(frame,0,0);}
  else{projection.translate([w/2,h/2]).scale(r).rotate([-center[0],-center[1]]);ctx.beginPath();path({type:'Sphere'});ctx.fillStyle='#397eaa';ctx.fill();ctx.beginPath();path(land);ctx.fillStyle='#9cbb9d';ctx.fill();ctx.strokeStyle='#eef3e9';ctx.lineWidth=.7;ctx.stroke();}
  const glow=ctx.createRadialGradient(w/2,h/2,r*.96,w/2,h/2,r*1.045);glow.addColorStop(0,'rgba(109,187,237,0)');glow.addColorStop(.55,'rgba(109,187,237,.22)');glow.addColorStop(1,'rgba(109,187,237,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(w/2,h/2,r*1.045,0,Math.PI*2);ctx.fill();
 },dispose(){alive=false;image.onload=image.onerror=null;texture=frame=null;}};
}
