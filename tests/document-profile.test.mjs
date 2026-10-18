import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProfile,normalizeProfile,parseTravelDocument,applyDocumentReview,validateDocumentReview,validDate,mrzCheck} from '../src/document-profile.mjs';
import {visaAssessment} from '../src/engine.mjs';
import {validateDocumentFile} from '../src/document-ocr.mjs';

// Deliberately fictional documents. Never substitute a real person's OCR output.
const syntheticVisa=`SYNTHETIC TEST IMAGE - NOT A REAL VISA
VISA GRANT NOTICE
MINISTRY OF JUSTICE, REPUBLIC OF KOREA
Full name: FICTIONAL EXAMPLE
Passport No: TEST-NOT-A-REAL-NUMBER
Passport Expiration Date: 2032.06.15
Status of Stay: C-3-99
Period of Stay: 30 Days
Number of Entries: Multiple
Date of Issue: 2024.04.03
Visa Expiry Date: 2029.04.03`;
function checksum(text){const values=c=>c==='<'?0:/\d/.test(c)?+c:c.charCodeAt(0)-55;return String([...text].reduce((n,c,i)=>n+values(c)*[7,3,1][i%3],0)%10);}
function syntheticMRZ({expiry='310203',nationality='CHN',damaged=false}={}){
 const first=('P<'+nationality+'EXAMPLE<<SYNTHETIC').padEnd(44,'<');
 const number='TEST00000',birth='900101',personal='<<<<<<<<<<<<<<';
 let b=number+checksum(number)+nationality+birth+checksum(birth)+'X'+expiry+checksum(expiry)+personal+checksum(personal);
 b+=checksum(b.slice(0,10)+b.slice(13,20)+b.slice(21,43));
 if(damaged)b=b.slice(0,27)+((+b[27]+1)%10)+b.slice(28);
 return first+'\n'+b;
}
test('Korean labelled fields are extracted without retaining identity fields or OCR text',()=>{
 const r=parseTravelDocument(syntheticVisa);assert.deepEqual(r.fields,{expiry:'2029-04-03',issuedOn:'2024-04-03',entries:'multiple',maxStay:'30',type:'C-3-99',passportExpiry:'2032-06-15'});assert.equal(r.reviewed,false);
 const json=JSON.stringify(r);for(const secret of ['FICTIONAL EXAMPLE','TEST-NOT-A-REAL-NUMBER','Full name','Passport No'])assert.ok(!json.includes(secret));
});
test('Korean table dates are scoped to the visa table, excluding DOB and passport expiry',()=>{
 const r=parseTravelDocument('VISA GRANT NOTICE\nDate of Birth 1990.01.01\nPassport Expiration Date 2034.02.03\nDATE OF ISSUE   VALIDITY PERIOD OF VISA\n2024.04.03    2029.04.03\nRemarks\nPrint date 2038.05.06');
 assert.equal(r.fields.expiry,'2029-04-03');assert.equal(r.fields.issuedOn,'2024-04-03');assert.equal(r.fields.passportExpiry,'2034-02-03');
});
test('ambiguous pages do not substitute the latest date for visa expiry or table headings for visa type',()=>{
 const r=parseTravelDocument('VISA GRANT NOTICE\nPassport Expiration Date 2034.02.03\nStatus of Stay\nPeriod of Stay\n90Days\nPrinting Date 2029.04.03');
 assert.equal(r.fields.expiry,undefined);assert.equal(r.fields.type,undefined);assert.ok(r.warnings.some(w=>w.includes('未可靠识别')));
 const notice=parseTravelDocument('VISA GRANT NOTICE\nNOTICE\nMultiple visa types can allow 90Days. Example category C-3-99.');assert.equal(notice.fields.maxStay,undefined);assert.equal(notice.fields.entries,undefined);assert.equal(notice.fields.type,undefined);
});
test('invalid calendar dates and contradictory issue/expiry dates cannot silently enter profiles',()=>{
 assert.equal(validDate('2027-02-29'),false);assert.equal(validDate('2028-02-29'),true);
 const r=parseTravelDocument('Date of Issue 2029.04.03\nVisa Expiry Date 2024.04.03');assert.equal(r.fields.expiry,undefined);assert.ok(r.warnings.some(w=>w.includes('冲突')));
 assert.match(validateDocumentReview({kind:'visa',country:'韩国',fields:{expiry:'2027-02-29'}}),/日期/);
 assert.match(validateDocumentReview({kind:'visa',country:'韩国',fields:{maxStay:'999'}}),/天数/);
 assert.match(validateDocumentReview({kind:'visa',country:'韩国',fields:{issuedOn:'2030-01-01',expiry:'2029-01-01'}}),/晚于/);
});
test('a checksum-valid synthetic TD3 passport yields only the expiry date',()=>{
 const r=parseTravelDocument(syntheticMRZ(),{kind:'passport',today:'2026-10-18'});assert.deepEqual(r.fields,{passportExpiry:'2031-02-03'});assert.equal(r.reviewed,false);assert.equal(mrzCheck('TEST00000',checksum('TEST00000')),true);
 const json=JSON.stringify(r);assert.ok(!json.includes('TEST00000'));assert.ok(!json.includes('900101'));assert.ok(!json.includes('EXAMPLE'));
});
test('MRZ checksum failure and impossible expiry require retake/manual review',()=>{
 for(const mrz of [syntheticMRZ({damaged:true}),syntheticMRZ({expiry:'310230'}),'No readable MRZ']){
  const r=parseTravelDocument(mrz,{kind:'passport',today:'2026-10-18'});assert.deepEqual(r.fields,{});assert.ok(r.warnings.length);
 }
 const foreign=parseTravelDocument(syntheticMRZ({nationality:'UTO'}),{kind:'passport',today:'2026-10-18'});assert.ok(foreign.warnings.some(w=>w.includes('中国')));
 const retried=parseTravelDocument(syntheticMRZ({damaged:true})+'\n'+syntheticMRZ(),{kind:'passport',today:'2026-10-18'});assert.equal(retried.fields.passportExpiry,'2031-02-03');
 const fuzzy=syntheticMRZ().replace(/<{5}/,'<K<L<<');const partial=parseTravelDocument(fuzzy,{kind:'passport',today:'2026-10-18'});assert.equal(partial.fields.passportExpiry,'2031-02-03');assert.ok(partial.warnings.some(w=>w.includes('整行未通过')));
});
test('unsupported, empty and oversized image files are rejected before OCR starts',()=>{
 assert.match(validateDocumentFile({type:'application/pdf',size:500}),/JPG/);
 assert.match(validateDocumentFile({type:'image/png',size:0}),/10 MB/);
 assert.match(validateDocumentFile({type:'image/jpeg',size:11*1024*1024}),/10 MB/);
 assert.equal(validateDocumentFile({type:'image/png',size:200000}), '');
});
test('recognition is a preview: profile is untouched until confirmation, and unknowns preserve existing values',()=>{
 const before=defaultProfile();before.passportExpiry='2033-04-05';before.visas.韩国={held:true,expiry:'2028-05-01',entries:'multiple',maxStay:'60',type:'OLD',issuedOn:''};
 const snapshot=structuredClone(before),review={kind:'visa',country:'韩国',fields:{expiry:'2029-04-03',entries:'unknown',maxStay:''}};
 assert.throws(()=>applyDocumentReview(before,review),/核对/);assert.deepEqual(before,snapshot);
 const next=applyDocumentReview(before,{...review,reviewed:true});assert.equal(next.visas.韩国.expiry,'2029-04-03');assert.equal(next.visas.韩国.maxStay,'60');assert.equal(next.visas.韩国.entries,'multiple');assert.equal(next.passportExpiry,'2033-04-05');assert.deepEqual(before,snapshot);
});
test('review/restore allowlists drop injected raw text, scans, IDs, names and unexpected countries',()=>{
 const malicious={...defaultProfile(),name:'SECRET NAME',scan:'data:image/png;base64,PRIVATE',passportNumber:'TEST123',ocrText:'PRIVATE OCR'};malicious.visas.韩国.visaNumber='TEST-VISA';
 const r={kind:'visa',country:'韩国',reviewed:true,fields:{expiry:'2030-01-02',name:'SECRET NAME',ocrText:'PRIVATE OCR',scan:'PRIVATE SCAN'}};
 const next=applyDocumentReview(malicious,r),raw=JSON.stringify(next);for(const value of ['SECRET','PRIVATE','TEST123','TEST-VISA'])assert.ok(!raw.includes(value));
 assert.deepEqual(Object.keys(normalizeProfile(malicious)).sort(),['passportExpiry','visas']);
 assert.throws(()=>applyDocumentReview(next,{...r,country:'__proto__'}),/国家/);assert.throws(()=>parseTravelDocument('text',{kind:'other'}),/护照或签证/);
});
test('photos cannot establish whether a single-entry visa was already used',()=>{
 const p=defaultProfile();p.visas.韩国={held:true,expiry:'2030-01-01',entries:'single',maxStay:'30'};
 const result=visaAssessment({policy:'韩国',domestic:false},p,'2027-01-01','2027-01-03',{countryMap:{},groups:[]},'direct');
 assert.ok(result.checks.some(x=>x.includes('是否已使用')));
});
