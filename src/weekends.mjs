import {allPOICards,matchesPOISeason} from './knowledge.mjs';
import {addDays,parseDate,tripDays} from './engine.mjs';
export const WEEKEND_TYPES={all:'全部体验',ancient_town:'古镇与街巷',museum:'展览与博物馆',island:'岛屿与海岸',nature:'山水与步道',culture:'人物与文化'};
export const weekendExperiences=allPOICards.filter(p=>p.weekend);
export const weekendOrigins=[...new Set(weekendExperiences.flatMap(p=>Object.keys(p.weekend.originPlans)))].sort((a,b)=>Number(['杭州','上海'].includes(b))-Number(['杭州','上海'].includes(a))||a.localeCompare(b,'zh-CN'));
export function nextWeekend(today){const at=parseDate(today),weekday=new Date(at).getUTCDay();return addDays(today,(6-weekday+7)%7);}
export function weekendCandidates({origin,start,days=2,type='all',includeConditional=true}={}){
 if(!weekendOrigins.includes(origin)||![1,2].includes(days)||!Number.isFinite(parseDate(start)))return[];
 const end=addDays(start,days-1),dates=Array.from({length:days},(_,i)=>addDays(start,i));
 return weekendExperiences.filter(p=>{
  const min=p.weekend.originPlans[origin];if(!min||min>days||type!=='all'&&p.weekend.type!==type)return false;
  if(!includeConditional&&p.weekend.conditionalTransport)return false;
  if(!matchesPOISeason(p,start,end))return false;
  // A known weekly closure excludes an all-closed selection. Holiday exceptions
  // require the museum's dated announcement, never an invented opening override.
  if(dates.every(date=>p.weekend.closedWeekdays?.includes(new Date(parseDate(date)).getUTCDay())))return false;
  return true;
 }).map(p=>({...p,weekendPlan:{origin,start,end,days:tripDays(start,end),local:p.city===origin,minDays:p.weekend.originPlans[origin],nights:days-1,transportVerified:p.weekend.transportVerified===true,doorToDoorHours:p.weekend.doorToDoorHours??null}}))
 .sort((a,b)=>Number(b.weekendPlan.local)-Number(a.weekendPlan.local)||Number(a.weekend.conditionalTransport===true)-Number(b.weekend.conditionalTransport===true)||a.weekendPlan.minDays-b.weekendPlan.minDays);
}
