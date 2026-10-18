import { destinations, TODAY } from './data.mjs';
import guides from './travel-guides.json' with {type:'json'};
export const DAY=86400000;
export const parseDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return NaN;const n=Date.parse(s+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s?n:NaN;};
export const iso=n=>new Date(n).toISOString().slice(0,10);
export const addDays=(s,n)=>iso(parseDate(s)+n*DAY);
export const tripDays=(start,end)=>Math.round((parseDate(end)-parseDate(start))/DAY)+1;
export const money=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:0}).format(Math.round(n));
export function validate(start,end,budget){const n=tripDays(start,end);if(!Number.isFinite(n))return'请填写有效的出发和返程日期';if(n<1)return'返程日期应晚于或等于出发日期';if(n>60)return'原型支持最长60天的行程，请缩小日期范围';if(start<TODAY)return'请选择今天或之后的旅行日期';if(!Number.isFinite(+budget)||+budget<500)return'请填写不少于500元的每人全程预算';return'';}
export function inSeason(d,date){const md=date.slice(5);return d.windows.some(([a,b])=>a<=b?md>=a&&md<=b:md>=a||md<=b);}
export function estimate(d,n,liveRates={}){
 const g=guides[d.id],billed=Math.max(1,n-d.travelDays+1),landDays=d.id==='antarctica'?Math.max(3,n-17):billed,nights=d.id==='antarctica'?Math.max(1,landDays-1):Math.max(1,n-1-(d.overnightTravelNights??Math.max(0,d.travelDays-2))),rate=liveRates?.[g?.money?.currency||d.currency]?.rateCNY||g?.money?.rateCNY||1,room=g?.stay?.roomLocal,nightly=room?(room[0]+room[1])/2*rate/2:d.daily*.45;
 const flight=d.flight,stay=Math.round(nights*nightly/100)*100,food=Math.round(landDays*d.daily*.2/100)*100,local=Math.round(landDays*d.daily*.17/100)*100,activities=Math.round(landDays*d.daily*.18/100)*100+d.extra,total=flight+stay+food+local+activities;
 return{total,low:Math.floor(total*.85/100)*100,high:Math.ceil(total*1.25/100)*100,flight,stay,food,local,activities,nights,hotelPerPersonNight:Math.round(nightly)};
}
export function getCandidates({start,end,budget,scope='all',interest='balanced',ignoreBudget=false,liveRates={},origin=''}){
 if(validate(start,end,budget))return[];const n=tripDays(start,end);
 return destinations.map(d=>{let overlap=0;for(let i=0;i<n;i++)if(inSeason(d,addDays(start,i)))overlap++;const cost=estimate(d,n,liveRates);const preference=interest==='nature'?d.nature:interest==='culture'?1-d.nature:1-Math.abs(d.nature-.5);return{...d,overlap,cost,fit:overlap/n*.55+preference*.17+Math.exp(-Math.abs(n-(d.minDays+3))/(d.minDays+4))*.22+(1-Math.min(cost.total/(+budget||1),1))*.06};})
 .filter(d=>(!origin||d.name!==origin)&&d.overlap>=Math.min(3,n)&&n>=d.minDays&&(ignoreBudget||d.cost.total<=budget)&&(scope==='all'||(scope==='domestic'?d.domestic:!d.domestic)))
 .sort((a,b)=>b.fit-a.fit);
}
export function makeItinerary(d,start,end,pace='balanced',origin='出发城市'){
 const n=tripDays(start,end);if(!Number.isFinite(n)||n<d.minDays)throw new Error('行程天数不足');const g=guides[d.id],travel=Math.min(d.travelDays,n-1),out=Math.ceil(travel/2),back=Math.floor(travel/2),available=n-travel,days=[],stages=[];
 for(let i=0;i<out;i++)days.push({title:i===0?`从${origin}启程`:'抵达、入境与接驳',place:i===0?origin:(g?.route?.airports||d.airports||[d.stops[0][0]]).join(' / '),detail:i===0?`预订前比较${(g?.route?.airports||d.airports||[]).join('、')}的完整航线、行李与退改规则。`:(g?.route?.flightPlan||[]).join(' '),kind:'交通',morning:i===0?(d.domestic?'按已确认的列车或航班出发，核对车站、机场与接驳。':'按实际航班办理值机，确认行李是否直挂。'):'完成必要入境与行李手续，按实际落地时间安排接驳。',afternoon:i===0?'联程优先比较总耗时与中转条件，不只比较票面价格。':(g?.route?.transfer||[]).join(' '),evening:d.domestic?'按实际抵达时间安排接驳与入住，当天不绑定不可取消的重点项目。':'按航班时刻休息；当天不绑定不可取消的重点体验。',tip:'交通日的早午晚仅表示准备顺序，确认航班后按当地时间重排。'});
 if(d.id==='antarctica'){
  const pre=Math.max(2,available-12),ship=11,post=available-pre-ship;
  let first=days.length+1;for(let i=0;i<pre;i++)days.push({title:i===0?'乌斯怀亚抵达与休整':'登船准备与航次说明',place:'乌斯怀亚',kind:'准备',morning:'在港口城市休整，按船方要求确认报到地点。',afternoon:'核对装备、行李标签与应急联系，完成生物安全准备。',evening:'关注船方通知，留足睡眠。',detail:'不安排落地即登船。',tip:'具体抵达缓冲与医疗材料以所选船方要求为准。'});stages.push({name:'乌斯怀亚',from:first,to:days.length,days:pre});
  first=days.length+1;for(let i=0;i<ship;i++)days.push({title:`南极航次 · 第${i+1}天`,place:'所选船方实际航线',kind:'航次',morning:'依船方当日航行与安全简报，安排海上观察或许可活动。',afternoon:'若海冰、天气、保护规定允许，参与船方组织的登陆或冲锋艇活动；不能登陆时留在船上观景。',evening:'自然讲解、航程回顾与下一日简报。',detail:'11天仅为示例航次长度，不是已确认船票。',tip:'不要按此草案独立预订固定登陆点；实际行程与航次长度必须用船票替换。'});stages.push({name:'南极半岛航次',from:first,to:days.length,days:ship});
  if(post>0){first=days.length+1;for(let i=0;i<post;i++)days.push({title:'离船与返程缓冲',place:'乌斯怀亚',kind:'弹性',morning:'按船方安排离船并领取行李。',afternoon:'预留天气与港口衔接变化，不紧接不可退国际航班。',evening:'在港口城市休整。',detail:'根据实际航次调整。'});stages.push({name:'乌斯怀亚',from:first,to:days.length,days:post});}
 }else{
  let modules=(g?.route?.modules||d.stops.map(s=>({name:s[0],days:2,stops:s[1].split('|'),logic:'以同一区域为主，留出交通与休息。'}))).filter(m=>!m.name.includes('沙漠'));
  if(d.id==='kyoto-autumn')modules=[{name:'京都·东山',days:3,stops:['清水寺','南禅寺','永观堂'],logic:'东山南北分两天，留一段河岸与街巷。'},{name:'京都·岚山',days:1,stops:['渡月桥','常寂光寺'],logic:'西侧独立一天，以铁路和步行为主。'},{name:'宇治',days:1,stops:['宇治川','平等院','茶体验'],logic:'从京都日归，保留同一家酒店。'}];
  if(pace==='slow')modules=modules.slice(0,2);else modules=modules.slice(0,3);
  const chosen=[modules[0]],counts=[Math.min(available,Math.max(1,modules[0].days))];let remain=available-counts[0];for(const m of modules.slice(1)){if(remain>=m.days){chosen.push(m);counts.push(m.days);remain-=m.days;}}for(let i=0;remain>0;i++,remain--)counts[i%counts.length]++;
  const used=new Set();chosen.forEach((m,j)=>{const first=days.length+1,tokens=m.stops.flatMap(t=>t.split(/[、/·（）()\s]+/)).filter(t=>t.length>=2);let ideas=(g?.dayIdeas||[]).map((idea,index)=>({idea,index,score:tokens.reduce((sum,t)=>sum+((idea.title+idea.morning+idea.afternoon).includes(t)?1:0),0)})).filter(x=>x.score>0&&!used.has(x.index));
   if(d.id==='jiuzhaigou-lakes')ideas=(available===1?[0]:[1,2]).map(index=>({idea:g.dayIdeas[index],index}));
   if(d.id==='marrakech')ideas=(g?.dayIdeas||[]).map((idea,index)=>({idea,index})).filter(x=>j===0?!x.idea.title.includes('索维拉'):x.idea.title.includes('索维拉'));
   if(!ideas.length&&j===0)ideas=(g?.dayIdeas||[]).slice(0,Math.min(3,counts[j])).map((idea,index)=>({idea,index,score:0}));
   for(let k=0;k<counts[j];k++){const match=ideas[k],idea=match?.idea;if(match)used.add(match.index);const day=idea?{...idea,title:idea.title.replace(/体验日$/,''),detail:m.logic,place:m.name,kind:'体验'}:{title:k===0?m.stops.slice(0,2).join('，'):'把一天留给当地与自己',place:m.name,kind:k===0?'体验':'弹性',morning:k===0?`在${m.name}安排${m.stops[0]}，先确认开放、预约与前往方式。`:`在${m.name}慢一点开始这一天，按前几天的天气与体力调整。`,afternoon:k===0?`同区选择${m.stops.slice(1).join('、')||'一项当地体验'}，不为凑景点赶路。`:'可补上错过的天气窗口，或选择一处已确认开放的博物馆、步道与当地小店。',evening:'回住处休整，或按兴趣安排附近餐食与散步。',tip:m.logic,detail:m.logic};if(j>0&&k===0)day.tip=`先完成前往${m.name}的交通（若日归则保留原住处），再按剩余时间安排。 ${day.tip||''}`;days.push(day);}
   stages.push({name:m.name,from:first,to:days.length,days:counts[j]});
  });
 }
 for(let i=0;i<back;i++)days.push({title:i===back-1?'返程，抵达'+origin:'机场与返程衔接',place:i===back-1?origin:(g?.route?.airports||[]).join(' / '),kind:'交通',detail:'按确认后的航班和当地时间调整。',morning:'给退房、前往车站或机场、值机与行李手续留足时间。',afternoon:d.domestic?'按实际列车、航班与接驳衔接，不在返程日叠加远距离景点。':'按照实际航班衔接，不在中转日叠加需要入境的游览。',evening:i===back-1?'返回出发城市，预留跨时区后的休息。':'返程飞行或中转。',tip:d.domestic?'车站或机场接驳、列车航班时刻与夜间抵达会改变安排。':'联程、自提行李、跨机场与夜间航班会改变所需时间。'});
 return{days:days.map((x,i)=>({...x,day:i+1,date:addDays(start,i)})),stages,cost:estimate(d,n),pace,totalDays:n};
}
export function visaAssessment(d,profile,start,end,catalog,transit='unknown'){
 const n=tripDays(start,end),remaining=Math.floor((parseDate(start)-parseDate(TODAY))/DAY);const checks=[];
 if(d.domestic)return{status:'国内出行',tone:'good',summary:'当前行程在中国大陆境内，不涉及出境旅游签证。',checks:[],policy:null};
 const key=catalog.countryMap[d.policy],policy=catalog.groups.find(x=>x.id===key||x.name===key)||null;
 let status='入境条件待核验',tone='pending',summary='请结合完整航线与个人证件核验。';
 const held=profile.visas?.[key==='schengen'?'申根':d.policy];
 if(held?.held){status='已持签证 · 仍需核验';summary='已登记持有该目的地签证。需确认本次出行时有效、入境次数足够，并满足单次停留限制。';
  if(!held.expiry)checks.push('补充现有签证的有效期');else if(held.expiry<start){status='签证在出发前已到期';tone='warning';checks.push('现有签证在预计出发前已到期，不能据此按已持有效签证安排');}else if(held.expiry<end){status='有效期与停留许可需核对';checks.push('签证在假期结束前到期：入境有效期与获准停留期不同，需按实际入境/离境日核验目的地规则');}
  if(!held.entries||held.entries==='unknown')checks.push('确认单次/多次入境及剩余入境次数');
  if(!held.maxStay)checks.push('补充签证页所写的单次停留上限');else if(n>+held.maxStay){checks.push('假期总天数超过录入的单次停留上限，需按实际入境至离境日期计算停留，不能把交通日直接等同境内停留');}
 }else if(policy){
  if(policy.method.includes('有条件')){status='有条件免签 · 待核资格';summary='该政策有第三国签证或居留资格要求，不能仅凭中国护照直接套用。';checks.push(d.policy==='阿根廷'?'阿根廷底稿条件涉及合格美国签证或美国绿卡；日本、韩国签证不能据此满足条件':'核对官方列明的第三国签证/居留类别、有效性与入境次数');if(profile.visas?.美国?.held)checks.push('已登记美国签证，但仍需核验其签证类别与有效期是否符合此项条件');}
  else if(policy.method==='免签'){status='免签条件待核对';summary='参考资料显示无需提前办理旅游签证；仍需核对旅行目的、停留上限、入境资料和转机条件。';tone='good';}
  else {status=policy.method+' · 提前准备';summary=policy.timing||'按具体日期准备申请与入境资料。';}
 }
 if(d.policy==='俄罗斯'&&end>'2027-12-31'){status='行程超出已知政策期限';tone='warning';checks.push('底稿的俄罗斯免签政策只记录至2027-12-31，此后不能继续按免签判断');}
 if(d.policy==='俄罗斯'&&n>30){tone='warning';checks.push('底稿记录单次最多30天，本次行程超过该期限');}
 if(d.policy==='摩洛哥'&&n>90){tone='warning';checks.push('底稿记录最多90天，本次行程需另行核验');}
 if(key==='schengen')checks.push('补充最近180天内的申根停留记录，并核验签证所写停留天数；29国合并计算，不因跨国重置');
 if(['冰岛','英国','新西兰'].includes(d.policy)&&!held?.held&&remaining<42){tone='warning';checks.push('距离出发不足6周，请优先核对预约和实际办理时间，不把预留时间当出签承诺');}
 if(profile.passportExpiry){if(profile.passportExpiry<end){tone='warning';checks.push('护照在行程结束前到期，需先处理证件有效问题');}else if(parseDate(profile.passportExpiry)-parseDate(end)<180*DAY)checks.push('护照返程后余期不足约6个月，各国法定要求不同，需查目的地规则');}else checks.push('补充护照到期日，核验目的地要求');
 if(d.id==='antarctica')checks.push('本示例按阿根廷乌斯怀亚港出发；换为智利出发或跨境路线时需重新检查');
 if(transit==='unknown')checks.push('尚未确认中转地，当前无法判定过境手续');
 if(transit==='schengen')checks.push('需核验申根机场过境、是否入境、自提行李及跨机场/申根内部航班；免签目的地不代表中转免手续');
 if(transit==='us')checks.push('美国中转需按实际航线核验所需美国签证及相关登记，不能仅凭日/韩签证判断');
 if(transit==='uk')checks.push('英国转机与过境豁免取决于航线、证件、是否入境及衔接条件，需逐项复核');
 if(transit==='other')checks.push('请补充中转国家、是否联程、是否提取行李及是否离开机场');
 checks.push('购买不可退机票前及出发前再次打开官方来源复核');
 return{status,tone,summary,checks,policy,asOf:catalog.asOf};
}
