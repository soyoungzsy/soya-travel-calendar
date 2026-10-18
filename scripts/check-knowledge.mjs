// Offline structural audit. This command does not claim to reread external sources.
import assert from 'node:assert/strict';
import {knowledgeSnapshot,canonicalSourceURL} from '../src/knowledge-audit.mjs';
import {foodProfiles,readingPacks} from '../src/travel-enrichment.mjs';
import policy from '../src/knowledge-index-meta.json' with {type:'json'};
for(const r of knowledgeSnapshot.sources){assert.ok(canonicalSourceURL(r.url));assert.ok(r.uses.length);}
for(const p of foodProfiles)for(const f of p.foods){assert.ok(f.id&&f.description&&f.sources.length);assert.ok(f.sources.every(s=>s.authority&&s.title&&s.accessedAt&&canonicalSourceURL(s.url)));}
for(const p of readingPacks)for(const r of p.items){assert.ok(r.id&&r.focusQuestions.length&&canonicalSourceURL(r.sourceURL));if(r.type==='book')assert.equal(r.readStatus,'catalogue-only');}
assert.ok(!policy.enabled||policy.rightsStatus==='cleared'&&policy.approvalReference,'Batch redistribution needs a recorded permission decision.');
console.log(JSON.stringify({status:'structure_validated',sourceBodiesRechecked:false,counts:knowledgeSnapshot.counts,lastRecordedCheck:knowledgeSnapshot.latestCheckedAt},null,2));
