import React,{useEffect,useRef,useState} from 'react';
import {UserCircle,BookmarkSimple,IdentificationCard,ArrowRight} from '@phosphor-icons/react';

export function MyMenu({placeCount,onPlaces,onProfile}){
 const [open,setOpen]=useState(false),[owner,setOwner]=useState(false),root=useRef(null),trigger=useRef(null);
 useEffect(()=>{if(location.protocol==='file:')return;fetch('/api/analytics/access',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>setOwner(!!d?.owner)).catch(()=>{});},[]);
 useEffect(()=>{
  if(!open)return;
  const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};
  const escape=e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 function choose(action){setOpen(false);action();}
 return <div className="my-menu" ref={root} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
  <button ref={trigger} className="profile-button my-trigger" aria-label="我的" data-track="my" aria-expanded={open} aria-controls="my-account-panel" onClick={()=>setOpen(value=>!value)}><UserCircle size={23}/><span>我的</span></button>
  {open&&<div id="my-account-panel" className="my-panel" role="region" aria-label="我的功能">
   <p>我的旅行资料</p>
   <button data-track="places" onClick={()=>choose(onPlaces)}><BookmarkSimple size={22}/><span><strong>我的地点清单<small>{placeCount}</small></strong><span>新建、导入与导出备份</span></span><ArrowRight size={15}/></button>
   <button data-track="profile" onClick={()=>choose(onProfile)}><IdentificationCard size={22}/><span><strong>护照与签证</strong><span>管理证件与有效期</span></span><ArrowRight size={15}/></button>
   {owner&&<a className="my-report-link" href="/insights">产品使用数据报表<ArrowRight size={15}/></a>}<small className="my-storage-note">个人资料保存在当前浏览器</small>
  </div>}
 </div>;
}
