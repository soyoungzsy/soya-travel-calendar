import React from 'react';
import {ArrowSquareOut,BookOpen,ForkKnife} from '@phosphor-icons/react';
import {foodFor,readingFor,readingType} from './travel-enrichment.mjs';

export function TravelEnrichment({destination}){
 const food=foodFor(destination),reading=readingFor(destination);
 return <>
  <section className="guide-section local-tastes" id="guide-food">
   <div className="guide-section-title"><span>LOCAL TASTES / 一地一味</span><h3><ForkKnife size={22}/>在这里，尝一口当地的生活</h3></div>
   {food?<><p className="enrichment-intro">从官方地方资料认识风味，再按你的口味安排。这里推荐饮食体验，餐厅营业与菜单按出行日另核。</p>
    <div className="enrichment-grid">{food.foods.map(f=><article key={f.id}><small>{f.scope==='country'?'所在国家／地区风味参考':'当地风味'}</small><h4>{f.name}</h4><p>{f.description}</p><p className="enrichment-tip">{f.experienceTip}</p><details><summary>查看这道风味的出处</summary>{f.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><strong>{s.authority}</strong><span>{s.title}</span><small>{s.publishedAt&&`发布 ${s.publishedAt} · `}核对 {s.accessedAt} · {s.accessLevel==='body-verified'?'已读来源正文':'仅核对搜索摘要'}</small><ArrowSquareOut size={13}/></a>)}</details></article>)}</div>
    {food.coverageNote&&<p className="fine-print">{food.coverageNote}</p>}<p className="fine-print">地方特色不等于适合每个人；忌口、食材、酒精和过敏原请在点单时向商家确认。未核实商户，不据此保证具体餐饮服务。</p>
   </>:<p className="enrichment-pending">这一站的地方风味资料正在补齐。找到有依据的当地资料后再加入推荐。</p>}
  </section>
  <section className="guide-section before-knowing" id="guide-reading">
   <div className="guide-section-title"><span>READ BEFORE YOU GO / 行前一读</span><h3><BookOpen size={22}/>出发前，先认识这里</h3></div>
   {reading?<><p className="enrichment-intro">不必做完一份阅读清单。选一个感兴趣的问题，让到达后的所见多一层来由。</p><div className="reading-list">{reading.items.map(item=><article key={item.id}><div><small>{readingType[item.type]||'文化背景'}{item.language&&` · ${item.language}`}</small><h4>{item.title}</h4><span className="reading-creator">{item.creator}{item.edition&&` · ${item.edition}`}{item.publishedAt&&` · ${item.publishedAt}`}</span></div><p>{item.whyBeforeGo}</p><ul>{item.focusQuestions.map(q=><li key={q}>{q}</li>)}</ul><a href={item.sourceURL} target="_blank" rel="noreferrer">{item.type==='article'?'阅读原文':'查看官方书目／节目资料'}<ArrowSquareOut size={13}/></a><p className="fine-print">{item.sourceAuthority} · 核对 {item.accessedAt} · {item.readStatus==='official-article-read'?'已读官方短文': '已核书目／简介，未通读或完整观看'}{item.ISBN&&` · ISBN ${item.ISBN}`}</p></article>)}</div></>:<p className="enrichment-pending">这一站的行前阅读正在核选，暂不自动生成书名、纪录片或人物故事。</p>}
  </section>
 </>;
}
