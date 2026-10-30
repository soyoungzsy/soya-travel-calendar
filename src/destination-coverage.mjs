import {destinations} from './data.mjs';
import {allPOICards} from './knowledge.mjs';

// Editorial triage, not proof that every source has been researched. Short text
// and a repeated seasonal lead are flags for review, not an automatic verdict.
export function auditDestinationCoverage({places=destinations,points=allPOICards}={}){
 const rows=places.map(d=>{
  const overview=d.profile?.intro||d.description||'',related=points.filter(p=>p.parentId===d.id||p.relatedDestinationIds?.includes(d.id));
  const missingOverview=!overview.trim(),shortOverview=!missingOverview&&overview.trim().length<45,reusesSeasonLead=!!d.whyNow&&overview===d.whyNow;
  const background=d.profile?.stories?.some(s=>s.title?.trim()&&s.text?.trim())||related.some(p=>p.originalUse?.trim()||p.peopleEvents?.trim()||p.historySignificance?.trim());
  return {id:d.id,name:d.name,country:d.country,overviewCharacters:overview.length,missingOverview,shortOverview,reusesSeasonLead,hasDestinationProfile:!!d.profile,hasRecordedBackground:!!background,points:related.length,missingPointText:related.filter(p=>!p.name?.trim()||!p.whyGo?.trim()).map(p=>p.id),needsOverviewReview:missingOverview||shortOverview||reusesSeasonLead,needsBackgroundReview:!background};
 });
 const grouped=new Map();for(const row of rows){const key=row.country+'|'+row.name;if(!grouped.has(key))grouped.set(key,{name:row.name,country:row.country,cards:[]});grouped.get(key).cards.push(row);}
 return {rows,places:[...grouped.values()],counts:{destinationCards:rows.length,destinations:grouped.size,missingOverview:rows.filter(r=>r.missingOverview).length,shortOverview:rows.filter(r=>r.shortOverview).length,reusesSeasonLead:rows.filter(r=>r.reusesSeasonLead).length,needsOverviewReview:rows.filter(r=>r.needsOverviewReview).length,needsBackgroundReview:rows.filter(r=>r.needsBackgroundReview).length,withoutPoints:rows.filter(r=>!r.points).length,missingPointText:rows.reduce((n,r)=>n+r.missingPointText.length,0)}};
}
