import React from 'react';
import {PlayCircle,ArrowSquareOut} from '@phosphor-icons/react';
import {musicFor} from './place-media.mjs';
import './place-music.css';
export function PlaceMusic({destination}){const music=musicFor(destination);if(!music)return null;return <aside className="place-music" aria-label="目的地音乐"><div><span>与这个地方有关的音乐</span><strong>《{music.title}》 · {music.creator}</strong><p>在新标签页播放，可返回本页继续阅读。</p></div><a className="secondary" data-track="music_open" data-track-entity={destination.id} href={music.url} target="_blank" rel="noreferrer"><PlayCircle size={19}/>到央视网听李健演唱<ArrowSquareOut size={14}/></a></aside>;}
