import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {CheckCircle,BookmarkSimple,ArrowRight,X} from '@phosphor-icons/react';

export function notifyWishlist(added){window.dispatchEvent(new CustomEvent('shanhe-wishlist-feedback',{detail:{added}}));}

export function WishlistToast(){
 const [message,setMessage]=useState(null),box=useRef(null),timer=useRef(null);
 const pause=()=>clearTimeout(timer.current),dismiss=()=>{pause();setMessage(null);};
 const resume=()=>{pause();timer.current=setTimeout(dismiss,6000);};
 useEffect(()=>{const show=e=>{pause();setMessage({added:e.detail.added,target:document.querySelector('dialog[open]')||document.body});};window.addEventListener('shanhe-wishlist-feedback',show);return()=>{window.removeEventListener('shanhe-wishlist-feedback',show);pause();};},[]);
 useLayoutEffect(()=>{if(!message)return;const element=box.current;try{element.showPopover?.();}catch{}resume();return()=>{pause();try{element.hidePopover?.();}catch{}};},[message]);
 if(!message)return null;
 const failed=message.added===null;
 return createPortal(<div ref={box} popover="manual" className="wishlist-feedback" onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))resume();}}>
  {message.added?<CheckCircle size={21} weight="fill"/>:<BookmarkSimple size={21}/>}
  <span role="status" aria-live="polite" aria-atomic="true">{failed?'暂时无法保存，请允许浏览器存储后重试':message.added?'已加入心愿单':'已移出心愿单'}</span>
  {message.added&&<a href="/?wishlist=1" data-track="wishlist" onClick={e=>{if(location.pathname!=='/encyclopedia'){e.preventDefault();window.dispatchEvent(new Event('shanhe-open-wishlist'));dismiss();}}}>查看心愿单<ArrowRight size={13}/></a>}
  <button type="button" aria-label="关闭收藏提示" onClick={dismiss}><X size={15}/></button>
 </div>,message.target);
}
