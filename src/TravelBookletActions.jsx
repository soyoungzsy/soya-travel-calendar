import React,{useState} from 'react';
import {DownloadSimple} from '@phosphor-icons/react';
import {HelpTip} from './HelpTip.jsx';
import {buildTravelBooklet,forecastEligible} from './travel-booklet.mjs';

export function TravelBookletActions({plan,places,origin,start,end,budget,profile,transit,onExportText}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function download(){if(busy)return;setBusy(true);setError('');try{const weather={};if(forecastEligible(start,end)){await Promise.all(places.slice(0,8).map(async d=>{try{const q=new URLSearchParams({place:d.id,start,end}),r=await fetch('/api/weather?'+q,{signal:AbortSignal.timeout(9000)});if(r.ok){const data=await r.json();if(data.status==='forecast')weather[d.id]=data;}}catch{}}));}const book=buildTravelBooklet({plan,places,origin,start,end,budget,profile,transit,weather});const {downloadBookletPDF}=await import('./booklet-pdf.mjs');await downloadBookletPDF(book);}catch(e){setError(e.message||'攻略书生成失败，请稍后重试');}finally{setBusy(false);}}
 return <div className="booklet-export"><div className="booklet-export-buttons"><button className="primary" data-track="plan_pdf" onClick={download} disabled={busy}><DownloadSimple size={18}/>{busy?'正在生成 PDF…':'下载 PDF 攻略书'}</button><button className="text-button" onClick={onExportText}>保存文本</button><HelpTip label="PDF攻略书说明">A4版式，包含逐日建议时间、风景与历史文化、美食、交通、住宿区域、出发清单和参考资料。在当前浏览器生成；证件仅用于检查提醒，不含证件号码或照片。天气只在未来16天预报范围内更新，远期使用季节资料。</HelpTip></div>{error&&<p role="alert" className="validation">{error}</p>}<span className="visually-hidden" role="status">{busy?'正在整理攻略和中文字体，请稍候。':error||''}</span></div>;
}
