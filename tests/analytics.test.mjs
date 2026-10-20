import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {analyticsRoute,validateBatch,reportRange} from '../worker/analytics.mjs';
import {dayInShanghai,summarizePaths} from '../worker/analytics-contract.mjs';
const ROOT=new URL('../',import.meta.url);
function database(){const sql=new DatabaseSync(':memory:');for(const name of readdirSync(new URL('drizzle/',ROOT)).filter(n=>n.endsWith('.sql')))sql.exec(readFileSync(new URL('drizzle/'+name,ROOT),'utf8'));const db={sql,prepare(query){let values=[];const statement={bind(...args){values=args;return statement;},async first(){return sql.prepare(query).get(...values)||null;},async run(){return sql.prepare(query).run(...values);},async all(){return {results:sql.prepare(query).all(...values)};}};return statement;},async batch(statements){const results=[];for(const statement of statements){try{results.push(await statement.all());}catch(e){throw e;}}return results;}};return db;}
function batch(extra={}){return {v:1,visitor:randomUUID(),session:randomUUID(),traffic:'test',device:'desktop',events:[{id:randomUUID(),seq:0,at:Date.now(),kind:'page',screen:'home',entity:''}],...extra};}
const req=(path,body,headers={})=>new Request('https://example.test'+path,{method:body?'POST':'GET',headers:{...body?{'content-type':'application/json',origin:'https://example.test'}:{},...headers},...body?{body:JSON.stringify(body)}:{}});
const owner={'oai-authenticated-user-id':'verified-platform-owner','oai-authenticated-user-email':'owner@example.test'};
function env(){return {DB:database(),ANALYTICS_HASH_SALT:'test-only-salt',ANALYTICS_OWNER_EMAIL:'owner@example.test'};}
test('consent payload cannot carry personal fields, unknown places, excessive active time or arbitrary error details',()=>{
 const valid=batch();assert.equal(validateBatch(valid).length,1);
 for(const b of [{...valid,passport:'private'}, {...valid,events:[{...valid.events[0],rawText:'private'}]}, {...valid,events:[{...valid.events[0],entity:'personal-secret'}]}, {...valid,events:[{...valid.events[0],kind:'heartbeat',activeMs:15001}]}, {...valid,events:[{...valid.events[0],kind:'performance',action:'globe_ready',value:-1}]}])assert.throws(()=>validateBatch(b));
});
test('actual SQLite migration, insert, duplicate delivery, rollup and owner report agree',async()=>{
 const e=env(),b=batch();b.events.push({id:randomUUID(),seq:1,at:Date.now(),kind:'click',action:'search',screen:'home',entity:''},{id:randomUUID(),seq:2,at:Date.now(),kind:'view',screen:'guide',entity:'luxor-nile-history'},{id:randomUUID(),seq:3,at:Date.now(),kind:'heartbeat',screen:'guide',entity:'luxor-nile-history',activeMs:12000});
 for(let i=0;i<2;i++){const r=await analyticsRoute(req('/api/analytics/collect',b),e);assert.equal(r.status,200,await r.text());}
 assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM analytics_events').get().n,4);
 assert.equal(e.DB.sql.prepare('SELECT active_ms FROM analytics_daily').get().active_ms,12000);
 const r=await analyticsRoute(req('/api/analytics/report?traffic=test&days=7',null,owner),e),data=await r.json();assert.equal(r.status,200,JSON.stringify(data));assert.equal(data.summary.visitors,1);assert.equal(data.summary.sessions,1);assert.equal(data.summary.clicks,1);assert.equal(data.summary.active_ms,12000);assert.equal(data.summary.max_steps,3);assert.equal(data.buttons[0].action,'search');assert.equal(data.paths.longest[0].steps.length,3);assert.equal(data.destinations[0].name,'卢克索');
 assert.notEqual(e.DB.sql.prepare('SELECT id FROM analytics_visitors').get().id,b.visitor);
 const live=await (await analyticsRoute(req('/api/analytics/report?days=7',null,owner),e)).json();assert.equal(live.summary.visitors,0,'test data must never inflate live visits');e.DB.sql.close();
});
test('report is owner-only and collection rejects cross-site writes',async()=>{
 const e=env();assert.equal((await analyticsRoute(req('/api/analytics/report'),e)).status,401);assert.equal((await analyticsRoute(req('/api/analytics/report',null,{...owner,'oai-authenticated-user-email':'other@example.test'}),e)).status,403);
 assert.equal((await analyticsRoute(req('/api/analytics/collect',batch(),{origin:'https://other.test'}),e)).status,403);
 assert.equal((await analyticsRoute(req('/api/analytics/report',null,owner),{})).status,403,'unconfigured instance fails closed');e.DB.sql.close();
});
test('owner live requests are excluded; test stream is explicitly allowed',async()=>{
 const e=env(),b=batch({traffic:'live'});assert.equal((await (await analyticsRoute(req('/api/analytics/collect',b,owner),e)).json()).status,'owner_excluded');assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM analytics_events').get().n,0);e.DB.sql.close();
});
test('cross-day returning visitors and within-period repeats differ from same-day sessions',async()=>{
 const e=env(),now=Date.now(),today=dayInShanghai(now),yesterday=dayInShanghai(now-86400000),visitor='hash-fixture-only';
 e.DB.sql.prepare('INSERT INTO analytics_visitors VALUES (?,?,?,?)').run(visitor,yesterday,today,'live');
 const insert=e.DB.sql.prepare('INSERT INTO analytics_events (id,visitor,session,day,at,seq,kind,screen,device,traffic) VALUES (?,?,?,?,?,?,?,?,?,?)');
 for(const [day,at]of [[yesterday,now-86400000],[today,now],[today,now+1]])insert.run(randomUUID(),visitor,randomUUID(),day,at,0,'page','home','desktop','live');
 const data=await (await analyticsRoute(req('/api/analytics/report?days=7',null,owner),e)).json();assert.equal(data.summary.visitors,1);assert.equal(data.summary.sessions,3);assert.equal(data.summary.returning_visitors,1);assert.equal(data.summary.revisit_visitors,1);e.DB.sql.close();
});
test('Shanghai dates, bounded range and ordered paths',()=>{
 assert.equal(dayInShanghai(Date.parse('2026-10-19T16:01:00Z')),'2026-10-20');assert.throws(()=>reportRange(new URL('https://example.test/?start=2000-01-01')));
 const paths=summarizePaths([{session:'a',kind:'page',screen:'home'},{session:'a',kind:'click',action:'search'},{session:'a',kind:'heartbeat',screen:'home'},{session:'b',kind:'page',screen:'home'}]);assert.equal(paths.longest[0].steps.length,2);assert.deepEqual(paths.longest[0].steps,['进入首页','查看目的地灵感']);
});
