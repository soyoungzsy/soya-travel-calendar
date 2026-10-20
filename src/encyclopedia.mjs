import {destinations} from './data.mjs';
import {directoryCountries,poiRecords,variantsFor} from './knowledge.mjs';
const continents={Asia:'亚洲',Europe:'欧洲',Africa:'非洲','North America':'北美洲','South America':'南美洲',Oceania:'大洋洲',Antarctica:'南极洲'};
export function makeEncyclopedia({places=destinations,points=poiRecords,regions=directoryCountries}={}){
 const grouped=new Map(),parent=new Map(places.map(d=>[d.id,d]));
 function regionFor(name,code){return regions.find(c=>code?c.iso2===code:c.nameZh===name)||{id:name,nameZh:name,nameEn:name,continent:name==='南极洲'?'Antarctica':'Other'};}
 function cityFor(region,name){let record=grouped.get(region.id);if(!record){record={...region,nameZh:region.iso2==='HK'?'中国·香港':region.nameZh,cities:[],continents:[continents[region.continent]||'其他地区']};if(['RU','TR'].includes(region.iso2))record.continents=['欧洲','亚洲'];grouped.set(region.id,record);}let city=record.cities.find(c=>c.name===name);if(!city){city={id:region.id+'|'+name,name,regionId:region.id,destinations:[],points:[]};record.cities.push(city);}return city;}
 for(const d of places){const region=regionFor(d.country,d.regionCode),city=cityFor(region,d.name);city.destinations.push(d);}
 for(const p of points){const d=parent.get(p.parentId),region=regionFor(p.country,p.regionCode),city=cityFor(region,p.city||d?.name||region.nameZh);if(!city.points.some(x=>x.id===p.id))city.points.push(p);}
 const result=[...grouped.values()].map(c=>({...c,cities:c.cities.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')),pointCount:c.cities.reduce((n,x)=>n+x.points.length,0),destinationCount:c.cities.reduce((n,x)=>n+x.destinations.length,0)})).sort((a,b)=>a.nameZh.localeCompare(b.nameZh,'zh-CN'));
 return {countries:result,continents:[...new Set(result.flatMap(c=>c.continents))].sort((a,b)=>['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲','其他地区'].indexOf(a)-['亚洲','欧洲','非洲','北美洲','南美洲','大洋洲','南极洲','其他地区'].indexOf(b)),counts:{countries:result.length,cities:result.reduce((n,c)=>n+c.cities.length,0),destinations:places.length,points:new Set(points.map(p=>p.id)).size}};
}
export const encyclopedia=makeEncyclopedia();
export function encyclopediaPoints(city,category='all'){return (city?.points||[]).filter(p=>category==='all'||p.category===category||p.category==='mixed').map(p=>({...variantsFor(p)[0],seasonSummary:p.variants?.map(v=>v.label||v.name||v.key).join(' / ')}));}
