import React from 'react';
import {HelpTip} from './HelpTip.jsx';
import {ArrowSquareOut,BookOpen,ForkKnife} from '@phosphor-icons/react';
import {foodFor,readingFor,readingType} from './travel-enrichment.mjs';

export function TravelEnrichment({destination}){
 const food=foodFor(destination),reading=readingFor(destination);
 return <>
  {food&&<section className="guide-section local-tastes" id="guide-food">
   <div className="guide-section-title"><span>LOCAL TASTES / 一地一味</span><h3><ForkKnife size={22}/>当地美食 <HelpTip label="美食推荐说明">依据当地官方文旅资料介绍特色饮食。营业时间、食材与过敏原请在点餐时确认。</HelpTip></h3></div>
   {food?<>
    <div className="enrichment-grid">{food.foods.map(f=><article key={f.id}><small>{f.scope==='country'?'所在国家／地区风味参考':'当地风味'}</small><h4>{f.name}</h4><p>{f.description}</p><p className="enrichment-tip">{f.experienceTip}</p><details><summary>查看这道风味的出处</summary>{f.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><strong>{s.authority}</strong><span>{s.title}</span><small>{s.publishedAt&&`发布 ${s.publishedAt} · `}核对 {s.accessedAt} · {s.accessLevel==='body-verified'?'已读来源正文':'仅核对搜索摘要'}</small><ArrowSquareOut size={13}/></a>)}</details></article>)}</div>

   </>:<p className="enrichment-pending">这一站的地方风味资料正在补齐。找到有依据的当地资料后再加入推荐。</p>}
  </section>}
  {reading&&<section className="guide-section before-knowing" id="guide-reading">
   <div className="guide-section-title"><span>READ BEFORE YOU GO / 行前一读</span><h3><BookOpen size={22}/>行前阅读 <HelpTip label="行前阅读说明">选择一本书、一部纪录片或一篇背景介绍，了解当地历史与文化。书目核对不代表已通读全文。</HelpTip></h3></div>
   {reading?<><div className="reading-list">{reading.items.map(item=><article key={item.id}><div><small>{readingType[item.type]||'文化背景'}{item.language&&` · ${item.language}`}</small><h4>{item.title}</h4><span className="reading-creator">{item.creator}{item.publishedAt&&` · ${item.publishedAt}`}</span></div><p>{item.whyBeforeGo.replace(/本轮仅核实[^。]*。?/g,'').replace(/旧版历史著作也不能替代[^。]*。?/g,'')}</p><ul>{item.focusQuestions.map(q=><li key={q}>{q}</li>)}</ul><a href={item.sourceURL} target="_blank" rel="noreferrer">{item.type==='article'?'阅读原文':'查看官方书目／节目资料'}<ArrowSquareOut size={13}/></a><details><summary>资料信息</summary><p className="fine-print">{item.edition&&<>{item.edition}<br/></>}{item.sourceAuthority} · 核对 {item.accessedAt} · {item.readStatus==='official-article-read'?'已读官方短文':item.type==='documentary'?'已核节目简介，未完整观看':'已核书目／简介，未通读'}{item.ISBN&&` · ISBN ${item.ISBN}`}</p></details></article>)}</div></>:<p className="enrichment-pending">这一站的行前阅读正在核选，暂不自动生成书名、纪录片或人物故事。</p>}
  </section>}
 </>;
}
