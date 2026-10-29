export const SCREENS={encyclopedia:'旅行百科',home:'首页',weekends:'国内周末游',prices:'机票与酒店查询',guide:'旅行攻略',poi:'景点详情',wishlist:'心愿单',trip:'本次行程',plan:'生成行程',countries:'国家与地区',country:'国家推荐',knowledge:'知识库',places:'我的地点',profile:'出行资料',sources:'照片与来源',about:'关于网站'};
export const ACTIONS={music_open:'打开目的地音乐',quote_open:'打开机酒查询',quote_search:'查询平台报价',quote_copy:'复制机酒查询条件',plan_pdf:'点击下载PDF攻略',search:'查看目的地灵感',scope_all:'查看整个世界',scope_domestic:'查看国内',scope_international:'查看国外',scope:'切换旅行范围',dates:'调整旅行日期',budget:'调整预算',origin:'调整出发地',interest:'调整旅行偏好',destination:'选择目的地',country:'选择国家地区',guide:'打开旅行攻略',poi:'展开景点详情',save:'收藏地点',unsave:'取消收藏',trip_add:'加入本次行程',trip_remove:'移出本次行程',wishlist:'打开心愿单',trip:'打开本次行程',plan:'生成周边行程',plan_export:'导出行程',more:'展开更多推荐',globe_rotate:'旋转地球',globe_zoom:'缩放地球',globe_reset:'复位地球',globe_settings:'地球设置',globe_sound:'转动音效',guide_section:'攻略目录跳转',knowledge:'打开知识库',my:'打开我的',places:'打开我的地点',profile:'打开出行资料',reference:'打开参考链接',help:'查看功能说明',close:'关闭窗口',other_season:'切换景点季节',feedback:'打开用户反馈',filter:'切换列表筛选',globe_ready:'地球加载完成',page_ready:'页面加载完成',page_error:'页面运行异常'};
export const KINDS=new Set(['page','view','click','heartbeat','performance','error']);
export const MODULES={domestic_weekend:'国内周末游',globe:'地球仪',destination_card:'目的地卡片',encyclopedia:'旅行百科',knowledge:'知识库与参考资料',guide:'旅行攻略',quotes:'机票与酒店查询',trip:'本次行程与攻略生成',wishlist:'心愿单',filters:'日期与预算筛选',navigation:'导航',profile:'出行资料',other:'其他功能',unattributed:'未归属（旧数据）'};
export function moduleForScreen(screen){return {weekends:'domestic_weekend',encyclopedia:'encyclopedia',guide:'guide',prices:'quotes',poi:'guide',knowledge:'knowledge',plan:'trip',trip:'trip',wishlist:'wishlist',profile:'profile',places:'profile',countries:'encyclopedia',country:'encyclopedia'}[screen]||'other';}
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const dayInShanghai=at=>new Date(at+8*3600000).toISOString().slice(0,10);
export const REPORT_DAYS=90;
export function deviceClass(width){return width<760?'mobile':width<1100?'tablet':'desktop';}
export function stepLabel(e,entities={}){const label=e.kind==='view'?(SCREENS[e.screen]||'页面'):ACTIONS[e.action]||'进入首页';return label+(e.entity&&entities[e.entity]?' · '+entities[e.entity]:'');}
export function summarizePaths(rows,entities={}){
 const sessions=new Map();
 for(const e of rows){if(!['page','view','click'].includes(e.kind))continue;let s=sessions.get(e.session);if(!s){s={session:e.session,steps:[],day:e.day};sessions.set(e.session,s);}const label=stepLabel(e,entities);s.steps.push(label);}
 const all=[...sessions.values()],longest=all.sort((a,b)=>b.steps.length-a.steps.length).slice(0,8);
 const common=new Map();for(const s of all){const steps=s.steps.filter((x,i)=>i===0||x!==s.steps[i-1]);const key=JSON.stringify(steps);const value=common.get(key)||{steps,count:0};value.count++;common.set(key,value);}
 return {longest,common:[...common.values()].sort((a,b)=>b.count-a.count||b.steps.length-a.steps.length).slice(0,8)};
}
