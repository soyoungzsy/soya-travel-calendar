export function createDampedTicks(){
 let ctx=null,enabled=false,distance=0,last=0;
 return {
  async enable(value){if(!value){enabled=false;distance=0;return true;}const Constructor=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Constructor)return false;ctx ||= new Constructor();await ctx.resume();enabled=ctx.state==='running';return enabled;},
  move(degrees,speed){if(!enabled||!ctx||ctx.state!=='running')return;distance+=Math.abs(degrees);const now=ctx.currentTime;if(distance<3||now-last<.048)return;distance%=3;last=now;
   const duration=.018,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/ctx.sampleRate*350);
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1100+Math.min(.25,Math.abs(speed))*1600;filter.Q.value=.7;gain.gain.value=Math.min(.065,.025+Math.abs(speed)*.15);source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start(now);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  },
  close(){enabled=false;ctx?.close();ctx=null;}
 };
}
