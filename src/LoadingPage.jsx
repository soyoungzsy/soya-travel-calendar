import React from 'react';

const labels={home:'旅行年历',encyclopedia:'旅行百科',insights:'数据报表'};

export function LoadingPage({route='home',status='loading',onRetry}){
 const recover=status==='slow'||status==='error';
 // Browsers can cache a rejected dynamic import; retry it in a fresh document.
 const retry=status==='error'?()=>window.location.reload():onRetry;
 return <main className="route-loading" aria-label="页面加载"><strong>山河有期</strong><div role={status==='error'?'alert':'status'} aria-live="polite"><h1>{status==='error'?`${labels[route]}未能打开`:status==='slow'?'加载较久，仍在尝试…':`正在展开${labels[route]}…`}</h1><p>{status==='error'?'页面文件暂时无法载入，请重试或返回年历。':recover?'可以继续等待，文件就绪后会自动显示。也可以手动重试。':'正在准备页面内容，请稍候。'}</p></div>{recover&&<div className="route-loading-actions"><button type="button" onClick={retry}>重试加载</button><a href="/">返回旅行年历</a></div>}</main>;
}
