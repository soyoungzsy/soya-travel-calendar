import test from 'node:test';import assert from 'node:assert/strict';
import {musicFor} from '../src/place-media.mjs';
test('both Baikal seasonal guides use the same official playback link and unrelated places do not inherit it',()=>{const summer=musicFor({id:'baikal-summer-shores'}),winter=musicFor({id:'baikal-winter-ice'});assert.equal(summer,winter);assert.equal(summer.title,'贝加尔湖畔');assert.equal(summer.creator,'李健');assert.equal(new URL(summer.url).hostname,'tv.cctv.com');assert.equal(musicFor({id:'kyoto-spring'}),null);assert.equal(musicFor({id:'personal:private',name:'贝加尔湖'}),null);});
