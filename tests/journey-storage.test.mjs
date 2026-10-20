import test from 'node:test';
import assert from 'node:assert/strict';
import {JOURNEY_KEY,readJourney,toggleSaved,patchJourney} from '../src/journey-storage.mjs';
test('saved mutation preserves another tab additions, removals and profile fields',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 patchJourney(storage,{saved:['kyoto-spring'],origin:'杭州'});
 toggleSaved(storage,'iceland');
 assert.deepEqual(toggleSaved(storage,'poi:karnak-amun',['kyoto-spring']),['kyoto-spring','iceland','poi:karnak-amun']);
 toggleSaved(storage,'kyoto-spring');patchJourney(storage,{budget:18000});
 assert.deepEqual(readJourney(storage),{saved:['iceland','poi:karnak-amun'],origin:'杭州',budget:18000});
 assert.ok(data.has(JOURNEY_KEY));
});
