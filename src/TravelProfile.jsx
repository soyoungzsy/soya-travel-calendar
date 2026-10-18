import React,{useState} from 'react';
import {DocumentImport} from './DocumentImport.jsx';
import {defaultProfile,normalizeProfile,validateDocumentReview} from './document-profile.mjs';

export function TravelProfile({profile,onSave,onCancel}){
 const [draft,setDraft]=useState(()=>normalizeProfile(profile)),[message,setMessage]=useState(''),[error,setError]=useState(''),[deleting,setDeleting]=useState(false);
 const updateVisa=(country,key,value)=>setDraft(p=>({...p,visas:{...p.visas,[country]:{...p.visas[country],[key]:value}}}));
 function save(){
  for(const [country,visa]of Object.entries(draft.visas))if(visa.held){
   const invalid=validateDocumentReview({kind:'visa',country,fields:visa});
   if(invalid&&!invalid.startsWith('尚无可录入字段')){setError(`${country}签证：${invalid}`);return;}
  }
  try{onSave(normalizeProfile(draft));}catch{setError('当前浏览器未能保存资料，请检查网站存储权限或退出隐私浏览后重试。');}
 }
 return <div className="dialog-body travel-profile"><p className="eyebrow">READY WHEN YOU ARE</p><h2>带上证件，也带上从容。</h2><p className="lead-copy">本体验版按中国大陆普通护照演示。可选照片辅助录入，也可以手动填写。核对好后，点底部“保存出行资料”。</p>
  <DocumentImport profile={draft} onApply={next=>{setDraft(next);setMessage('识别字段已填入下方资料，请保存。');setError('');}}/>
  <h3 className="profile-manual-title">核对或手动填写</h3>
  {message&&<p className="profile-feedback" role="status">{message}</p>}
  <label className="standalone-field">护照到期日<input type="date" aria-label="护照到期日" value={draft.passportExpiry} onChange={e=>setDraft(p=>({...p,passportExpiry:e.target.value}))}/></label>
  <div className="visa-entries">{Object.entries(draft.visas).map(([country,v])=><div className="visa-entry" key={country}><label className="checkbox-label"><input type="checkbox" checked={v.held} onChange={e=>updateVisa(country,'held',e.target.checked)}/><strong>{country}签证</strong></label>{v.held&&<div className="visa-entry-fields profile-extended"><label>签证类型<input value={v.type} maxLength="24" placeholder="待确认" onChange={e=>updateVisa(country,'type',e.target.value)}/></label><label>签发日<input type="date" value={v.issuedOn} onChange={e=>updateVisa(country,'issuedOn',e.target.value)}/></label><label>到期日<input type="date" value={v.expiry} onChange={e=>updateVisa(country,'expiry',e.target.value)}/></label><label>入境次数<select value={v.entries} onChange={e=>updateVisa(country,'entries',e.target.value)}><option value="unknown">待确认</option><option value="single">单次（使用情况另核）</option><option value="multiple">多次</option></select></label><label>单次停留天数<input type="number" min="1" max="365" placeholder="待确认" value={v.maxStay} onChange={e=>updateVisa(country,'maxStay',e.target.value)}/></label></div>}</div>)}</div>
  <p className="fine-print">资料只保存在当前浏览器，不是加密证件保险箱；地点备份不会包含这些字段。登记“持有”不代表已通过本次行程核验，单次签证需另核是否已经使用。</p>
  {error&&<p className="document-error" role="alert">{error}</p>}
  <div className="action-row profile-actions"><button className="primary" onClick={save}>保存出行资料</button><button className="secondary" onClick={onCancel}>取消修改</button><button className="profile-clear" onClick={()=>setDeleting(true)}>清空证件字段</button></div>
  {deleting&&<div className="profile-delete-confirm"><p>清空护照到期日和全部签证字段？心愿单、地点与行程会保留。点“保存出行资料”后生效。</p><div className="action-row"><button className="secondary" onClick={()=>{setDraft(defaultProfile());setMessage('证件字段已清空，请保存。');setDeleting(false);setError('');}}>确认清空</button><button className="secondary" onClick={()=>setDeleting(false)}>保留资料</button></div></div>}
 </div>;
}
