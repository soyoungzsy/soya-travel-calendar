// A timeout changes the message, not the request: a slow download can still finish.
export function createRouteLoader(loaders,{delay=12000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let state={status:'idle',route:null,attempt:0,Component:null},generation=0,timer;
 const listeners=new Set(),update=next=>{state=next;listeners.forEach(listener=>listener());};
 function load(route,key=route){
  const attempt=++generation;clearTimer(timer);
  update({status:'loading',route,key,attempt,Component:null});
  timer=setTimer(()=>{if(attempt===generation)update({...state,status:'slow'});},delay);
  Promise.resolve().then(()=>loaders[route]()).then(Component=>{
   if(attempt!==generation)return;clearTimer(timer);update({status:'ready',route,key,attempt,Component});
  }).catch(()=>{
   if(attempt!==generation)return;clearTimer(timer);update({status:'error',route,key,attempt,Component:null});
  });
 }
 return{load,retry:()=>load(state.route,state.key),snapshot:()=>state,subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},dispose(){generation++;clearTimer(timer);listeners.clear();}};
}
