import test from 'node:test';
import assert from 'node:assert/strict';
import {globeRadius,projectLocation,unprojectLocation} from '../src/globe-math.mjs';
import {rasterizeSphere,softwareFrameSize} from '../src/globe-software.mjs';
import {createWebGLGlobe,createSoftwareGlobe} from '../src/globe-renderer.mjs';
const texture={width:8,height:4,data:new Uint8ClampedArray(8*4*4)};
for(let i=0;i<texture.data.length;i+=4){texture.data[i]=(i/4)%8*30;texture.data[i+1]=100;texture.data[i+2]=180;texture.data[i+3]=255;}
test('100% fits a complete circular globe within landscape and portrait panels',()=>{
 for(const [width,height]of [[1200,500],[780,450],[375,440],[800,800]]){const r=globeRadius({width,height});assert.ok(r*2<width&&r*2<height);assert.equal(globeRadius({width,height},2),r*2);}
});
test('software rendering stays spherical, shows only the front hemisphere and responds to rotation',()=>{
 const args={width:200,height:120,center:[105,28],texture},a=rasterizeSphere(args),b=rasterizeSphere({...args,center:[0,0]});
 for(const [x,y]of [[0,0],[199,0],[0,119],[199,119],[100,0],[0,60]])assert.equal(a[(y*200+x)*4+3],0);
 assert.equal(a[(60*200+100)*4+3],255);assert.notDeepEqual(a,b);assert.equal(projectLocation([-75,-28],[105,28],{width:200,height:120}).visible,false);
 const r=globeRadius({width:200,height:120});assert.equal(unprojectLocation(100+r+1,60,[105,28],{width:200,height:120}),null);
});
test('software frames cap pixel memory during motion and restore detail when resting',()=>{
 const moving=softwareFrameSize(1600,900,2,true),rest=softwareFrameSize(1600,900,2,false);assert.ok(moving.width*moving.height<232000);assert.ok(rest.width*rest.height<1002000);assert.ok(rest.width>moving.width);
});
test('missing WebGL and failed photography still leave a drawable, rotatable vector sphere',async t=>{
 assert.equal(createWebGLGlobe({getContext:()=>null},{}),null);
 const original=globalThis.Image;let image,ready=0,arcs=0;globalThis.Image=class{constructor(){image=this;}};t.after(()=>{if(original===undefined)delete globalThis.Image;else globalThis.Image=original;});
 const ctx={clearRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){arcs++;},createRadialGradient(){return{addColorStop(){}};}},canvas={getContext:()=>ctx};
 const renderer=createSoftwareGlobe(canvas,{onReady:()=>ready++,invalidate(){}});await Promise.resolve();assert.equal(ready,1);image.onerror();assert.equal(ready,2);
 const oldRatio=globalThis.devicePixelRatio;globalThis.devicePixelRatio=1;t.after(()=>{if(oldRatio===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=oldRatio;});
 renderer.render({width:240,height:140,center:[105,28],zoom:1});renderer.render({width:240,height:140,center:[-40,28],zoom:1.5});assert.ok(arcs>0);assert.equal(canvas.width,240);renderer.dispose();assert.equal(image.onload,null);
});
