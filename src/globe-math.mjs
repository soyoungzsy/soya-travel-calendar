export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function cameraBasis([lon,lat]){const r=Math.PI/180,l=lon*r,p=lat*r;return{right:[Math.cos(l),0,-Math.sin(l)],up:[-Math.sin(p)*Math.sin(l),Math.cos(p),-Math.sin(p)*Math.cos(l)],front:[Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)]};}
export const viewportSize=size=>typeof size==='number'?{width:size,height:size}:{width:size.width,height:size.height};
export const globeRadius=(size,zoom=1)=>{const {width,height}=viewportSize(size);return Math.min(width,height)*.46*zoom;};
export function projectLocation(coord,center,size,zoom=1){const {width,height}=viewportSize(size);const r=Math.PI/180,[l,p]=coord.map(x=>x*r),v=[Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)],b=cameraBasis(center),dot=a=>a.reduce((s,x,i)=>s+x*v[i],0),radius=globeRadius(size,zoom);return{x:width/2+dot(b.right)*radius,y:height/2-dot(b.up)*radius,depth:dot(b.front),visible:dot(b.front)>.08};}
export const wheelZoom=(zoom,delta,pinch=false)=>clamp(zoom*Math.exp(-clamp(delta,-70,70)*(pinch?.006:.0018)),.72,2.35);

export function unprojectLocation(x,y,center,size,zoom=1){
 const {width,height}=viewportSize(size),radius=globeRadius(size,zoom),qx=(x-width/2)/radius,qy=(height/2-y)/radius,d=qx*qx+qy*qy;if(d>=.995)return null;
 const b=cameraBasis(center),z=Math.sqrt(1-d),v=b.front.map((n,i)=>b.right[i]*qx+b.up[i]*qy+n*z);
 return [Math.atan2(v[0],v[2])*180/Math.PI,Math.asin(clamp(v[1],-1,1))*180/Math.PI];
}
export function centerForAnchor(coord,x,y,size,zoom,previous){
 if(!coord)return previous;const {width,height}=viewportSize(size),scale=globeRadius(size,zoom);const r=Math.PI/180,[l,p]=coord.map(n=>n*r),cx=Math.cos(p),sx=(x-width/2)/scale,sy=(height/2-y)/scale;
 if(Math.abs(sx)>=Math.abs(cx)||sx*sx+sy*sy>=.995)return previous;
 const lon=l-Math.asin(sx/cx),a=cx*Math.cos(l-lon),b=Math.sin(p),radius=Math.hypot(a,b),lat=Math.atan2(b,a)-Math.asin(clamp(sy/radius,-1,1));
 return [lon/r,clamp(lat/r,-84,84)];
}
export function tooltipPosition(x,y,width,height,size){
 const bounds=viewportSize(size);return {left:clamp(x+18+width>bounds.width?x-width-18:x+18,8,Math.max(8,bounds.width-width-8)),top:clamp(y+18+height>bounds.height?y-height-18:y+18,8,Math.max(8,bounds.height-height-8))};
}
export function avoidLabelCollisions(labels,size){
 const {width,height}=viewportSize(size),boxes=[],visible=new Set();for(const l of [...labels].sort((a,b)=>b.priority-a.priority)){
  const b={x:l.x-l.width/2,y:l.y-l.height/2,w:l.width,h:l.height};
  if(b.x<5||b.y<5||b.x+b.w>width-5||b.y+b.h>height-5)continue;
  if(!l.force&&boxes.some(p=>b.x<p.x+p.w+5&&b.x+b.w+5>p.x&&b.y<p.y+p.h+4&&b.y+b.h+4>p.y))continue;
  visible.add(l.id);boxes.push(b);
 }return visible;
}

export function consumeMapGesture(event){event.preventDefault();event.stopPropagation();}
