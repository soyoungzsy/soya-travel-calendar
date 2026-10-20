import React,{useEffect,useState} from 'react';
import {readConsent,setConsent} from './analytics.mjs';
import {X} from '@phosphor-icons/react';
export function AnalyticsPrivacy(){
 const [choice,change]=useState(readConsent),[open,setOpen]=useState(false);
 useEffect(()=>{const show=()=>setOpen(true),update=()=>change(readConsent());window.addEventListener('analytics-privacy-open',show);window.addEventListener('analytics-consent-change',update);return()=>{window.removeEventListener('analytics-privacy-open',show);window.removeEventListener('analytics-consent-change',update);};},[]);
 if(choice!=='unknown'&&!open)return null;
 function choose(next){setConsent(next);setOpen(false);}
 return <aside className="analytics-consent" aria-label="使用统计设置"><div><strong>帮助改进山河有期</strong><p>允许统计功能点击和有效停留吗？不采集证件、私人清单、输入内容或精确位置。可在页尾随时关闭。</p>{open&&<small>当前：{choice==='granted'?'允许统计':choice==='denied'?'已关闭':'尚未选择'} · 使用随机浏览器标识，保留90天。</small>}</div><div className="analytics-consent-actions"><button className="secondary" onClick={()=>choose('denied')}>暂不统计</button><button className="primary" onClick={()=>choose('granted')}>允许统计</button>{open&&<button aria-label="关闭统计设置" className="icon-button" onClick={()=>setOpen(false)}><X size={18}/></button>}</div></aside>;
}
