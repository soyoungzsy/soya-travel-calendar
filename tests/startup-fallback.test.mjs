import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function startup(pathname='/encyclopedia/'){
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),script=html.match(/<script data-startup>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,'the initial document must handle failures before the module entry runs');
 const nodes=Object.fromEntries(['startup-message','startup-help','startup-actions'].map(id=>[id,{textContent:'',hidden:true}]));
 const handlers=new Map();let timeout,reloads=0;const window={location:{pathname,reload(){reloads++;}},addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:name=>handlers.delete(name)};
 vm.runInNewContext(script,{window,document:{getElementById:id=>nodes[id]},setTimeout:fn=>{timeout=fn;return 1;},clearTimeout:()=>{timeout=null;}});
 return{window,nodes,handlers,expire:()=>timeout?.(),reloads:()=>reloads};
}

test('the initial document identifies the encyclopedia and offers actions if the entry script fails',()=>{
 const app=startup();assert.match(app.nodes['startup-message'].textContent,/旅行百科/);
 app.handlers.get('error')({target:{tagName:'SCRIPT'}});assert.equal(app.nodes['startup-actions'].hidden,false);assert.match(app.nodes['startup-message'].textContent,/未能/);assert.equal(app.reloads(),0);
 app.expire();assert.match(app.nodes['startup-message'].textContent,/未能/,'a later timeout must not overwrite an explicit failure');
});

test('startup timeout remains recoverable and readiness removes the watchdog and error listeners',()=>{
 const app=startup('/insights/');app.expire();assert.equal(app.nodes['startup-actions'].hidden,false);assert.match(app.nodes['startup-message'].textContent,/仍在/);assert.equal(app.reloads(),0);
 app.window.__SHANHE_STARTUP__.ready();assert.equal(app.handlers.size,0);app.expire();assert.equal(app.reloads(),0);
});
