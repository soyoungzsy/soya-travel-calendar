import fs from 'node:fs';
import {poiRecords,getPOIPhoto} from '../src/knowledge.mjs';
import media from '../src/media.json' with {type:'json'};
const photos=[...Object.entries(media.photos).map(([id,p])=>({id,...p})),...Object.entries(media.moments||{}).flatMap(([id,rows])=>rows.filter(Boolean).map((p,i)=>({id:id+':'+i,...p}))),...poiRecords.map(p=>({id:p.id,...getPOIPhoto(p)})).filter(p=>p.src)];
const errors=[];
for(const p of photos){if(!p.src.startsWith('/')||!fs.existsSync(new URL('../public'+p.src,import.meta.url)))errors.push(p.id+':missing-photo');if(!p.sourcePage||!p.licenseURL)errors.push(p.id+':missing-credit');}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Checked ${photos.length} photo associations; all files and credit links present. Subject selection requires visual review.`);
