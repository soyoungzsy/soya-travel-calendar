const baikalMusic=Object.freeze({title:'贝加尔湖畔',creator:'李健',kind:'official-performance-link',provider:'央视网',url:'https://tv.cctv.com/2026/02/23/VIDEVmajuPUbcc68dO4bsCPO260223.shtml',checkedAt:'2026-10-29',relation:'与目的地相关的歌曲；不推定创作或录制发生在当地'});
export function musicFor(destination){return ['baikal-summer-shores','baikal-winter-ice'].includes(destination?.id)?baikalMusic:null;}
