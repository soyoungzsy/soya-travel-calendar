const routes={'/':'home','/encyclopedia':'encyclopedia','/insights':'insights'};
const canonicalPath=path=>path.replace(/\/+$/,'')||'/';

// All existing anchors stay usable without JavaScript, with modified clicks and offline.
export function createNavigation(win=window){
 const portable=win.__SHANHE_PORTABLE__||win.location.protocol==='file:',listeners=new Set();
 function address(){
  if(!portable)return new URL(win.location.href);
  const url=new URL(win.location.hash.startsWith('#/')?win.location.hash.slice(1):'/','https://offline.local');
  // Keep queries in location.search for the existing calendar's guide/wishlist reader.
  if(win.location.search)url.search=win.location.search;
  return url;
 }
 const hrefFor=url=>portable?win.location.pathname+url.search+'#'+url.pathname+url.hash:url.pathname+url.search+url.hash;
 function read(){const url=address(),pathname=canonicalPath(url.pathname);return{id:routes[pathname]||'home',pathname,search:url.search,hash:url.hash,key:pathname+url.search};}
 function normalize(){const url=address(),path=canonicalPath(url.pathname);if(routes[path]&&url.pathname!==path){url.pathname=path;win.history.replaceState(null,'',hrefFor(url));}}
 let current=read(),attached=false;
 function publish(){normalize();const next=read();if(next.key===current.key&&next.hash===current.hash)return;current=next;listeners.forEach(listener=>listener());}
 function navigate(href){
  let url;try{url=new URL(href,address());}catch{return false;}url.pathname=canonicalPath(url.pathname);
  if(url.origin!==address().origin||!routes[url.pathname])return false;
  if(url.pathname+url.search+url.hash!==current.key+current.hash){win.history.pushState(null,'',hrefFor(url));publish();}
  return true;
 }
 function click(event){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target.closest?.('a[href]');if(!anchor||anchor.hasAttribute('download'))return;
  const target=anchor.getAttribute('target'),href=anchor.getAttribute('href');
  if((target&&target.toLowerCase()!=='_self')||!href||href.startsWith('#')||anchor.getAttribute('rel')?.split(/\s+/).includes('external'))return;
  if(navigate(href))event.preventDefault();
 }
 // Older toast handlers emit this event on file: URLs instead of following their link.
 function openWishlist(){if(current.id!=='home')navigate('/?wishlist=1');}
 function detach(){if(!attached)return;attached=false;win.document.removeEventListener('click',click);win.removeEventListener('popstate',publish);win.removeEventListener('shanhe-open-wishlist',openWishlist);if(portable)win.removeEventListener('hashchange',publish);}
 function attach(){
  if(!attached){attached=true;normalize();current=read();win.document.addEventListener('click',click);win.addEventListener('popstate',publish);win.addEventListener('shanhe-open-wishlist',openWishlist);if(portable)win.addEventListener('hashchange',publish);}
  return detach;
 }
 return{attach,current:()=>current,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},navigate,dispose(){detach();listeners.clear();}};
}
