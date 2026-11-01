import http from 'node:http';
import {spawn} from 'node:child_process';
import {timingSafeEqual} from 'node:crypto';
import {resolve} from 'node:path';
import {validatePriceQuery,normalizeQuotes} from '../../worker/travel-search.mjs';
const key=process.env.FLYAI_API_KEY,token=process.env.BRIDGE_TOKEN;
if(!key||!token||token.length<32)throw Error('Missing service secrets');
let active=0,calls=0,day='';
http.createServer(async(req,res)=>{
 const send=(code,data)=>{res.writeHead(code,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
 if(req.method==='GET'&&req.url==='/health')return send(200,{status:'ok'});
 if(req.url!=='/query'||req.method!=='POST')return send(404,{status:'not_found'});
 const auth=req.headers.authorization||'',expected='Bearer '+token;
 if(Buffer.byteLength(auth)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(auth),Buffer.from(expected)))return send(403,{status:'forbidden'});
 if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{status:'invalid_query'});
 let raw='',q;try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>2048)return send(413,{status:'invalid_query'});}q=JSON.parse(raw);}catch{return send(400,{status:'invalid_query'});}
 if(validatePriceQuery(q))return send(400,{status:'invalid_query'});
 if(q.flexDays)return send(422,{status:'flex_not_verified'});
 const today=new Date().toISOString().slice(0,10);if(day!==today){day=today;calls=0;}
 if(calls>=30||active>=2)return send(429,{status:'rate_limited'});
 calls++;active++;
 const args=q.kind==='flight'?['search-flight','--origin',q.origin,...(q.destination?['--destination',q.destination]:[]),'--dep-date',q.start]:['search-hotels','--dest-name',q.destination,'--check-in-date',q.start,'--check-out-date',q.end];
 const child=spawn(process.execPath,[resolve('deploy/flyai/node_modules/@fly-ai/flyai-cli/dist/flyai-bundle.cjs'),...args],{env:{...process.env,FLYAI_API_KEY:key},stdio:['ignore','pipe','pipe'],shell:false});
 let output='',done=false;const finish=(code,data)=>{if(done)return;done=true;clearTimeout(timer);active--;send(code,data);};
 const timer=setTimeout(()=>{child.kill();finish(504,{status:'provider_timeout'});},25000);
 child.stdout.on('data',b=>{output+=b;if(output.length>2000000){child.kill();finish(502,{status:'provider_response_limit'});}});
 child.stderr.on('data',()=>{});
 child.on('error',()=>finish(503,{status:'provider_process_error'}));
 child.on('close',code=>{if(done)return;if(code!==0)return finish(503,{status:'provider_unavailable'});try{const data=JSON.parse(output);output='';if(data.status!==0)return finish(503,{status:'provider_unavailable'});finish(200,normalizeQuotes(data,q));}catch{finish(502,{status:'provider_contract'});}});
}).listen(Number(process.env.PORT||8080),'0.0.0.0');
