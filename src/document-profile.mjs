// Only travel-planning fields may cross the transient OCR/review boundary.
export const VISA_COUNTRIES=['日本','韩国','美国','英国','申根','新西兰'];
const blankVisa=()=>({held:false,expiry:'',entries:'unknown',maxStay:'',type:'',issuedOn:''});
export function defaultProfile(){return{passportExpiry:'',visas:Object.fromEntries(VISA_COUNTRIES.map(c=>[c,blankVisa()]))};}
export function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T12:00:00Z');return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value;
}
const safeDate=x=>validDate(x)?x:'';
const safeStay=x=>/^\d{1,3}$/.test(String(x))&&+x>=1&&+x<=365?String(+x):'';
const safeType=x=>typeof x==='string'&&/^[A-Z0-9][A-Z0-9 /-]{0,23}$/i.test(x)?x.trim():'';
export function normalizeProfile(raw){
 const result=defaultProfile();result.passportExpiry=safeDate(raw?.passportExpiry);
 for(const country of VISA_COUNTRIES){const visa=raw?.visas?.[country];if(!visa)continue;result.visas[country]={held:visa.held===true,expiry:safeDate(visa.expiry),entries:['single','multiple'].includes(visa.entries)?visa.entries:'unknown',maxStay:safeStay(visa.maxStay),type:safeType(visa.type),issuedOn:safeDate(visa.issuedOn)};}
 return result;
}
export function mrzCheck(value,digit){
 if(!/^[A-Z0-9<]+$/.test(value)||!/^\d$/.test(digit))return false;
 const sum=[...value].reduce((n,c,i)=>n+(c==='<'?0:/\d/.test(c)?+c:c.charCodeAt(0)-55)*[7,3,1][i%3],0);return sum%10===+digit;
}
function mrzExpiry(value,today){
 const year=+today.slice(0,4),yy=+value.slice(0,2);
 const candidates=[1900+yy,2000+yy,2100+yy].filter(y=>y>=year-15&&y<=year+20);
 if(candidates.length!==1)return'';
 return safeDate(`${candidates[0]}-${value.slice(2,4)}-${value.slice(4,6)}`);
}
function readPassportMRZ(text,today){
 const lines=text.toUpperCase().split(/\r?\n/).map(x=>x.replace(/\s/g,'').replace(/[«‹]/g,'<'));
 const candidates=lines.flatMap((line,i)=>/^P[A-Z<][A-Z<]{3}/.test(line)&&line.length>=35&&line.length<=65&&/^[A-Z0-9<]{9}\d[A-Z]{3}\d{7}[MFX<]\d{7}/.test(lines[i+1]||'')?[i]:[]);
 if(!candidates.length)return{fields:{},warnings:['没有读到完整的护照机读码。请拍摄含底部两行字符的资料页，或手动填写。']};
 const complete=candidates.find(i=>{const b=lines[i+1];return lines[i].length===44&&b.length===44&&mrzCheck(b.slice(0,9),b[9])&&mrzCheck(b.slice(13,19),b[19])&&mrzCheck(b.slice(21,27),b[27])&&mrzCheck(b.slice(0,10)+b.slice(13,20)+b.slice(21,43),b[43]);});
 // Filler runs are often misread by general English OCR. Retain a date-only
 // preview when both date check digits pass, and explicitly flag partial checks.
 const partial=candidates.find(i=>{const b=lines[i+1];return mrzCheck(b.slice(13,19),b[19])&&mrzCheck(b.slice(21,27),b[27]);});
 const index=complete??partial;
 if(index===undefined)return{fields:{},warnings:['护照日期字段校验未通过，未自动填入日期。请换一张清晰、无反光的照片。']};
 const a=lines[index],b=lines[index+1];
 const expiry=mrzExpiry(b.slice(21,27),today),warnings=[];
 if(complete===undefined)warnings.push('到期日与出生日期的校验位通过，但机读码整行未通过校验。这里只提供到期日候选，请对照原件逐字核对。');
 if(a.slice(2,5)!=='CHN'||b.slice(10,13)!=='CHN')warnings.push('这本护照并非中国普通护照的完整匹配，当前入境检查仍按中国大陆普通护照演示，请另外核验国籍适用规则。');
 if(!expiry)warnings.push('护照到期日无法可靠判断，请手动填写。');
 return{fields:expiry?{passportExpiry:expiry}:{},warnings};
}
const DATE_SOURCE='(?:19|20|21)\\d{2}[.\\/-]\\s*\\d{1,2}[.\\/-]\\s*\\d{1,2}';
function datesIn(text){return [...text.matchAll(new RegExp(DATE_SOURCE,'g'))].map(m=>{const [y,mm,d]=m[0].split(/[.\/-]/).map(x=>x.trim());return safeDate(`${y}-${mm.padStart(2,'0')}-${d.padStart(2,'0')}`);}).filter(Boolean);}
function labeledDate(text,label){
 // Never fall back to "largest date on the page": it may be passport expiry.
 const match=text.match(new RegExp(label+'[^\\n]{0,65}','i'));
 return match?datesIn(match[0])[0]||'':'';
}
function visaFields(text,country){
 const fields={},warnings=[],upper=text.toUpperCase();
 const expiry=labeledDate(text,'(?:VISA\\s*EXPIR(?:Y|ATION)(?:\\s*DATE)?|VALID\\s*UNTIL|DATE\\s*OF\\s*EXPIRY|EXPIRES(?:\\s*ON)?)');
 const issue=labeledDate(text,'(?:DATE\\s*OF\\s*ISSUE|ISSUE\\s*DATE)');
 if(expiry)fields.expiry=expiry;if(issue)fields.issuedOn=issue;
 const entry=upper.match(/(?:NUMBER\s*OF\s*ENTRIES|ENTRIES)\s*[:：]?\s*(MULTIPLE|SINGLE|M|1)\b/);
 if(entry)fields.entries=/^(MULTIPLE|M)$/.test(entry[1])?'multiple':'single';
 const days=text.match(/(?:DURATION|PERIOD)\s*OF\s*STAY[^\n]{0,35}?\b(\d{1,3})\s*DAYS?\b/i);
 if(days&&safeStay(days[1]))fields.maxStay=safeStay(days[1]);
 const type=text.match(/(?:VISA\s*(?:TYPE|CLASS)|STATUS\s*OF\s*STAY)[ \t]*[:：]?[ \t]*([A-Z][A-Z0-9-]{0,20})/i);
 if(type&&/\d/.test(type[1])&&safeType(type[1]))fields.type=safeType(type[1]);
 if(country==='韩国'){
  if(!/REPUBLIC\s*OF\s*KOREA|VISA\s*GRANT\s*NOTICE|KOREAN\s*CONSULATE/i.test(text))warnings.push('未明确识别为韩国签证，请先核对所选国家。');
  // Korean grant notices have a multi-column table; the three date labels are distinct.
  const passportExpiry=labeledDate(text,'PASSPORT\\s*EXPIR(?:ATION|Y)(?:\\s*DATE)?');
  if(passportExpiry)fields.passportExpiry=passportExpiry;
  const visaSection=upper.match(/VISA\s*DETAILS([\s\S]{0,1000}?)(?:REMARKS|THIS\s*DOCUMENT)/)?.[1]||upper.match(/STATUS\s*OF\s*STAY([\s\S]{0,600}?)DATE\s*OF\s*ISSUE/)?.[1];
  if(visaSection){
   const code=visaSection.match(/\b([A-Z][ -]?\d{1,2}[ -]\d{1,2})\b/);if(code)fields.type=code[1].replaceAll(' ','-');
   if(!fields.entries&&/\bMULTIPLE\b/.test(visaSection))fields.entries='multiple';
   if(!fields.maxStay){const stay=visaSection.match(/\b(\d{1,3})\s*DAYS\b/);if(stay&&safeStay(stay[1]))fields.maxStay=safeStay(stay[1]);}
  }
  // Only use dates within the actual visa-table region, never DOB / print timestamps.
  const table=upper.match(/DATE\s*OF\s*ISSUE([\s\S]{0,450}?)(?:REMARKS|THIS\s*DOCUMENT|MINISTER)/);
  if(table&&/VALIDITY\s*PERIOD/.test(table[1])){
   const dates=datesIn(table[1]);if(dates.length===2&&dates[0]<dates[1]){fields.issuedOn=dates[0];fields.expiry=dates[1];}
  }
 }
 if(fields.issuedOn&&fields.expiry&&fields.issuedOn>fields.expiry){delete fields.issuedOn;delete fields.expiry;warnings.push('签发日与到期日顺序存在冲突，已留空，请对照原件填写。');}
 if(!fields.expiry)warnings.push('未可靠识别签证到期日，请对照原件补充；不会用照片中的其他日期代替。');
 warnings.push('入境次数、单次停留与实际可用性需要本人核对；单次签证是否已使用无法由照片判断。');
 return{fields,warnings};
}
export function parseTravelDocument(text,{kind='visa',country='韩国',today=new Date().toISOString().slice(0,10)}={}){
 if(!['visa','passport'].includes(kind))throw new Error('请选择护照或签证');
 if(kind==='visa'&&!VISA_COUNTRIES.includes(country))throw new Error('请选择支持的签证国家或地区');
 if(typeof text!=='string'||text.length>200000)throw new Error('识别结果无效，请更换照片');
 const clean=text.replace(/\u0000/g,'');
 const result=kind==='passport'?readPassportMRZ(clean,today):visaFields(clean,country);
 return{kind,country:kind==='visa'?country:null,fields:result.fields,warnings:result.warnings,reviewed:false};
}
export function validateDocumentReview(review){
 if(!review||!['visa','passport'].includes(review.kind))return'请选择要录入的证件';
 const f=review.fields||{};
 if(review.kind==='visa'&&!VISA_COUNTRIES.includes(review.country))return'请选择签证国家或地区';
 for(const key of ['passportExpiry','expiry','issuedOn'])if(f[key]&&!validDate(f[key]))return'请检查日期是否真实有效';
 if(f.maxStay&&!safeStay(f.maxStay))return'单次停留天数需在1至365天之间';
 if(f.type&&!safeType(f.type))return'签证类型请使用24个字符以内的字母、数字、空格、斜线或短横线';
 if(f.issuedOn&&f.expiry&&f.issuedOn>f.expiry)return'签发日不能晚于到期日';
 if(f.entries&&!['single','multiple','unknown'].includes(f.entries))return'请核对入境次数';
 if(review.kind==='passport'?!f.passportExpiry:!['expiry','issuedOn','maxStay','type'].some(k=>f[k])&&!['single','multiple'].includes(f.entries))return'尚无可录入字段，请补充或手动填写';
 return'';
}
export function applyDocumentReview(profile,review){
 if(review?.reviewed!==true)throw new Error('请先对照原件核对并勾选确认');
 const error=validateDocumentReview(review);if(error)throw new Error(error);
 const next=normalizeProfile(profile),f=review.fields;
 if(f.passportExpiry)next.passportExpiry=f.passportExpiry;
 if(review.kind==='visa'){
  const visa=next.visas[review.country];visa.held=true;
  for(const key of ['expiry','issuedOn','maxStay','type'])if(f[key])visa[key]=f[key];
  if(['single','multiple'].includes(f.entries))visa.entries=f.entries;
 }
 return next;
}
