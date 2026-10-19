import {cameraBasis,clamp,globeRadius} from './globe-math.mjs';

// Orthographic sphere rasterization keeps the same camera as WebGL and DOM labels.
// This path needs Canvas 2D only; it never substitutes an equirectangular rectangle.
export function rasterizeSphere({width,height,center,zoom=1,texture,data=new Uint8ClampedArray(width*height*4)}){
 data.fill(0);
 const radius=globeRadius({width,height},zoom),b=cameraBasis(center),cx=width/2,cy=height/2;
 const left=Math.max(0,Math.floor(cx-radius)),right=Math.min(width,Math.ceil(cx+radius));
 const top=Math.max(0,Math.floor(cy-radius)),bottom=Math.min(height,Math.ceil(cy+radius));
 for(let y=top;y<bottom;y++){
  const qy=(cy-y-.5)/radius;
  for(let x=left;x<right;x++){
   const qx=(x+.5-cx)/radius,d=qx*qx+qy*qy;if(d>=1)continue;
   const z=Math.sqrt(1-d),wx=b.right[0]*qx+b.up[0]*qy+b.front[0]*z,wy=b.right[1]*qx+b.up[1]*qy+b.front[1]*z,wz=b.right[2]*qx+b.up[2]*qy+b.front[2]*z;
   const u=((Math.atan2(wx,wz)/(2*Math.PI)+.5)%1+1)%1,v=.5-Math.asin(clamp(wy,-1,1))/Math.PI;
   const tx=Math.min(texture.width-1,Math.floor(u*texture.width)),ty=Math.min(texture.height-1,Math.max(0,Math.floor(v*texture.height))),source=(ty*texture.width+tx)*4,at=(y*width+x)*4;
   const light=.91+.09*Math.max(0,(-.35*qx+.35*qy+z)/1.116),rim=(1-z)**3.5*.34;
   data[at]=texture.data[source]*light*(1-rim)+102*rim;
   data[at+1]=texture.data[source+1]*light*(1-rim)+184*rim;
   data[at+2]=texture.data[source+2]*light*(1-rim)+250*rim;
   data[at+3]=Math.min(255,Math.max(0,(1-d)*radius*255));
  }
 }
 return data;
}

export function texturePixels(atlas){
 const ctx=atlas.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,atlas.width,atlas.height);
 const gamma=Array.from({length:256},(_,n)=>Math.round((n/255)**.8*255));
 for(let i=0;i<pixels.data.length;i+=4){
  const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
  if(b>r+4&&g>r&&r<100){pixels.data[i]=gamma[10];pixels.data[i+1]=gamma[Math.max(65,g)];pixels.data[i+2]=gamma[Math.max(112,b)];}
  else{pixels.data[i]=gamma[r];pixels.data[i+1]=gamma[g];pixels.data[i+2]=gamma[b];}
 }
 return {width:atlas.width,height:atlas.height,data:pixels.data};
}

export function softwareFrameSize(width,height,pixelRatio=1,moving=false){
 const budget=moving?230000:1000000,scale=Math.min(pixelRatio,2,Math.sqrt(budget/(width*height)));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
