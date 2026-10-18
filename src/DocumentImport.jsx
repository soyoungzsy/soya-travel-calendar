import React,{useEffect,useRef,useState} from 'react';
import {FileImage,LockKey,CheckCircle,ArrowRight,X} from '@phosphor-icons/react';
import {createLocalRecognizer,validateDocumentFile} from './document-ocr.mjs';
import {parseTravelDocument,validateDocumentReview,applyDocumentReview,VISA_COUNTRIES} from './document-profile.mjs';

export function DocumentImport({profile,onApply}){
 const [kind,setKind]=useState('visa'),[country,setCountry]=useState('韩国'),[image,setImage]=useState(null),[preview,setPreview]=useState(''),[review,setReview]=useState(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState({stage:'',progress:0}),[error,setError]=useState(''),[done,setDone]=useState(false);
 const input=useRef(null),job=useRef(null),generation=useRef(0),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;job.current?.cancel();};},[]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 const portable=globalThis.__SHANHE_PORTABLE__||location.protocol==='file:';
 function reset(){generation.current++;job.current?.cancel();job.current=null;setBusy(false);setImage(null);setPreview('');setReview(null);setError('');setDone(false);}
 function pick(file){reset();if(!file)return;const invalid=validateDocumentFile(file);if(invalid){setError(invalid);return;}setImage(file);setPreview(URL.createObjectURL(file));}
 async function recognize(){
  if(!image||busy)return;setError('');setReview(null);setBusy(true);setDone(false);
  const id=++generation.current,recognizer=createLocalRecognizer(value=>{if(mounted.current&&id===generation.current)setProgress(value);});job.current=recognizer;
  try{const text=await recognizer.recognize(image,{kind});if(!mounted.current||id!==generation.current)return;const result=parseTravelDocument(text,{kind,country});setReview(result);}
  catch{if(mounted.current&&id===generation.current)setError('未能完成本机识别。请裁剪到清晰的证件资料页、检查识别资源是否加载，或使用下方手动填写。');}
  finally{if(mounted.current&&id===generation.current){setBusy(false);job.current=null;}}
 }
 function field(key,value){setReview(r=>({...r,reviewed:false,fields:{...r.fields,[key]:value}}));}
 function apply(){try{onApply(applyDocumentReview(profile,review));reset();setDone(true);}catch(e){setError(e.message);}}
 const errorInReview=review?validateDocumentReview(review):'';
 const filled=review?Object.values(review.fields).filter(Boolean).length:0;
 return <section className="document-import" aria-labelledby="document-import-title">
  <div className="document-import-heading"><div><span className="eyebrow">YOUR TRAVEL DOCUMENTS</span><h3 id="document-import-title">从一张照片开始录入</h3></div><LockKey size={24}/></div>
  <p>照片在当前设备识别。核对后，只保存旅行需要的日期、签证类型、入境次数与停留天数。</p>
  <p className="document-boundary">不上传照片，不保存姓名、出生日期或证件号码。原图与识别全文不会写入浏览器存储。</p>
  {done&&<p className="document-success" role="status"><CheckCircle size={18}/>已录入出行资料。照片已从本次页面预览中移除。</p>}
  {portable?<p className="notice">单文件下载版未包含识别引擎，可在下方手动填写；照片识别请使用在线版。</p>:<>
   <div className="document-selectors"><label>证件种类<select value={kind} disabled={busy} onChange={e=>{reset();setKind(e.target.value);}}><option value="visa">签证 / 签证批准信</option><option value="passport">护照资料页</option></select></label>{kind==='visa'&&<label>签证国家 / 地区<select value={country} disabled={busy} onChange={e=>{reset();setCountry(e.target.value);}}>{VISA_COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></label>}</div>
   {!preview?<label className="document-picker"><FileImage size={29}/><strong>选择证件照片</strong><span>JPG / PNG / WebP · 10 MB以内</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择护照或签证照片" onChange={e=>pick(e.target.files?.[0])}/></label>:<div className="document-selected"><img src={preview} alt="仅在本机显示的证件照片预览"/><div><strong>照片已准备好</strong><p>{kind==='passport'?'拍全资料页，尤其是底部两行机读码。':'请拍全签证信息区，日期与文字应清晰、无反光。'}</p><button className="text-button" onClick={reset}><X size={14}/>移除照片{busy?'并取消识别':''}</button></div></div>}
   {!review&&image&&<div className="document-recognize"><button className="primary" onClick={recognize} disabled={busy}>{busy?'正在本机识别…':'在本机识别照片'}<ArrowRight size={16}/></button>{busy&&<div role="status"><span>{progress.stage}</span><progress aria-label="本机识别进度" max="1" value={progress.progress}/><small>首次需加载约7 MB识别资源，不会传送照片。</small></div>}</div>}
   {review&&<div className="document-review"><div className="document-review-title"><h4>对照原件，核对再录入</h4><span>{filled?`识别到${filled}个旅行字段`:'尚未可靠识别字段'}</span></div><p>空白项请补充；已填写的原有资料只会被这里的非空字段更新。</p><div className="document-review-fields">
    {(kind==='passport'||review.fields.passportExpiry)&&<label>护照到期日<input aria-label="核对护照到期日" type="date" value={review.fields.passportExpiry||''} onChange={e=>field('passportExpiry',e.target.value)}/></label>}
    {kind==='visa'&&<><label>签证到期日<input aria-label="核对签证到期日" type="date" value={review.fields.expiry||''} onChange={e=>field('expiry',e.target.value)}/></label><label>签发日<input aria-label="核对签发日" type="date" value={review.fields.issuedOn||''} onChange={e=>field('issuedOn',e.target.value)}/></label><label>签证类型<input aria-label="核对签证类型" value={review.fields.type||''} maxLength="24" placeholder="如 C-3-91" onChange={e=>field('type',e.target.value)}/></label><label>入境次数<select aria-label="核对入境次数" value={review.fields.entries||'unknown'} onChange={e=>field('entries',e.target.value)}><option value="unknown">待确认</option><option value="single">单次（是否已使用需另核）</option><option value="multiple">多次</option></select></label><label>单次停留天数<input aria-label="核对单次停留天数" type="number" min="1" max="365" value={review.fields.maxStay||''} placeholder="待确认" onChange={e=>field('maxStay',e.target.value)}/></label></>}
   </div><ul className="document-warnings">{review.warnings.map(w=><li key={w}>{w}</li>)}</ul><label className="document-confirm"><input type="checkbox" checked={review.reviewed} onChange={e=>setReview(r=>({...r,reviewed:e.target.checked}))}/>我已对照原件核对上述字段，确认录入当前资料。</label>{errorInReview&&<p className="document-error">{errorInReview}</p>}<div className="document-review-actions"><button className="secondary" onClick={reset}>取消本次录入</button><button className="primary" onClick={apply} disabled={!review.reviewed||!!errorInReview}>确认录入{kind==='visa'?`${country}签证`:'护照到期日'}<CheckCircle size={17}/></button></div></div>}
  </>}
  {error&&<p className="document-error" role="alert">{error}</p>}
  <p className="fine-print">当前以英文签证字段、韩国批准信和护照机读码为识别基础。版式、清晰度或语言不同可能无法识别；未识别字段保留空白。照片不能证明证件真伪或本次入境资格。</p>
 </section>;
}
