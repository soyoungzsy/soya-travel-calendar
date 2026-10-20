import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import React from 'react';
import {transformWithEsbuild} from 'vite';

async function page(){
 const source=fs.readFileSync(new URL('../src/LoadingPage.jsx',import.meta.url),'utf8'),{code}=await transformWithEsbuild(source,'LoadingPage.jsx',{loader:'jsx',format:'cjs'});
 let reloads=0,retries=0;const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,require:createRequire(import.meta.url),window:{location:{reload(){reloads++;}}}});
 return{render:status=>module.exports.LoadingPage({route:'encyclopedia',status,onRetry:()=>{retries++;}}),reloads:()=>reloads,retries:()=>retries};
}
function elements(node,type){if(!React.isValidElement(node))return[];return[...(node.type===type?[node]:[]),...React.Children.toArray(node.props.children).flatMap(child=>elements(child,type))];}

test('an error offers one retry action that reloads only after the user clicks',async()=>{
 const app=await page(),view=app.render('error'),buttons=elements(view,'button');
 assert.equal(buttons[0].props.children,'重试加载');
 app.render('error');assert.equal(app.reloads(),0,'rendering an error must never reload automatically');
 buttons[0].props.onClick();assert.equal(app.reloads(),1);assert.equal(app.retries(),0,'a failed module import must not be retried in the same document');
 assert.equal(buttons.length,1,'error recovery must not show two equivalent reload buttons');
 assert.equal(elements(view,'a')[0].props.href,'/');
});

test('a slow load keeps waiting and retries the pending loader instead of reloading the document',async()=>{
 const app=await page(),view=app.render('slow'),buttons=elements(view,'button');
 assert.equal(app.reloads(),0);assert.equal(app.retries(),0);buttons[0].props.onClick();assert.equal(app.retries(),1);assert.equal(app.reloads(),0);assert.equal(elements(view,'a')[0].props.href,'/');
});

test('ordinary pending loading does not offer or trigger recovery actions',async()=>{
 const app=await page(),view=app.render('loading');assert.equal(elements(view,'button').length,0);assert.equal(app.reloads(),0);assert.equal(app.retries(),0);
});
