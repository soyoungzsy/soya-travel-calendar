import React from 'react';
import {money} from './engine.mjs';
import {HelpTip} from './HelpTip.jsx';
export function QuoteWorkbench({d,origin,start,end}){
 return <section className="quote-workbench" id="guide-compare"><div className="guide-section-title"><h3>机票与酒店 <HelpTip label="机票与酒店价格说明">当前未接通平台可订库存，攻略金额为规划预算。接入供应商授权接口后才能比较同日期、含税总价及退改条件。</HelpTip></h3></div><div className="quote-query"><div><small>出发与目的地</small><strong>{origin} ⇄ {d.name}</strong></div><div><small>旅行日期</small><strong>{start.replaceAll('-','.')} — {end.replaceAll('-','.')}</strong></div></div><div className="quote-planning-budget">{d.cost&&<><small>每人全程规划参考</small><strong>¥{money(d.cost.low)}—{money(d.cost.high)}</strong></>}<span>暂无该日期的实时报价</span></div></section>;
}
