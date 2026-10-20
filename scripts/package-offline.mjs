import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {build} from 'vite';
import {fileURLToPath} from 'node:url';
export async function createOfflineHTML(outputPath){
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'shanhe-portable-'));
try{
await build({publicDir:false,build:{outDir:temporary,rollupOptions:{output:{inlineDynamicImports:true}},modulePreload:false}});
const root=path.resolve('dist/client'),bundleRoot=temporary;
const index=fs.readFileSync(path.join(bundleRoot,'index.html'),'utf8');
const entry=index.match(/<script[^>]+src="([^"]+)"/)[1].replace(/^\//,'');
const styles=[...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1].replace(/^\//,''));
const esc=s=>s.replaceAll('</script','<\\/script');
const vendors=[];
let js=fs.readFileSync(path.join(bundleRoot,entry),'utf8');
const media=JSON.parse(fs.readFileSync('src/media.json','utf8'));
const pointPhotos=JSON.parse(fs.readFileSync('src/poi-media.json','utf8'));
// The portable download uses existing 960px derivatives; hosted photos stay full size.
const portablePhotos=new Map(Object.values(media.photos).map(p=>[p.src,p.thumbnail||p.src]));
const urls=new Set();function collect(value){if(typeof value==='string'&&/^\/(photos|textures|moments|points|poi|food|season)\//.test(value))urls.add(value);else if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object')Object.values(value).forEach(collect);}collect(media);collect(pointPhotos);for(const name of ['food-media-v10.json','season-media-v10.json'])collect(JSON.parse(fs.readFileSync('src/'+name,'utf8')));
for(const url of [...urls].sort((a,b)=>b.length-a.length)){const file=portablePhotos.get(url)||url,ext=path.extname(file).slice(1),mime=ext==='jpg'?'jpeg':ext,data='data:image/'+mime+';base64,'+fs.readFileSync(path.join(root,file)).toString('base64');js=js.replaceAll(url,data);}
const css=styles.map(file=>fs.readFileSync(path.join(bundleRoot,file),'utf8')).join('\n');
const heritagePath=path.join(root,'data/heritage-index.json'),heritage=fs.existsSync(heritagePath)?fs.readFileSync(heritagePath,'utf8'):'null';
const fragment='<div id="journey-atlas-root"></div>\n<style>'+css+'</style>\n'+vendors.map(s=>'<script>'+esc(s)+'</script>').join('\n')+'\n<script>globalThis.__SHANHE_PORTABLE__=true;globalThis.__SHANHE_HERITAGE__='+esc(heritage)+';(()=>{\n'+esc(js)+'\n})();</script>';
const licenseFiles=['LICENSE','THIRD_PARTY_NOTICES.md',...fs.readdirSync('licenses').map(name=>'licenses/'+name)];
const legal=licenseFiles.map(file=>file+'\n'+fs.readFileSync(file,'utf8')).join('\n\n');
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山河有期｜全球旅行目的地年历</title><script type="text/plain" id="license-notices">'+esc(legal)+'</script></head><body>'+fragment+'</body></html>';
const output=path.resolve(outputPath||'dist/山河有期.html');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,html);
console.log('Offline prototype: '+output);

return output;
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await createOfflineHTML(process.argv[2]);
