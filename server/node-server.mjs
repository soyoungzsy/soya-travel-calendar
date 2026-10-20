import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import worker from '../worker/index.js';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.wasm':'application/wasm','.gz':'application/gzip','.woff2':'font/woff2','.ttf':'font/ttf'};
export function createAssetBinding(directory){
 const root=resolve(directory),canonicalRoot=realpath(root).catch(()=>null);
 return {async fetch(request){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  let name;try{name=decodeURIComponent(new URL(request.url).pathname);}catch{return new Response('Bad path',{status:400});}
  if(name.includes('\\')||name.split('/').some(s=>s.startsWith('.')))return new Response('Not found',{status:404});
  const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+sep))return new Response('Not found',{status:404});
  try{const actual=await realpath(file),base=await canonicalRoot;if(!base||!actual.startsWith(base+sep))return new Response('Not found',{status:404});const info=await stat(actual);if(!info.isFile())return new Response('Not found',{status:404});
   const immutable=/\/(assets|photos|moments|points|poi|textures|ocr)\//.test(name),headers={'content-type':types[extname(actual).toLowerCase()]||'application/octet-stream','cache-control':immutable?'public, max-age=86400':'no-cache','x-content-type-options':'nosniff'};
   return new Response(request.method==='HEAD'?null:await readFile(actual),{headers});
  }catch{return new Response('Not found',{status:404});}
 }};
}

export function createServer({directory=resolve('dist/client'),fetchHandler=worker.fetch}={}){
 const env={ASSETS:createAssetBinding(directory)};
 const server=http.createServer(async(req,res)=>{
  const priceWrite=req.method==='POST'&&req.url?.split('?')[0]==='/api/travel-search/search';
  if(!['GET','HEAD'].includes(req.method)&&!priceWrite){req.resume();res.writeHead(405,{'allow':'GET, HEAD'});res.end('Method not allowed');return;}
  try{let body;if(priceWrite){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>2048){res.writeHead(413);res.end('Query too large');return;}chunks.push(chunk);}body=Buffer.concat(chunks);}
   const request=new Request(new URL(req.url,`http://127.0.0.1:${server.address().port}`),{method:req.method,headers:req.headers,...(body?{body}: {})}),response=await fetchHandler(request,env);
   res.writeHead(response.status,Object.fromEntries(response.headers));if(req.method==='HEAD'){res.end();return;}res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'content-type':'text/plain; charset=utf-8'});res.end('Service temporarily unavailable');}
 });
 server.requestTimeout=30000;server.headersTimeout=10000;server.maxHeadersCount=100;return server;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||8080),server=createServer({directory:process.env.STATIC_DIRECTORY||resolve('dist/client')});
 server.listen(port,host,()=>console.log(`Travel calendar listening on http://${host}:${port}`));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
