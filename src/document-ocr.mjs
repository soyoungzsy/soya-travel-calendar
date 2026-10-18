import {createWorker} from 'tesseract.js';

export const DOCUMENT_LIMIT=10*1024*1024;
export function validateDocumentFile(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))return'请选择 JPG、PNG 或 WebP 照片；PDF、HEIC 请先转成图片。';
 if(!file.size||file.size>DOCUMENT_LIMIT)return'照片需在10 MB以内，请裁剪或压缩后重试。';
 return'';
}
async function imageCanvas(file){
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>24000000)throw new Error('照片分辨率过大，请裁剪到证件资料页后重试。');
  const scale=Math.min(3,3000/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('当前浏览器无法读取照片，请换一个浏览器或手动填写。');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  return canvas;
 }finally{bitmap.close();}
}
export function createLocalRecognizer(onProgress=()=>{}){
 let worker=null,closed=false,canvas=null,timer=null,rejectCancelled=null;
 const stop=()=>{closed=true;clearTimeout(timer);rejectCancelled?.(new Error('已取消识别'));rejectCancelled=null;if(canvas){canvas.width=0;canvas.height=0;canvas=null;}if(worker){void worker.terminate().catch(()=>{});worker=null;}};
 async function recognize(file,{kind='visa'}={}){
  const invalid=validateDocumentFile(file);if(invalid)throw new Error(invalid);
  if(globalThis.__SHANHE_PORTABLE__||location.protocol==='file:')throw new Error('单文件下载版未包含识别引擎，请使用在线版或手动填写。');
  const cancelled=new Promise((_,reject)=>{rejectCancelled=reject;});
  const timedOut=new Promise((_,reject)=>{timer=setTimeout(()=>{reject(new Error('本机识别超时，请裁剪证件区域或改用手动填写。'));stop();},90000);});
  const task=(async()=>{
   onProgress({stage:'正在准备照片',progress:0});canvas=await imageCanvas(file);if(closed)throw new Error('已取消识别');
   // These are same-origin, self-hosted assets. Never use Tesseract's CDN defaults.
   const root=new URL('/ocr/',location.origin).href;
   worker=await createWorker('eng',1,{workerPath:root+'worker.min.js',corePath:root+'core',langPath:root+'lang',workerBlobURL:false,cacheMethod:'none',logger:m=>{if(!closed)onProgress({stage:m.status==='recognizing text'?'正在识别照片':'正在准备本机识别引擎',progress:Math.max(0,Math.min(1,m.progress||0))});},errorHandler:()=>{}});
   if(closed){await worker.terminate();worker=null;throw new Error('已取消识别');}
   await worker.setParameters({tessedit_pageseg_mode:'3',preserve_interword_spaces:'1'});
   const first=await worker.recognize(canvas,{}, {text:true});
   if(kind!=='passport')return first.data.text;
   // The MRZ normally sits at the foot of a passport's biographical page.
   await worker.setParameters({tessedit_pageseg_mode:'6',tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'});
   const second=await worker.recognize(canvas,{rectangle:{left:0,top:Math.floor(canvas.height*.6),width:canvas.width,height:Math.ceil(canvas.height*.4)}},{text:true});
   return first.data.text+'\n'+second.data.text;
  })();
  try{return await Promise.race([task,timedOut,cancelled]);}finally{rejectCancelled=null;stop();}
 }
 return{recognize,cancel:stop};
}
