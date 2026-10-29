import {ACTIONS,SCREENS,MODULES,KINDS,UUID,dayInShanghai,summarizePaths} from './analytics-contract.mjs';
import {PUBLIC_ENTITIES} from './analytics-entities.mjs';
const ENTITY_IDS=new Set(Object.keys(PUBLIC_ENTITIES));
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','vary':'Cookie'}});
export function analyticsAdmin(request,env){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 return !!id&&!!email&&!!env.ANALYTICS_OWNER_EMAIL&&email.toLowerCase()===env.ANALYTICS_OWNER_EMAIL.toLowerCase();
}
export function validateBatch(body,now=Date.now()){
 if(!body||body.v!==1||!UUID.test(body.visitor)||!UUID.test(body.session)||!['live','test'].includes(body.traffic)||!['desktop','mobile','tablet'].includes(body.device)||!Array.isArray(body.events)||!body.events.length||body.events.length>25)throw new Error('Invalid batch');
 if(Object.keys(body).some(k=>!['v','visitor','session','traffic','device','events'].includes(k)))throw new Error('Unexpected fields');
 return body.events.map(e=>{
  if(!e||Object.keys(e).some(k=>!['id','seq','at','kind','action','screen','entity','module','activeMs','value'].includes(k))||!UUID.test(e.id)||!Number.isSafeInteger(e.seq)||e.seq<0||e.seq>1000000||!KINDS.has(e.kind)||!Object.hasOwn(SCREENS,e.screen))throw new Error('Invalid event');
  if(e.module!==undefined&&!Object.hasOwn(MODULES,e.module))throw new Error('Unknown module');
  const action=e.action||'',entity=e.entity||'';
  if(action&&!Object.hasOwn(ACTIONS,action)||entity&&!ENTITY_IDS.has(entity))throw new Error('Unknown action or public place');
  if(e.kind==='click'&&!action||e.kind==='performance'&&!['globe_ready','page_ready'].includes(action)||e.kind==='error'&&action!=='page_error')throw new Error('Invalid kind');
  if(e.kind==='heartbeat'&&(!Number.isInteger(e.activeMs)||e.activeMs<0||e.activeMs>15000))throw new Error('Invalid active time');
  if(e.kind!=='heartbeat'&&(e.activeMs||0)!==0)throw new Error('Invalid duration');
  if(e.kind==='performance'&&(!Number.isInteger(e.value)||e.value<0||e.value>120000))throw new Error('Invalid performance');
  const at=Number.isFinite(e.at)&&Math.abs(e.at-now)<300000?Math.round(e.at):now;
  return {id:e.id,seq:e.seq,at,day:dayInShanghai(at),kind:e.kind,action,screen:e.screen,entity,module:e.module||'unattributed',activeMs:e.kind==='heartbeat'?e.activeMs:0,value:e.kind==='performance'?e.value:0};
 });
}
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
async function rollup(db,day,traffic,now){
 await db.prepare(`INSERT INTO analytics_daily (id,day,traffic,visitors,sessions,new_visitors,returning_visitors,page_views,clicks,active_ms,guide_views,plans,errors,globe_loads,globe_load_ms,updated_at,trip_adds)
 SELECT ?,?,?,COUNT(DISTINCT e.visitor),COUNT(DISTINCT e.session),COUNT(DISTINCT CASE WHEN v.first_day=? THEN e.visitor END),COUNT(DISTINCT CASE WHEN v.first_day<? THEN e.visitor END),SUM(e.kind='page'),SUM(e.kind='click'),COALESCE(SUM(e.active_ms),0),SUM(e.kind='view' AND e.screen='guide'),SUM(e.kind='click' AND e.action='plan'),SUM(e.kind='error'),SUM(e.kind='performance' AND e.action='globe_ready'),COALESCE(SUM(CASE WHEN e.kind='performance' AND e.action='globe_ready' THEN e.value ELSE 0 END),0),?,SUM(e.kind='click' AND e.action='trip_add')
 FROM analytics_events e JOIN analytics_visitors v ON v.id=e.visitor WHERE e.day=? AND e.traffic=?
 ON CONFLICT(id) DO UPDATE SET visitors=excluded.visitors,sessions=excluded.sessions,new_visitors=excluded.new_visitors,returning_visitors=excluded.returning_visitors,page_views=excluded.page_views,clicks=excluded.clicks,active_ms=excluded.active_ms,guide_views=excluded.guide_views,plans=excluded.plans,errors=excluded.errors,globe_loads=excluded.globe_loads,globe_load_ms=excluded.globe_load_ms,updated_at=excluded.updated_at,trip_adds=excluded.trip_adds`).bind(day+'|'+traffic,day,traffic,day,day,now,day,traffic).run();
 await db.prepare(`INSERT INTO analytics_daily_modules (id,day,traffic,module,visitors,sessions,clicks,views,active_ms,updated_at)
 SELECT ?||COALESCE(NULLIF(module,''),'unattributed'),?,?,COALESCE(NULLIF(module,''),'unattributed'),COUNT(DISTINCT visitor),COUNT(DISTINCT session),SUM(kind='click'),SUM(kind IN ('page','view')),COALESCE(SUM(active_ms),0),?
 FROM analytics_events WHERE day=? AND traffic=? AND kind IN ('page','view','click','heartbeat') GROUP BY COALESCE(NULLIF(module,''),'unattributed')
 ON CONFLICT(id) DO UPDATE SET visitors=excluded.visitors,sessions=excluded.sessions,clicks=excluded.clicks,views=excluded.views,active_ms=excluded.active_ms,updated_at=excluded.updated_at`).bind(day+'|'+traffic+'|',day,traffic,now,day,traffic).run();
}
async function collect(request,env){
 const url=new URL(request.url);
 if(request.method!=='POST')return response({error:'method_not_allowed'},405);
 if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return response({error:'same_origin_required'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return response({error:'json_required'},415);
 if(Number(request.headers.get('content-length')||0)>24000)return response({error:'batch_too_large'},413);
 if(!env.DB||!env.ANALYTICS_HASH_SALT)return response({status:'not_configured'},503);
 // Owner visits are excluded; the explicitly selected test stream remains test-only.
 let body,events;const now=Date.now();try{const text=await request.text();if(text.length>24000)return response({error:'batch_too_large'},413);body=JSON.parse(text);events=validateBatch(body,now);}catch{return response({error:'invalid_batch'},400);}
 if(analyticsAdmin(request,env)&&body.traffic!=='test')return response({status:'owner_excluded'});
 const visitor=await digest(env.ANALYTICS_HASH_SALT+'|'+body.traffic+'|'+body.visitor),session=await digest(env.ANALYTICS_HASH_SALT+'|'+visitor+'|'+body.session),db=env.DB;
 const recent=await db.prepare('SELECT COUNT(*) n FROM analytics_events WHERE visitor=? AND at>?').bind(visitor,now-60000).first();if((recent?.n||0)>180)return response({error:'rate_limited'},429);
 const days=[...new Set(events.map(e=>e.day))].sort();
 const statements=[db.prepare('INSERT INTO analytics_visitors (id,first_day,last_day,traffic) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET first_day=MIN(first_day,excluded.first_day),last_day=MAX(last_day,excluded.last_day)').bind(visitor,days[0],days.at(-1),body.traffic),...events.map(e=>db.prepare('INSERT OR IGNORE INTO analytics_events (id,visitor,session,day,at,seq,kind,action,screen,entity,active_ms,value,device,traffic,module) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(e.id,visitor,session,e.day,e.at,e.seq,e.kind,e.action,e.screen,e.entity,e.activeMs,e.value,body.device,body.traffic,e.module))];
 await db.batch(statements);
 // A late pre-midnight batch can move first_day back and change later revisit totals.
 const affected=await db.prepare('SELECT DISTINCT day FROM analytics_events WHERE visitor=? AND day>=?').bind(visitor,days[0]).all();
 for(const {day} of affected.results||[])await rollup(db,day,body.traffic,now);
 const cutoff=dayInShanghai(now-90*86400000);
 await db.batch([db.prepare('DELETE FROM analytics_events WHERE day<?').bind(cutoff),db.prepare('DELETE FROM analytics_visitors WHERE last_day<?').bind(cutoff),db.prepare('DELETE FROM analytics_daily WHERE day<?').bind(cutoff),db.prepare('DELETE FROM analytics_daily_modules WHERE day<?').bind(cutoff)]);
 return response({status:'recorded',accepted:events.length});
}
export function reportRange(url,now=Date.now()){
 const end=url.searchParams.get('end')||dayInShanghai(now),days=Math.max(1,Math.min(90,Number(url.searchParams.get('days'))||7));
 const start=url.searchParams.get('start')||dayInShanghai(Date.parse(end+'T00:00:00+08:00')-(days-1)*86400000);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||!Number.isFinite(Date.parse(start))||start>end||end>dayInShanghai(now)||Date.parse(start)<Date.parse(dayInShanghai(now-89*86400000)))throw new Error('Invalid range');
 if(dayInShanghai(Date.parse(start+'T00:00:00+08:00'))!==start||dayInShanghai(Date.parse(end+'T00:00:00+08:00'))!==end)throw new Error('Invalid calendar date');
 return {start,end,traffic:url.searchParams.get('traffic')==='test'?'test':'live'};
}
async function report(request,env){
 if(!analyticsAdmin(request,env))return response({error:request.headers.get('oai-authenticated-user-id')?'owner_only':'sign_in_required'},request.headers.get('oai-authenticated-user-id')?403:401);
 if(!env.DB)return response({status:'not_configured'},503);
 let range;try{range=reportRange(new URL(request.url));}catch{return response({error:'invalid_range'},400);}
 const {start,end,traffic}=range,params=[start,end,traffic],db=env.DB,where='e.day BETWEEN ? AND ? AND e.traffic=?';
 const queries=[
  db.prepare(`SELECT COUNT(DISTINCT e.visitor) visitors,COUNT(DISTINCT e.session) sessions,SUM(e.kind='page') page_views,SUM(e.kind='click') clicks,COALESCE(SUM(e.active_ms),0) active_ms,COUNT(DISTINCT CASE WHEN v.first_day>=? THEN e.visitor END) new_visitors,COUNT(DISTINCT CASE WHEN v.first_day<e.day THEN e.visitor END) returning_visitors FROM analytics_events e JOIN analytics_visitors v ON v.id=e.visitor WHERE ${where}`).bind(start,...params),
  db.prepare('SELECT * FROM analytics_daily WHERE day BETWEEN ? AND ? AND traffic=? ORDER BY day').bind(...params),
  db.prepare(`SELECT e.action,COUNT(*) count,COUNT(DISTINCT e.visitor) visitors FROM analytics_events e WHERE ${where} AND e.kind='click' GROUP BY e.action ORDER BY count DESC`).bind(...params),
  db.prepare(`SELECT e.screen,COALESCE(SUM(e.active_ms),0) active_ms,COUNT(DISTINCT e.session) sessions,SUM(e.kind='view' OR e.kind='page') views FROM analytics_events e WHERE ${where} GROUP BY e.screen ORDER BY active_ms DESC`).bind(...params),
  db.prepare(`SELECT e.entity,COUNT(*) count FROM analytics_events e WHERE ${where} AND e.entity!='' AND e.kind IN ('view','click') GROUP BY e.entity ORDER BY count DESC LIMIT 20`).bind(...params),
  db.prepare(`SELECT e.device,COUNT(DISTINCT e.visitor) visitors FROM analytics_events e WHERE ${where} GROUP BY e.device`).bind(...params),
  db.prepare(`SELECT e.kind,e.action,COUNT(*) count,COALESCE(AVG(e.value),0) average_ms FROM analytics_events e WHERE ${where} AND e.kind IN ('performance','error') GROUP BY e.kind,e.action`).bind(...params),
  db.prepare(`SELECT e.visitor,COUNT(DISTINCT e.day) days FROM analytics_events e WHERE ${where} GROUP BY e.visitor`).bind(...params),
  db.prepare(`SELECT e.session,e.day,e.at,e.seq,e.kind,e.action,e.screen,e.entity FROM analytics_events e WHERE ${where} AND e.kind IN ('page','view','click') AND e.session IN (SELECT session FROM analytics_events WHERE day BETWEEN ? AND ? AND traffic=? AND kind IN ('page','view','click') GROUP BY session ORDER BY COUNT(*) DESC LIMIT 2000) ORDER BY e.session,e.at,e.seq LIMIT 50001`).bind(...params,...params),
  db.prepare('SELECT MIN(day) day FROM analytics_daily WHERE traffic=?').bind(traffic),
  db.prepare(`SELECT COALESCE(NULLIF(e.module,''),'unattributed') module,COUNT(DISTINCT e.visitor) visitors,COUNT(DISTINCT e.session) sessions,SUM(e.kind='click') clicks,SUM(e.kind IN ('page','view')) views,COALESCE(SUM(e.active_ms),0) active_ms FROM analytics_events e WHERE ${where} AND e.kind IN ('page','view','click','heartbeat') GROUP BY COALESCE(NULLIF(e.module,''),'unattributed') ORDER BY active_ms DESC,clicks DESC`).bind(...params),
 ];
 const r=await db.batch(queries),rows=i=>r[i].results||[],summary=rows(0)[0]||{},revisit=rows(7).filter(x=>x.days>1).length,pathRows=rows(8),truncated=pathRows.length>50000||Number(summary.sessions)>2000;
 const engagement=await db.prepare(`SELECT AVG(ms) avg_active_ms,MAX(ms) max_active_ms,AVG(steps) avg_steps,MAX(steps) max_steps FROM (SELECT e.session,SUM(e.active_ms) ms,SUM(e.kind IN ('page','view','click')) steps FROM analytics_events e WHERE ${where} GROUP BY e.session)`).bind(...params).first();
 const counts=Object.fromEntries(rows(2).map(r=>[r.action,r.count]));
 return response({status:'ok',generatedAt:new Date().toISOString(),range,firstCollectedDay:rows(9)[0]?.day||null,summary:{...summary,...engagement,revisit_visitors:revisit},daily:rows(1),modules:rows(10),buttons:rows(2),screens:rows(3),destinations:rows(4).map(x=>({...x,name:PUBLIC_ENTITIES[x.entity]})),devices:rows(5),performance:rows(6),paths:{...summarizePaths(pathRows.slice(0,50000),PUBLIC_ENTITIES),truncated},funnel:[{label:'访问网站',count:summary.sessions||0},{label:'查看目的地灵感',count:counts.search||0},{label:'打开旅行攻略',count:counts.guide||0},{label:'加入行程',count:counts.trip_add||0},{label:'生成行程',count:counts.plan||0}],retention:{multiDayVisitors:revisit,denominator:summary.visitors||0},limits:{retentionDays:90,sessionIdleMinutes:30,heartbeatSeconds:15,idleSeconds:60,identity:'browser',consent:'opt_in'}});
}
export async function analyticsRoute(request,env){
 const path=new URL(request.url).pathname;if(!path.startsWith('/api/analytics/'))return null;
 try{
  if(path==='/api/analytics/collect')return await collect(request,env);
  if(request.method!=='GET')return response({error:'method_not_allowed'},405);
  if(path==='/api/analytics/access')return response({owner:analyticsAdmin(request,env),configured:!!env.DB&&!!env.ANALYTICS_HASH_SALT,signIn:'/signin-with-chatgpt?return_to=%2Finsights'});
  if(path==='/api/analytics/report')return await report(request,env);
  return response({error:'not_found'},404);
 }catch{return response({error:'analytics_unavailable'},503);}
}
