import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';

test('encyclopedia entry and static dependency graph do not require the globe topology',async t=>{
 const result=await build({logLevel:'silent',build:{write:false,manifest:true}}),chunks=result.output.filter(x=>x.type==='chunk'),byFile=new Map(chunks.map(chunk=>[chunk.fileName,chunk]));
 function dependencies(entry,seen=new Set()){if(seen.has(entry.fileName))return[];seen.add(entry.fileName);return[entry,...entry.imports.flatMap(file=>dependencies(byFile.get(file),seen))];}
 const main=chunks.find(chunk=>chunk.isEntry),initial=dependencies(main);
 assert.ok(!initial.some(chunk=>Object.keys(chunk.modules).some(file=>file.endsWith('/src/world.json'))),'the entry must not require map topology before selecting a route');
 const encyclopedia=chunks.find(chunk=>Object.keys(chunk.modules).some(file=>file.endsWith('/src/Encyclopedia.jsx')));
 assert.ok(encyclopedia&&!encyclopedia.isEntry,'encyclopedia must be independently loadable');
 const required=[...new Set([...initial,...dependencies(encyclopedia)])];
 assert.ok(!required.some(chunk=>Object.keys(chunk.modules).some(file=>/\/src\/(world\.json|Journey\.jsx|Globe\.jsx)$/.test(file))),'encyclopedia must not fetch the calendar or map');
 assert.ok(Buffer.byteLength(main.code)<350000,'bootstrap should remain below 350 kB uncompressed');
 t.diagnostic(JSON.stringify({bootstrapBytes:Buffer.byteLength(main.code),encyclopediaRequiredJSBytes:required.reduce((sum,chunk)=>sum+Buffer.byteLength(chunk.code),0),requiredFiles:required.map(chunk=>chunk.fileName)}));
});
