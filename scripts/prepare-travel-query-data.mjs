import {writeFileSync} from 'node:fs';
import {destinations} from '../src/data.mjs';
const places=Object.fromEntries(destinations.map(d=>[d.id,{name:d.name,coord:d.coord}]));
writeFileSync(new URL('../worker/travel-places.mjs',import.meta.url),'// Public destination coordinates only. Generated from the shared catalogue.\nexport default '+JSON.stringify(places)+';\n');
