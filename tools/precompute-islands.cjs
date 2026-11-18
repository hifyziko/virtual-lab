'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),file=path.join(root,'versions/vyvoj/m_files/fusion/islands/model.js'),{Model}=require(file);
const cases={};
for(const [key,a]of [['growing',.7],['damped',2]]){
 const m=new Model({a}),frames=[m.snapshot()],dt=.008;
 for(let i=1;i<=20000;i++){m.step(dt);if(i%125===0)frames.push(m.snapshot());if(m.width>.12*a)break;}
 if(frames.at(-1).time!==m.time)frames.push(m.snapshot());
 cases[key]={a:m.a,k:m.k,eta:m.eta,nu:m.nu,n:m.n,x:Array.from(m.x),delta:m.delta,frames};
 console.log(key,frames.length,'t',m.time,'amplitude',m.amplitude,'width/a',m.width/a);
}
fs.writeFileSync(path.join(root,'versions/vyvoj/m_files/fusion/islands/data.js'),'window.IslandData='+JSON.stringify({modelHash:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),cases})+';\n');
