import original from './official-sources.json' with {type:'json'};
import additions from './season-additions-v10.json' with {type:'json'};
export default [...original,...additions.officialSources];
