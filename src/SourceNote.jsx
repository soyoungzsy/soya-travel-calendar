import React from 'react';
import {HelpTip} from './HelpTip.jsx';
import {ArrowSquareOut} from '@phosphor-icons/react';
export function SourceNote({label='参考来源',sources=[],children}){return <HelpTip label={label}>{children}{sources.map((s,i)=><span className="source-popover-item" key={(s.url||s.sourceURL||'')+i}><strong>{s.authority||s.sourceAuthority||'资料来源'}</strong><a href={s.url||s.sourceURL} target="_blank" rel="noopener noreferrer">{s.title||'查看原始资料'}<ArrowSquareOut size={12}/></a>{(s.accessedAt||s.publishedAt)&&<small>{s.publishedAt?'发布 '+s.publishedAt+' · ':''}{s.accessedAt?'查阅 '+s.accessedAt:''}</small>}</span>)}</HelpTip>;}
