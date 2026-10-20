import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import worker from './worker/index.js';
const referenceDataPreview={name:'reference-data-preview',configureServer(server){server.middlewares.use(async(req,res,next)=>{if(!/^\/api\/(?:fx|interest|travel-search\/status)(\?|$)/.test(req.url||''))return next();try{const response=await worker.fetch(new Request('http://localhost'+req.url),{});res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(await response.text());}catch{res.statusCode=503;res.setHeader('content-type','application/json');res.end('{"status":"source_unavailable","rates":{}}');}});}};
export default defineConfig({build:{outDir:'dist/client',modulePreload:false,manifest:true},optimizeDeps:{include:['react','react-dom/client']},server:{host:'127.0.0.1',allowedHosts:['terminal.local'],warmup:{clientFiles:['./src/main.jsx']}},plugins:[react(),referenceDataPreview]});
