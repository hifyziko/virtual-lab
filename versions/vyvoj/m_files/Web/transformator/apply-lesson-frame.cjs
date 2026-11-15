const fs=require('node:fs'),path=require('node:path');
const ids=new Set(['tr01-matematicky','tr02-magnetizacni','tr03-schema','tr04-pricna-vetev','tr05-rozptylova-reaktance','tr06-hodinove-cislo','tr08-zkratovy-proud']);
module.exports=function(source,id){
 if(!ids.has(id))return source;
 if(id==='tr08-zkratovy-proud')source=require('./static-short-circuit.cjs')(source);
 source=source.replace(/<style id="lesson-paint-guard">[\s\S]*?<\/style>/g,'');
 source=source.replace(/<!-- transformer-frame:start -->[\s\S]*?<!-- transformer-frame:end -->/g,'');
 source=source.replace(/<main\b([^>]*)>/,(_,attrs)=>'<main'+attrs.replace(/\sdata-transformer-lesson="[^"]*"/g,'')+' data-transformer-lesson="'+id+'">');
 source=source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,block=>block.includes('window.PowerLabMath={rich,latex}')?'':block);
 source=source.replace(/<!-- lesson-head:start -->[\s\S]*?<!-- lesson-head:end -->/g,'');
 if(id==='tr08-zkratovy-proud'){
  const uniform=source.match(/<style id="uniform-module-layout">[\s\S]*?<\/style>/);
  if(uniform){source=source.replace(uniform[0],'');source=source.replace('</head>',()=>uniform[0]+'</head>');}
 }
 const finalStyle=fs.readFileSync(path.join(__dirname,'lesson-frame.css'),'utf8');
 if(id==='tr08-zkratovy-proud')source=source.replace('</head>',()=> '<!-- lesson-head:start --><style>'+finalStyle+'</style><!-- lesson-head:end --></head>');
 const math=fs.readFileSync(path.join(__dirname,'../powerlab-math.js'),'utf8');
 const shared=id==='tr03-schema'?fs.readFileSync(path.join(__dirname,'shared.css'),'utf8'):'';
 return source.replace('</body>',()=> '<!-- transformer-frame:start --><style>'+shared+(id==='tr08-zkratovy-proud'?'':finalStyle)+'</style><script>'+fs.readFileSync(path.join(__dirname,'lesson-frame.js'),'utf8')+'</script><script>'+math+'</script><!-- transformer-frame:end --></body>');
};
