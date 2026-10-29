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
test('late pre-midnight event corrects first day and the following day rollup',async()=>{
 const original=Date.now,now=Date.parse('2026-10-20T00:01:00+08:00'),e=env(),b=batch();Date.now=()=>now;
 try{
  b.events[0].at=now;
  assert.equal((await analyticsRoute(req('/api/analytics/collect',b),e)).status,200);
  b.events=[{...b.events[0],id:randomUUID(),at:now-120000}];
  assert.equal((await analyticsRoute(req('/api/analytics/collect',b),e)).status,200);
  assert.equal(e.DB.sql.prepare('SELECT first_day FROM analytics_visitors').get().first_day,'2026-10-19');
  const yesterday=e.DB.sql.prepare('SELECT * FROM analytics_daily WHERE day=?').get('2026-10-19'),today=e.DB.sql.prepare('SELECT * FROM analytics_daily WHERE day=?').get('2026-10-20');
  assert.equal(yesterday.new_visitors,1);assert.equal(yesterday.returning_visitors,0);assert.equal(today.new_visitors,0);assert.equal(today.returning_visitors,1);
 }finally{Date.now=original;e.DB.sql.close();}
});
test('module rollups are deduplicated and trip additions remain distinct from plan generation',async()=>{
 const e=env(),b=batch();b.events[0].module='other';
 const event=(kind,module,extra={})=>({id:randomUUID(),seq:b.events.length,at:Date.now(),kind,module,screen:'home',entity:'',...extra});
 for(const [module,activeMs]of [['globe',4000],['destination_card',7000],['knowledge',3000]])b.events.push(event('heartbeat',module,{activeMs}));
 b.events.push(event('click','globe',{action:'globe_zoom'}),event('click','destination_card',{action:'trip_add'}),event('click','trip',{action:'plan'}));
 for(let i=0;i<2;i++)assert.equal((await analyticsRoute(req('/api/analytics/collect',b),e)).status,200);
 const daily=e.DB.sql.prepare('SELECT * FROM analytics_daily').get();assert.equal(daily.trip_adds,1);assert.equal(daily.plans,1);assert.equal(daily.active_ms,14000);
 const modules=e.DB.sql.prepare('SELECT * FROM analytics_daily_modules').all();assert.equal(modules.reduce((n,r)=>n+r.active_ms,0),14000);assert.equal(modules.find(r=>r.module==='globe').clicks,1);assert(modules.every(r=>r.visitors===1));
 const report=await (await analyticsRoute(req('/api/analytics/report?traffic=test',null,owner),e)).json();assert.equal(report.modules.find(r=>r.module==='knowledge').active_ms,3000);assert.equal(report.summary.visitors,1);e.DB.sql.close();
});
test('legacy unlabelled events stay unattributed and arbitrary module names are rejected',async()=>{
 const b=batch();b.events.push({id:randomUUID(),seq:1,at:Date.now(),kind:'heartbeat',screen:'home',activeMs:12000});
 assert.equal(validateBatch(b)[1].module,'unattributed');assert.throws(()=>validateBatch({...b,events:[{...b.events[0],module:'private-browser-text'}]}));
 const e=env();assert.equal((await analyticsRoute(req('/api/analytics/collect',b),e)).status,200);const modules=e.DB.sql.prepare('SELECT * FROM analytics_daily_modules').all();assert.equal(modules.length,1);assert.equal(modules[0].module,'unattributed');assert.equal(modules[0].active_ms,12000);e.DB.sql.close();
});
