'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/confinement');
const M=require(path.join(root,'model.js')),C=require(path.join(root,'atlas-codec.js'));
const presets={default:[.65,.18],compass:[.89,.27],iter:[6.2,2],jet:[2.95,1.25],sparc:[1.85,.57]};
fs.mkdirSync(path.join(root,'atlases'),{recursive:true});
for(const id of process.argv.slice(2).length?process.argv.slice(2):Object.keys(presets)){
 const [R,a]=presets[id],ratio=a/R,steps=200,parts=[],offsets=[0];
 for(let i=0;i<=steps;i++){const data=M.bendData({mode:'bend',ideal:false,R0:.65,a:.65*ratio,bend:i/steps}),packed=C.pack(data);parts.push(Buffer.from(packed.buffer));offsets.push(offsets.at(-1)+packed.length);if(i%40===0)console.log(id+' '+i+'/'+steps);}
 const metadata={schema:1,id,ratio,steps,offsets,data:Buffer.concat(parts).toString('base64')};
 fs.writeFileSync(path.join(root,'atlases',id+'.js'),'window.HiFyzikoBendAtlases=window.HiFyzikoBendAtlases||{};window.HiFyzikoBendAtlases['+JSON.stringify(id)+']='+JSON.stringify(metadata)+';\n');
 console.log(id+' ready, '+Math.round(offsets.at(-1)*4/1024/1024)+' MiB binary');
}
