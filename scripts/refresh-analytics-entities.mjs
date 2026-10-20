import fs from 'node:fs';
import {destinations} from '../src/data.mjs';
import {allPOICards,countries} from '../src/knowledge.mjs';
const entities=Object.fromEntries([...destinations.map(d=>[d.id,d.name]),...allPOICards.map(p=>[p.id,p.name]),...countries.map(c=>['country:'+c.id,c.nameZh])]);
fs.writeFileSync(new URL('../worker/analytics-entities.mjs',import.meta.url),'// Generated from the public travel catalogue. No personal places.\nexport const PUBLIC_ENTITIES='+JSON.stringify(entities,null,2)+';\n');
