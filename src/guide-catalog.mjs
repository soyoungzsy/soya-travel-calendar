import original from './travel-guides.json' with {type:'json'};
import additions from './season-additions-v10.json' with {type:'json'};
import excerpts from './official-excerpts-v10.json' with {type:'json'};
const guides={...original,...additions.guides};
for(const d of additions.destinations){const excerpt=excerpts.find(e=>e.destination.startsWith(d.name));if(excerpt)guides[d.id]={...guides[d.id],officialExcerpt:excerpt};}
export default guides;
