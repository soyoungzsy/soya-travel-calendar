// Explicit maintainer command; never runs during build or a visitor's session.
import fs from 'node:fs';
const policy=JSON.parse(fs.readFileSync('src/knowledge-index-meta.json','utf8'));
if(!policy.enabled||policy.rightsStatus!=='cleared'||!policy.approvalReference)throw new Error('Dataset republication permission is unresolved. No data was fetched or public snapshot changed.');
const base='https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001';
const metadata=await readJSON(base),m=metadata.metas?.default;
if(m?.publisher!=='UNESCO'||m?.license!=='CC BY-SA 4.0')throw new Error('Publisher/license changed; keep the existing index and review terms manually.');
const allowed='id_no,name_en,name_zh,category,iso_codes,coordinates,date_inscribed';
const records=await readJSON(base+'/exports/json?select='+encodeURIComponent(allowed));
if(!Array.isArray(records)||records.length<1000||records.length!==m.records_count)throw new Error('Incomplete export; existing snapshot was not changed.');
const plain=value=>String(value||'').replace(/<[^>]+>/g,'').replaceAll('&amp;','&').trim();
const seen=new Set();
const items=records.map(r=>{
 const sourceId=String(r.id_no);if(!/^\d+$/.test(sourceId)||seen.has(sourceId))throw new Error('Invalid or duplicate source id');seen.add(sourceId);
 const c=r.coordinates,coord=c&&Number.isFinite(c.lon)&&Number.isFinite(c.lat)&&Math.abs(c.lon)<=180&&Math.abs(c.lat)<=90?[c.lon,c.lat]:null;
 return{id:'wh:'+sourceId,sourceId,name:plain(r.name_zh||r.name_en),nameEn:plain(r.name_en),category:{Natural:'nature',Cultural:'culture',Mixed:'mixed'}[r.category]||'mixed',countryCodes:(r.iso_codes||'').split(',').map(x=>x.trim().toUpperCase()).filter(x=>/^[A-Z]{2}$/.test(x)),coord,inscribedYear:String(r.date_inscribed||''),sourceURL:'https://whc.unesco.org/en/list/'+sourceId+'/',recordKind:'heritage-index',seasonality:{mode:'unknown',note:'入遗年份不是建造年代；旅行季节、开放与费用尚未核验。'}};
});
const fetchedAt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const meta={provider:'UNESCO DataHub',dataset:'whc001',license:m.license,licenseURL:m.license_url,attribution:'UNESCO',sourceURL:'https://data.unesco.org/explore/dataset/whc001/',apiURL:base,sourceModifiedAt:m.modified,fetchedAt,records:items.length,countryCodes:new Set(items.flatMap(x=>x.countryCodes)).size,usageBoundary:'Factual name/category/country/coordinate/inscription index only; no descriptions or media copied. DataHub license and legacy WHC syndication guidance differ; no full-text mirror is authorized by this implementation.'};
fs.mkdirSync('.checks/knowledge-backup',{recursive:true});
const file='public/data/heritage-index.json';if(fs.existsSync(file))fs.copyFileSync(file,'.checks/knowledge-backup/heritage-index.before-refresh.json');
fs.writeFileSync(file,JSON.stringify({metadata:meta,items})+'\n');fs.writeFileSync('src/knowledge-index-meta.json',JSON.stringify(meta,null,2)+'\n');
console.log(`Prepared ${items.length} factual records. Review the diff, run tests and publish separately; no photos/full text were imported.`);
async function readJSON(url){const response=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Official source unavailable: HTTP '+response.status);return response.json();}
