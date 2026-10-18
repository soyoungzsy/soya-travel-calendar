import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist/client');
const entry=fs.readdirSync(path.join(root,'assets')).find(x=>x.endsWith('.js'));
const style=fs.readdirSync(path.join(root,'assets')).find(x=>x.endsWith('.css'));
const esc=s=>s.replaceAll('</script','<\\/script');
const vendors=[];
let js=fs.readFileSync(path.join(root,'assets',entry),'utf8');
const media=JSON.parse(fs.readFileSync('src/media.json','utf8'));
// The portable download uses existing 960px derivatives; hosted photos stay full size.
const portablePhotos=new Map(Object.values(media.photos).map(p=>[p.src,p.thumbnail||p.src]));
const urls=new Set();function collect(value){if(typeof value==='string'&&/^\/(photos|textures|moments)\//.test(value))urls.add(value);else if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object')Object.values(value).forEach(collect);}collect(media);
for(const url of [...urls].sort((a,b)=>b.length-a.length)){const file=portablePhotos.get(url)||url,ext=path.extname(file).slice(1),mime=ext==='jpg'?'jpeg':ext,data='data:image/'+mime+';base64,'+fs.readFileSync(path.join(root,file)).toString('base64');js=js.replaceAll(url,data);}
const css=fs.readFileSync(path.join(root,'assets',style),'utf8');
const fragment='<div id="journey-atlas-root"></div>\n<style>'+css+'</style>\n'+vendors.map(s=>'<script>'+esc(s)+'</script>').join('\n')+'\n<script>globalThis.__SHANHE_PORTABLE__=true;(()=>{\n'+esc(js)+'\n})();</script>';
const licenseFiles=['LICENSE','THIRD_PARTY_NOTICES.md',...fs.readdirSync('licenses').map(name=>'licenses/'+name)];
const legal=licenseFiles.map(file=>file+'\n'+fs.readFileSync(file,'utf8')).join('\n\n');
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山河有期｜全球旅行目的地年历</title><script type="text/plain" id="license-notices">'+esc(legal)+'</script></head><body>'+fragment+'</body></html>';
const output=path.resolve(process.argv[2]||'dist/山河有期.html');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,html);
console.log('Offline prototype: '+output);
