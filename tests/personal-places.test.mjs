import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePlace,mergePlaces,parseImport,exportPlaces,readPersonal,writePersonal,personalMapPoints,PERSONAL_KEY} from '../src/personal-places.mjs';
const sample=(more={})=>normalizePlace({name:'示例海边步道',country:'中国',coord:[120,30],months:[10,5,10],notes:'只用于测试的合成备注',...more});
test('personal places persist, edit and restore without retaining identity fields',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const p=sample({passportNumber:'SYNTHETIC-DO-NOT-EXPORT',profile:{visas:{}},cookie:'SYNTHETIC-COOKIE'});writePersonal(storage,[p]);
 const restored=readPersonal(storage).places;assert.equal(restored[0].name,p.name);assert.deepEqual(restored[0].months,[5,10]);
 const edited=normalizePlace({...restored[0],notes:'修改后的合成备注',status:'visited'});writePersonal(storage,[edited]);assert.equal(readPersonal(storage).places[0].status,'visited');
 const exported=exportPlaces([edited]);assert(!exported.includes('SYNTHETIC-DO-NOT-EXPORT'));assert(!exported.includes('passportNumber'));assert(!exported.includes('cookie'));assert(!exported.includes('profile'));
 writePersonal(storage,[]);assert.equal(readPersonal(storage).places.length,0);writePersonal(storage,restored);assert.equal(readPersonal(storage).places.length,1);assert(data.has(PERSONAL_KEY));
});
test('import merge skips duplicates without overwriting existing notes and resolves id collisions',()=>{
 const original=sample(),duplicate=sample({name:' 示例 海边步道 ',notes:'不应覆盖原备注'}),other=sample({name:'另一个示例地点',id:original.id});
 const incoming=parseImport(exportPlaces([duplicate,other]));const result=mergePlaces([original],incoming);assert.equal(result.added,1);assert.equal(result.skipped,1);assert.equal(result.places[0].notes,original.notes);assert.notEqual(result.places[0].id,result.places[1].id);
});
test('untrusted files reject malformed, oversized, future-schema and excessive inputs',()=>{
 for(const input of ['not-json',JSON.stringify([]),JSON.stringify({format:'shanhe-youqi-places',version:2,places:[]}),JSON.stringify({format:'shanhe-youqi-places',version:1,places:Array(501).fill({})}),'x'.repeat(2*1024*1024+1)])assert.throws(()=>parseImport(input));
});
test('optional coordinates stay absent and invalid coordinates or unsafe links are rejected',()=>{
 assert.equal(sample({coord:null}).coord,null);
 for(const coord of [[181,0],[0,91],[NaN,0],['120',30],[],[0]])assert.throws(()=>sample({coord}));
 for(const sourceURL of ['javascript:alert(1)','data:text/html,anything','https://name:password@example.org','bad-url'])assert.throws(()=>sample({sourceURL}));
 assert.throws(()=>sample({name:''}));assert.throws(()=>sample({months:[0,13]}));
});
test('corrupt or unavailable storage gives an explicit error instead of pretending to save',()=>{
 assert(readPersonal({getItem:()=>'{bad'}).error);assert.throws(()=>writePersonal({setItem:()=>{throw new Error('quota');}},[sample()]));
});
test('private map markers exclude missing coordinates and respect domestic scope',()=>{
 const cn=sample(),foreign=sample({name:'示例海外地点',country:'日本'}),noPosition=sample({name:'未定位的示例',coord:null});
 assert.equal(personalMapPoints([cn,foreign,noPosition]).length,2);assert.equal(personalMapPoints([cn,foreign],'domestic')[0].id,cn.id);assert.equal(personalMapPoints([cn,foreign],'international')[0].id,foreign.id);assert(personalMapPoints([cn])[0].personal);
});
