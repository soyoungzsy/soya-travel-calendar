import foodProfiles from './food-catalog.json' with {type:'json'};
import readingPacks from './reading-catalog.json' with {type:'json'};

export {foodProfiles,readingPacks};
export function foodFor(destination){
 return foodProfiles.find(p=>p.destinationIds.includes(destination.id))||null;
}
export function readingFor(destination){
 return readingPacks.find(p=>p.destinationIds.includes(destination.id))||null;
}
export const readingType={article:'先读一篇',book:'读一本书',documentary:'看一部纪录片',person:'认识一个人'};
