import test from 'node:test';
import assert from 'node:assert/strict';
import {createNavigation} from '../src/navigation.mjs';

function browser(href='https://example.test/'){
 const listeners=new Map(),win=new EventTarget();win.location=new URL(href);
 win.document={addEventListener:(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener:(name,fn)=>listeners.get(name)?.delete(fn)};
 const entries=[href];let index=0;
 win.history={pushState(_state,_title,url){win.location=new URL(url,win.location);entries.splice(++index);entries.push(win.location.href);},replaceState(_state,_title,url){win.location=new URL(url,win.location);entries[index]=win.location.href;},back(){if(index){win.location=new URL(entries[--index]);win.dispatchEvent(new Event('popstate'));}}};
 function click(href,options={}){const attrs={href,...options.attrs},anchor={getAttribute:name=>attrs[name]??null,hasAttribute:name=>Object.hasOwn(attrs,name),closest:()=>anchor};const e={target:anchor,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...options};listeners.get('click')?.forEach(fn=>fn(e));return e;}
 return {win,click,listenerCount:()=>listeners.get('click')?.size||0};
}

test('internal routes use history, normalize trailing slashes and notify browser back',()=>{
 const {win,click}=browser('https://example.test/encyclopedia/?continent=asia');
 const nav=createNavigation(win),seen=[];nav.attach();nav.subscribe(()=>seen.push(nav.current().key));
 assert.equal(win.location.pathname,'/encyclopedia');assert.equal(nav.current().id,'encyclopedia');
 assert.equal(click('/insights/').defaultPrevented,true);assert.equal(nav.current().id,'insights');
 assert.equal(click('/').defaultPrevented,true);assert.equal(nav.current().id,'home');
 win.history.back();assert.equal(nav.current().id,'insights');assert.deepEqual(seen,['/insights','/','/insights']);nav.dispose();
});

test('guide and wishlist query links remain distinct route entries with their parameters',()=>{
 const {win,click}=browser('https://example.test/encyclopedia');const nav=createNavigation(win);nav.attach();
 assert.equal(click('/?place=kyoto-autumn&guide=1').defaultPrevented,true);
 assert.equal(nav.current().key,'/?place=kyoto-autumn&guide=1');assert.equal(win.location.search,'?place=kyoto-autumn&guide=1');
 assert.equal(click('/?wishlist=1').defaultPrevented,true);assert.equal(nav.current().key,'/?wishlist=1');nav.dispose();
});

test('modified, external, download, fragment and already-handled links keep browser behavior',()=>{
 const {win,click}=browser();const nav=createNavigation(win);nav.attach();
 for(const [href,options]of [['/encyclopedia',{ctrlKey:true}],['/encyclopedia',{metaKey:true}],['/encyclopedia',{shiftKey:true}],['/encyclopedia',{altKey:true}],['/encyclopedia',{button:1}],['/encyclopedia',{attrs:{target:'_blank'}}],['/encyclopedia',{attrs:{target:'_top'}}],['/encyclopedia',{attrs:{download:''}}],['/encyclopedia',{defaultPrevented:true}],['https://other.test/encyclopedia',{}],['http://[',{}],['/signin-with-chatgpt?return_to=%2Finsights',{}],['#guide-money',{}]]){
  const event=click(href,options);assert.equal(win.location.href,'https://example.test/',href);assert.equal(event.defaultPrevented,options.defaultPrevented||false,href);
 }
 nav.dispose();
});

test('the portable single file routes in its fragment without leaving the saved file',()=>{
 const {win,click}=browser('file:///Downloads/shanhe.html');win.__SHANHE_PORTABLE__=true;const nav=createNavigation(win);nav.attach();
 assert.equal(nav.current().id,'home');assert.equal(click('/encyclopedia/').defaultPrevented,true);
 assert.equal(win.location.pathname,'/Downloads/shanhe.html');assert.equal(win.location.hash,'#/encyclopedia');assert.equal(nav.current().id,'encyclopedia');
 click('/?place=kyoto-autumn&guide=1');assert.equal(nav.current().key,'/?place=kyoto-autumn&guide=1');assert.equal(win.location.search,'?place=kyoto-autumn&guide=1','legacy calendar query readers must see guide parameters offline');win.history.back();assert.equal(nav.current().id,'encyclopedia');nav.dispose();
});

test('navigation survives a StrictMode attach, cleanup, attach cycle without leaking listeners',()=>{
 const {win,click,listenerCount}=browser();const discarded=createNavigation(win),nav=createNavigation(win);
 assert.equal(listenerCount(),0,'constructing a discarded render must not attach global listeners');
 const cleanup=nav.attach();assert.equal(listenerCount(),1);cleanup();assert.equal(listenerCount(),0);
 const nextCleanup=nav.attach(),seen=[];nav.subscribe(()=>seen.push(nav.current().key));click('/encyclopedia');
 assert.deepEqual(seen,['/encyclopedia']);assert.equal(listenerCount(),1);nextCleanup();assert.equal(listenerCount(),0);discarded.dispose();nav.dispose();
});

test('portable wishlist events navigate out of the encyclopedia once and home events keep their existing handler',()=>{
 const {win}=browser('file:///Downloads/shanhe.html#/encyclopedia');const nav=createNavigation(win);nav.attach();const seen=[];nav.subscribe(()=>seen.push(nav.current().key));
 win.dispatchEvent(new Event('shanhe-open-wishlist'));assert.equal(nav.current().key,'/?wishlist=1');assert.equal(win.location.search,'?wishlist=1');
 win.dispatchEvent(new Event('shanhe-open-wishlist'));assert.deepEqual(seen,['/?wishlist=1']);nav.dispose();
});
