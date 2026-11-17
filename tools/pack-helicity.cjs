'use strict';
// Repackage existing quantized samples; never run a physics solver at build time.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const key=s=>s.banana?`b-${s.electricZ?-500:0}-${s.i}`:`${s.electricZ?'e':'m'}-${s.i}`;
function pack(folder,write){
 const groups=new Map();
 for(let part=0;part<18;part++){
  const env={window:{}};vm.runInNewContext(fs.readFileSync(path.join(folder,part+'.js'),'utf8'),env);
  const raw=env.window.HiFyzikoHelicityData[part],bytes=Buffer.from(raw.data,'base64');
  for(const state of raw.states){
   const name=key(state);if(!groups.has(name))groups.set(name,{schema:1,sourceSha:raw.sourceSha,states:[],parts:[],length:0});
   const g=groups.get(name),length=state.lineLength+state.pathLength;
   g.states.push({...state,dataPart:name,offset:g.length});
   g.parts.push(Buffer.from(bytes.subarray(state.offset*2,(state.offset+length)*2)));g.length+=length;
  }
 }
 for(const [name,g] of groups){
  const raw={schema:g.schema,sourceSha:g.sourceSha,states:g.states,data:Buffer.concat(g.parts).toString('base64')};
  write(name,raw);
  groups.delete(name);
 }
}
module.exports={pack,key};
