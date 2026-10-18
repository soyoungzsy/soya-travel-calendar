import React,{useEffect,useId,useRef,useState} from 'react';
export function HelpTip({label='功能说明',children}){
 const [open,setOpen]=useState(false),id=useId(),root=useRef(null);
 useEffect(()=>{if(!open)return;const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);},escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false);root.current?.querySelector('button')?.focus();}};document.addEventListener('pointerdown',outside);root.current?.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);root.current?.removeEventListener('keydown',escape);};},[open]);
 return <span className="help-tip" ref={root}><button type="button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>?</button>{open&&<span id={id} role="note" className="help-content">{children}</span>}</span>;
}
