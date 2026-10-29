import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookmarkSimple,Bank,Buildings,Island,MapTrifold} from '@phosphor-icons/react';
import {TODAY} from './data.mjs';
import {nextWeekend,weekendCandidates,WEEKEND_TYPES} from './weekends.mjs';
import {addDays,parseDate} from './engine.mjs';
import {POIDetail} from './ScenicCards.jsx';
import {HelpTip} from './HelpTip.jsx';
import {SourceNote} from './SourceNote.jsx';
import {readJourney,savedIDs,toggleSaved,observeSaved} from './journey-storage.mjs';
import {notifyWishlist} from './WishlistToast.jsx';
import {track,setAnalyticsScreen} from './analytics.mjs';
import './weekends.css';

function stored(){try{return readJourney(localStorage);}catch{return{};}}
export default function Weekends(){
 const [initial]=useState(stored),[origin,setOrigin]=useState(initial.origin==='上海'?'上海':'杭州'),[start,setStart]=useState(nextWeekend(TODAY)),[days,setDays]=useState(2),[type,setType]=useState('all'),[includeConditional,setIncludeConditional]=useState(true),[saved,setSaved]=useState(()=>savedIDs(initial)),[selected,setSelected]=useState(null),detail=useRef(null);
 const validStart=Number.isFinite(parseDate(start))&&start>=TODAY,end=validStart?addDays(start,days-1):'',items=validStart?weekendCandidates({origin,start,days,type,includeConditional}):[];
 useEffect(()=>{const previous=document.title;document.title='国内周末游｜山河有期';setAnalyticsScreen('weekends');return()=>{document.title=previous;};},[]);
 useEffect(()=>observeSaved(setSaved),[]);
 function save(id){try{const next=toggleSaved(localStorage,id,saved);setSaved(next);track(next.includes(id)?'save':'unsave',id);notifyWishlist(next.includes(id));}catch{notifyWishlist(null);}}
 function open(p){setSelected(p);track('poi',p.id);setAnalyticsScreen('poi',p.id);requestAnimationFrame(()=>detail.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'}));}
 function close(){setSelected(null);setAnalyticsScreen('weekends');}
 return <main className="weekends-page atlas-app theme-magazine revision-five" data-analytics-module="domestic_weekend"><header className="encyclopedia-header"><a href="/" className="encyclopedia-brand">山河有期<small>国内周末游</small></a><nav aria-label="主导航"><a href="/">目的地灵感</a><a href="/weekends" aria-current="page">国内周末</a><a href="/encyclopedia">旅行百科</a></nav><a className="encyclopedia-back" href="/?scope=domestic"><MapTrifold size={16}/>在地球查看国内</a></header>
 <section className="weekend-heading"><p className="eyebrow">国内 · 1至2日体验</p><div><h1>周末，找个想了解的地方。</h1><HelpTip label="周末候选说明">首批支持杭州、上海出发，同城体验优先。跨城天数为建议，需先确认往返交通与最后接驳；海岛还要确认道路、天气和船班。展示不代表有票或已预约。</HelpTip></div><p>古镇、馆藏展览与岛屿海岸。先选想体验的内容，再把路途安排进去。</p></section>
 <section className="weekend-controls" aria-label="周末体验筛选" data-analytics-module="filters"><label>出发地<select aria-label="周末出发地" value={origin} onChange={e=>{setOrigin(e.target.value);close();track('origin');}}><option>杭州</option><option>上海</option></select></label><label>出发日期<input aria-label="周末出发日期" type="date" min={TODAY} value={start} onChange={e=>{setStart(e.target.value);close();track('dates');}}/></label><label>旅行天数<select aria-label="周末旅行天数" value={days} onChange={e=>{setDays(Number(e.target.value));close();track('dates');}}><option value="1">1日</option><option value="2">2日</option></select></label><span className="weekend-return">{start} 至 {end}</span><label className="weekend-condition"><input type="checkbox" checked={includeConditional} onChange={e=>{setIncludeConditional(e.target.checked);track('filter');}}/>也看需先确认交通的岛屿候选</label></section>
 {!validStart&&<p className="validation" role="alert">请选择今天或之后的有效日期。</p>}
 <div className="weekend-types" aria-label="周末体验类型">{Object.entries(WEEKEND_TYPES).map(([key,label])=><button key={key} aria-pressed={type===key} onClick={()=>{setType(key);close();track('filter');}}>{label}</button>)}</div><p className="weekend-count" role="status">{items.length}项体验 · 同城优先 · 收藏与旅行百科共用</p>
 <section className="weekend-feed" aria-label="周末体验列表">{items.map(p=>{const Icon=p.weekend.type==='museum'?Bank:p.weekend.type==='island'?Island:Buildings;return <article className="weekend-card" key={p.id} data-analytics-module="domestic_weekend" data-analytics-entity={p.id}><div className="weekend-card-head"><span><Icon size={18}/>{p.province===p.city?p.city:p.province+' · '+p.city}</span><button className="icon-button" aria-label={(saved.includes(p.id)?'取消收藏':'收藏')+p.name} aria-pressed={saved.includes(p.id)} onClick={()=>save(p.id)}><BookmarkSimple size={19} weight={saved.includes(p.id)?'fill':'regular'}/></button></div><div className="weekend-place-kind">{p.placeKind==='estuary_island'?'河口冲积岛':p.placeKind==='island'?'近海岛屿':p.placeKind==='long_term_exhibition'?'长期展览':WEEKEND_TYPES[p.weekend.type]} · {p.weekendPlan.local?'同城体验':p.weekendPlan.minDays+'日跨城候选'}{p.seasonality.mode==='event'&&' · 展期至 '+p.seasonality.end}</div><h2>{p.name}</h2><p>{p.whyGo}</p><div className="weekend-card-foot"><button className="text-button" onClick={()=>open(p)}>阅读体验介绍<ArrowRight size={14}/></button><SourceNote label={p.name+'来源'} sources={p.sources}/></div></article>;})}</section>
 {!items.length&&<p className="weekend-empty">这个组合暂未收录匹配体验，可换一天、选择两日或查看其他类型。</p>}
 {selected&&<section ref={detail} className="weekend-detail" aria-label={selected.name+'详细介绍'} data-analytics-module="guide" data-analytics-entity={selected.id}><button className="text-button" onClick={close}><ArrowLeft size={16}/>回到周末列表</button><h2>{selected.name}</h2><POIDetail inline seasonIndependent point={selected} start={start} end={end} onSave={save} saved={saved.includes(selected.id)}/><a className="secondary" href={selected.sources[0].url} target="_blank" rel="noreferrer">查看官方图文与参观信息<ArrowRight size={14}/></a></section>}
 <footer className="weekend-footer"><a href="/encyclopedia">继续翻阅旅行百科<ArrowRight size={14}/></a><p>场馆预约、临时开放调整及交通信息，以出行日的官方公告为准。</p></footer></main>;
}
