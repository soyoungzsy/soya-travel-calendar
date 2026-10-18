import {inSeason,parseDate,DAY} from './engine.mjs';
export function nextSeasonDistance(destination,date){
 if(inSeason(destination,date))return 0;const year=Number(date.slice(0,4)),from=parseDate(date);
 return Math.min(...destination.windows.map(([start])=>{let next=parseDate(year+'-'+start);if(next<from)next=parseDate((year+1)+'-'+start);return Number.isFinite(next)?(next-from)/DAY:Infinity;}));
}
export function mapCityRepresentatives(places,{selectedId,activeIds=[],date}){
 const grouped=new Map(),active=new Set(activeIds);
 for(const place of places){const key=place.country+'|'+place.name,previous=grouped.get(key);if(!previous){grouped.set(key,place);continue;}if(previous.id===selectedId)continue;if(place.id===selectedId||active.has(place.id)&&!active.has(previous.id)||active.has(place.id)===active.has(previous.id)&&nextSeasonDistance(place,date)<nextSeasonDistance(previous,date))grouped.set(key,place);}
 return [...grouped.values()];
}
