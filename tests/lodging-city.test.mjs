import test from 'node:test';
import assert from 'node:assert/strict';
import {lodgingCity,flightCity} from '../src/price-query.mjs';
test('lake hotel search uses a stay town while independent city and airport choices remain distinct',()=>{
 assert.equal(lodgingCity({name:'贝加尔湖'}),'伊尔库茨克');
 assert.equal(lodgingCity({name:'贝加尔湖',lodgingCity:'胡日尔'}),'胡日尔');
 assert.equal(lodgingCity({name:'京都'}),'京都');
 assert.equal(flightCity({name:'京都'}),'大阪');
});
