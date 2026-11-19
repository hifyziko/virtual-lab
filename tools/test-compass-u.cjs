'use strict';
// Exercise media selection, seeking, recovery and disposal without opening a browser.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/compass-u');
class Node{
 constructor(){this.dataset={};this.attributes={};this.listeners={};this.children=[];this.value='0';this.hidden=false;}
 setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];if(k==='src')this.src='';}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}emit(k){for(const fn of this.listeners[k]||[])fn();}
 append(...v){this.children.push(...v);}replaceChildren(...v){this.children=v;}
}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),nodes=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Node()]));
const video=nodes.get('video');Object.assign(video,{duration:84.125,currentTime:0,paused:true,loads:0,playbackRate:1,load(){this.loads++;},pause(){this.paused=true;this.emit('pause');},async play(){this.paused=false;this.emit('play');}});
nodes.get('speed').value='1';nodes.get('compass-help').showModal=()=>{};nodes.get('compass-help').close=()=>{};
const clips=['assembly','interior'].map(name=>Object.assign(new Node(),{dataset:{clip:name,videoSrc:'compass-u/'+name+'.mp4',videoPoster:'compass-u/'+name+'.jpg'}}));
const phases=['initial','extended'].map(name=>Object.assign(new Node(),{dataset:{phase:name}}));
const listeners=new Map(),timers=new Set(),c={document:{getElementById:id=>nodes.get(id),createElement:()=>new Node(),createTextNode:text=>({textContent:text}),querySelectorAll:selector=>selector==='[data-clip]'?clips:selector==='[data-phase]'?phases:[]},katex:{render:(text,node)=>{node.math=text;}},setTimeout:fn=>{timers.add(fn);return fn;},clearTimeout:fn=>timers.delete(fn),addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:event=>listeners.delete(event)};c.window=c;
vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(dir,'data.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(dir,'app.js'),'utf8'),c);
assert.equal(video.src,'compass-u/assembly.mp4');assert.equal(video.loads,1,'Only the selected clip starts loading');
assert.equal(video.poster,'compass-u/assembly.jpg');
assert.equal(video.paused,true,'No autoplay on module entry');
video.emit('loadedmetadata');assert.equal(nodes.get('seek').disabled,false);video.emit('loadeddata');assert.equal(nodes.get('cover').hidden,true);
video.currentTime=29;clips[1].onclick();assert.equal(video.src,'compass-u/interior.mp4');video.emit('loadedmetadata');assert.equal(video.currentTime,0);
video.currentTime=14;clips[0].onclick();video.emit('loadedmetadata');assert.equal(video.currentTime,29,'Switching clips remembers the previous position');
const seek=nodes.get('seek');video.paused=false;seek.emit('pointerdown');assert(video.paused);seek.value='500';seek.emit('input');assert.equal(video.currentTime,42.0625);listeners.get('pointerup')();assert.equal(video.paused,false,'Dragging resumes previously playing video');
nodes.get('speed').value='0.5';nodes.get('speed').onchange();assert.equal(video.playbackRate,.5);
phases[1].onclick();assert.equal(nodes.get('heating').children[0].children[1].math,'\\text{až }8\\,\\mathrm{MW}');assert.equal(nodes.get('heating').children[1].children[1].math,'\\text{až }10\\,\\mathrm{MW}');
video.emit('error');assert.equal(nodes.get('cover').hidden,false);assert.equal(nodes.get('retry').hidden,false);nodes.get('retry').onclick();assert.equal(video.loads,4);assert.equal(nodes.get('retry').hidden,true);
c.HiFyzikoFusionDispose();assert(video.paused);assert.equal(video.src,'');assert.equal(timers.size,0);assert.equal(listeners.size,0);
for(const file of ['assembly.mp4','interior.mp4']){
 const b=fs.readFileSync(path.join(dir,file));assert.equal(b.toString('ascii',4,8),'ftyp','Playable MP4 container required');assert(b.length>1000000);
 let p=-1,dimensions;while((p=b.indexOf('avc1',p+1))>=0){const size=b.readUInt32BE(p-4);if(size>=86&&p-4+size<=b.length)dimensions=[b.readUInt16BE(p+28),b.readUInt16BE(p+30)];}
 assert.deepEqual(dimensions,[1920,1080],file+' must be the final Full HD video, not the old low-resolution preview');
 const moov=b.indexOf('moov'),mdat=b.indexOf('mdat');assert(moov>=0&&mdat>moov,file+' metadata must precede media for web playback');
}
const katex=require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js');
for(const [,value]of [...c.CompassUData.parameters,...Object.values(c.CompassUData.heating).flatMap(phase=>phase.rows)])katex.renderToString(value,{throwOnError:true});
assert(!html.includes('<iframe'),'The showcase must play video directly');assert(!/\.blend|\.step|\.npz/i.test(html),'Private CAD is not a web dependency');
console.log('PASS: COMPASS-U lazy clip selection, remembered time, scrub/resume, speed, planned heating stages, loading recovery and media disposal.');
