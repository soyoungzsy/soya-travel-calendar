export const PERSONAL_KEY='shanhe-youqi-personal-v1';
export const MAX_PLACES=500;
const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const id=()=>`personal-${globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}`;
export const placeKey=p=>`${p.country}|${p.name}`.normalize('NFKC').replace(/\s+/g,'').toLocaleLowerCase();
export function normalizePlace(raw,now=new Date().toISOString()){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('每个地点需要是一条完整记录');
 const name=text(raw.name,80),country=text(raw.country,80),notes=text(raw.notes,2000),sourceURL=text(raw.sourceURL,2048);
 if(!name||!country)throw new Error('请填写地点名称和国家或地区');
 if(sourceURL){let url;try{url=new URL(sourceURL);}catch{throw new Error('来源链接需要是完整的 http 或 https 网址');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('来源链接只接受不含账号密码的 http 或 https 网址');}
 let coord=null;
 if(raw.coord!=null){if(!Array.isArray(raw.coord)||raw.coord.length!==2||raw.coord.some(n=>typeof n!=='number'||!Number.isFinite(n))||Math.abs(raw.coord[0])>180||Math.abs(raw.coord[1])>90)throw new Error('经度范围为-180到180，纬度范围为-90到90');coord=[...raw.coord];}
 const months=raw.months??[];if(!Array.isArray(months)||months.length>12||months.some(n=>!Number.isInteger(n)||n<1||n>12))throw new Error('适合月份应为1至12的数字');
 const status=['want','planned','visited'].includes(raw.status)?raw.status:'want';
 return{id:/^personal-[a-zA-Z0-9_-]{1,80}$/.test(raw.id||'')?raw.id:id(),name,country,notes,sourceURL,coord,months:[...new Set(months)].sort((a,b)=>a-b),status,createdAt:typeof raw.createdAt==='string'&&Number.isFinite(Date.parse(raw.createdAt))?raw.createdAt:now,updatedAt:now};
}
export function parseImport(input){
 if(typeof input!=='string'||new TextEncoder().encode(input).length>2*1024*1024)throw new Error('请选择不超过2MB的JSON清单');
 let data;try{data=JSON.parse(input);}catch{throw new Error('文件不是有效JSON，请使用本项目导出的清单或示例文件');}
 if(data?.format!=='shanhe-youqi-places'||data.version!==1||!Array.isArray(data.places))throw new Error('清单格式不匹配，请使用山河有期v1地点清单');
 if(data.places.length>MAX_PLACES)throw new Error(`一次最多导入${MAX_PLACES}个地点`);
 return data.places.map((p,i)=>{try{return normalizePlace(p);}catch(e){throw new Error(`第${i+1}条：${e.message}`);}});
}
export function mergePlaces(existing,incoming){
 const next=[...existing],keys=new Set(existing.map(placeKey)),ids=new Set(existing.map(p=>p.id));let skipped=0;
 for(const p of incoming){if(keys.has(placeKey(p))){skipped++;continue;}const place=ids.has(p.id)?{...p,id:id()}:p;next.push(place);keys.add(placeKey(place));ids.add(place.id);}
 if(next.length>MAX_PLACES)throw new Error(`清单最多保存${MAX_PLACES}个地点，请先整理或分开备份`);
 return{places:next,added:next.length-existing.length,skipped};
}
export function exportPlaces(places){return JSON.stringify({format:'shanhe-youqi-places',version:1,exportedAt:new Date().toISOString(),places:places.map(p=>normalizePlace(p,p.updatedAt||new Date().toISOString()))},null,2);}
export function readPersonal(storage){try{const raw=storage.getItem(PERSONAL_KEY);return raw?{places:parseImport(raw),error:''}:{places:[],error:''};}catch{return{places:[],error:'已有清单暂时无法读取，请先导出或保留原文件，勿直接清空浏览器数据。'};}}
export function writePersonal(storage,places){try{storage.setItem(PERSONAL_KEY,exportPlaces(places));}catch{throw new Error('浏览器无法保存清单，请允许此网站存储数据，或先导出备份');}}
export function personalMapPoints(places,scope='all'){return places.filter(p=>p.coord&&(scope==='all'||(scope==='domestic')===(p.country==='中国'))).map(p=>({...p,personal:true,domestic:p.country==='中国',subtitle:p.notes||'我的旅行灵感',season:p.months.length?p.months.join('、')+'月':'适合月份待补充'}));}
