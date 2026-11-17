'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'princip.js'),'utf8'),start=source.indexOf('function createFieldPassingSound('),end=source.indexOf('\nconst fieldPassingSound=',start),scope={Math};
assert(start>=0&&end>start);vm.createContext(scope);vm.runInContext(source.slice(start,end),scope);
class Param{constructor(){this.value=0;this.events=[];}cancelScheduledValues(...args){this.events.push(['cancel',...args]);}setTargetAtTime(...args){this.events.push(['target',...args]);}setValueAtTime(...args){this.events.push(['value',...args]);}linearRampToValueAtTime(...args){this.events.push(['linear',...args]);}exponentialRampToValueAtTime(...args){this.events.push(['exponential',...args]);}}
const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
class Audio{constructor(){Audio.last=this;this.currentTime=0;this.state='suspended';this.sampleRate=8000;this.destination={};this.sources=[];this.gains=[];this.filters=[];}createGain(){const n={...node(),gain:new Param()};this.gains.push(n);return n;}createBuffer(_channels,length){return {getChannelData:()=>new Float32Array(length)};}createBufferSource(){const n={...node(),start:t=>{n.started=t;},stop:t=>{n.stopped=t;}};this.sources.push(n);return n;}createBiquadFilter(){const n={...node(),Q:{},frequency:new Param()};this.filters.push(n);return n;}resume(){this.state='running';return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}at(time){this.currentTime=time;for(const n of this.sources)if(n.onended&&n.stopped<=time){const ended=n.onended;n.onended=null;ended();}}}
const create=()=>scope.createFieldPassingSound({AudioContext:Audio});
const state=(field=0,t=0,patch={})=>({type:'salient',field,rotor:0,t,fieldOmega:7,omega:0,excitation:true,excitationLevel:1,...patch});
(async()=>{
 const sound=create();sound.update(state(),true);assert.equal(Audio.last,undefined,'No AudioContext before explicit enable');await sound.setEnabled(true);const audio=Audio.last;assert(sound.enabled);assert.equal(audio.state,'running');
 const update=(field,t,patch={},playing=true)=>{audio.at(t);const s=Object.freeze(state(field,t,patch)),before=JSON.stringify(s);sound.update(s,playing);assert.equal(JSON.stringify(s),before,'Audio cannot alter the physics');};
 update(.2*Math.PI,.01);assert.equal(audio.sources.length,0,'First sample establishes phase');update(1.1*Math.PI,.06);assert.equal(audio.sources.length,1,'Relative pole passage makes one whoosh');
 update(1.5*Math.PI,.11);assert.equal(audio.sources.length,1);update(.9*Math.PI,.16,{fieldOmega:-7});assert.equal(audio.sources.length,2,'Reverse passage also sounds');
 update(-.1*Math.PI,.21,{fieldOmega:7,omega:7});assert.equal(audio.sources.length,2,'Synchronous motion is quiet');
 update(-1.1*Math.PI,.26,{excitation:false});assert.equal(audio.sources.length,2,'No rotor field means no field-passage sound');
 update(-2.1*Math.PI,.31,{},false);assert.equal(audio.sources.length,2,'Paused animation is quiet');assert.equal(audio.gains[0].gain.events.at(-1)[1],0,'Master gain is muted');
 update(100*Math.PI,0);assert.equal(audio.sources.length,2,'New experiment rebases the phase');update(101*Math.PI,.05,{type:'ipm4'});assert.equal(audio.sources.length,2,'Changing rotor type does not make a burst');
 await sound.setEnabled(false);update(104*Math.PI,.1);assert.equal(audio.sources.length,2,'Explicit off remains quiet');sound.dispose();assert.equal(audio.state,'closed');assert(audio.sources.every(n=>n.disconnected),'Dispose disconnects every voice');
 for(const [type,expected]of [['salient',0],['ipm4',1]]){const s=create();await s.setEnabled(true);const a=Audio.last;s.update(state(0,0,{type}),true);a.at(.1);s.update(state(.6*Math.PI,.06,{type}),true);assert.equal(a.sources.length,expected,'Electrical pole-pair count controls crossings');s.dispose();}
 const unavailable=scope.createFieldPassingSound({});assert.equal(await unavailable.setEnabled(true),false);assert(unavailable.unavailable);unavailable.update(state(),true);unavailable.dispose();
 console.log('PASS: opt-in audio, pole passages in both directions, electrical pole count, synchronism, excitation, pause, reset, mute, safe fallback and audio disposal.');
})().catch(error=>{console.error(error);process.exitCode=1;});
