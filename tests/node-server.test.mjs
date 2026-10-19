import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {createAssetBinding,createServer} from '../server/node-server.mjs';

test('standalone server serves the app, same-origin API status and proper OCR/WASM bytes',async t=>{
 const root=await mkdtemp(join(tmpdir(),'scenicdue-server-'));await writeFile(join(root,'index.html'),'<h1>fixture calendar</h1>');await mkdir(join(root,'ocr'));await writeFile(join(root,'ocr','engine.wasm'),new Uint8Array([0,97,115,109]));
 const server=createServer({directory:root});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+server.address().port;
 let r=await fetch(base+'/');assert.equal(r.status,200);assert.match(await r.text(),/fixture calendar/);assert.match(r.headers.get('cache-control'),/no-cache/);
 r=await fetch(base+'/ocr/engine.wasm');assert.equal(r.headers.get('content-type'),'application/wasm');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[0,97,115,109]);
 r=await fetch(base+'/api/travel-search/status');const status=await r.json();assert.equal(status.liveInventoryConnected,false);
 r=await fetch(base+'/api/not-a-route',{headers:{accept:'application/json'}});assert.equal(r.status,404);
 r=await fetch(base+'/deep/route',{headers:{accept:'text/html'}});assert.equal(r.status,200);
 r=await fetch(base+'/',{method:'POST',body:'synthetic upload must not be accepted'});assert.equal(r.status,405);
 r=await fetch(base+'/',{method:'HEAD'});assert.equal(r.status,200);assert.equal(await r.text(),'');
});
test('static adapter rejects dot files, traversal, malformed escapes and symlinks outside its root',async t=>{
 const parent=await mkdtemp(join(tmpdir(),'scenicdue-path-')),root=join(parent,'public');await mkdir(root);await writeFile(join(parent,'secret.txt'),'fixture-secret');await symlink(join(parent,'secret.txt'),join(root,'linked.txt'));t.after(()=>rm(parent,{recursive:true,force:true}));
 const assets=createAssetBinding(root);
 for(const path of ['/.env','/%2eenv','/linked.txt','/..%2fsecret.txt','/%zz','/%5c..%5csecret.txt']){const response=await assets.fetch(new Request('http://example.test'+path));assert.ok([400,404].includes(response.status),path);assert.ok(!(await response.text()).includes('fixture-secret'));}
});
