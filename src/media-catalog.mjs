import original from './media.json' with {type:'json'};
import seasons from './season-media-v10.json' with {type:'json'};
export default {...original,photos:{...original.photos,...seasons.photos}};
