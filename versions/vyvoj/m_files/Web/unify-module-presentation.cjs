const fs=require('fs'),path=require('path');
const root=__dirname,css=fs.readFileSync(path.join(root,'uniform-module-layout.css'),'utf8');
function lesson(source,id){
 // Legacy standalone lessons sometimes omit optional head/body tags. Insert
 // explicit boundaries before injecting styles instead of silently skipping them.
 if(!source.includes('</head>')){
  source=source.replace(/<html\b[^>]*>/,tag=>tag+'<head>');
  source=source.replace(/<(header|main)\b/, '</head><body><$1');
 }
 if(!source.includes('</body>'))source=source.replace('</html>','</body></html>');
 source=source.replace(/<style id="uniform-module-layout">[\s\S]*?<\/style>/g,'');
 source=source.replace(/<main\b([^>]*)>/,(all,attrs)=>{
  if(/class=/.test(attrs))return '<main'+attrs.replace(/class="([^"]*)"/,(_,c)=>'class="'+[c.replace(/\s*uniform-module-layout/g,'').trim(),'uniform-module-layout'].filter(Boolean).join(' ')+'"')+'>';
  return '<main class="uniform-module-layout"'+attrs+'>';
 });
 // Put the rule last, including after legacy body styles.
 source=source.replace('</body>',()=>'<style id="uniform-module-layout">'+css+'</style></body>');
 source=require('./transformator/apply-lesson-frame.cjs')(source,id);
 if(/^(am|sm)/.test(id)||id==='09-synchronni'){
  const viewportId=id==='09-synchronni'?'sm-stability':id;
  source=source.replace(/<main\b([^>]*)>/,(_,attrs)=>'<main'+attrs.replace(/\sdata-machine-viewport="[^"]*"/g,'')+' data-machine-viewport="'+viewportId+'">');
  source=source.replace(/<style id="machine-window-layout">[\s\S]*?<\/style>/g,'');
  source=source.replace('</body>',()=>'<style id="machine-window-layout">'+fs.readFileSync(path.join(root,'machine-window-layout.css'),'utf8')+'</style></body>');
 }

 if(/^(mag|em|hf-)/.test(id)){
  source=source.replace(/<main\b([^>]*)>/,(_,attrs)=>'<main'+attrs.replace(/\sdata-foundation-module="[^"]*"/g,'')+' data-foundation-module="'+id+'">');
  source=source.replace(/<style id="foundation-window-layout">[\s\S]*?<\/style>/g,'');
  source=source.replace('</body>',()=>'<style id="foundation-window-layout">'+fs.readFileSync(path.join(root,'foundation-window-layout.css'),'utf8')+'</style></body>');
 }
 // Keep the CSS cascade order, but make all static rules available before body parsing.
 // Match whole scripts too: embedded style strings are JavaScript, not HTML elements.
 const styles=[];
 source=source.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi,block=>{
  if(!/^<style\b/i.test(block))return block;
  styles.push(block);return '';
 });
 source=source.replace('</head>',()=>styles.join('\n')+'</head>');
 return source;
}
function update(file,{eddy=false}={}){
 let html=fs.readFileSync(file,'utf8'),count=0;
 html=html.replace(/const entries=(\[.*?\]);\nfor\(const entry of entries\)/s,(all,json)=>{
  const entries=JSON.parse(json);
  for(const e of entries){
   if(eddy&&e.id==='mag04-virive-proudy'){
    // Keep this delivery's integration styles; replace only the lesson drawing
    // and its matching script from the canonical source.
    const fresh=fs.readFileSync(path.join(root,'../H7_virive_proudy_3D_popisky_BE.html'),'utf8');
    const figure=/<svg class="visual" id="circuit"[\s\S]*?<\/svg>/;
    e.source=e.source.replace(figure,()=>fresh.match(figure)[0]);
    if(!e.source.includes("$('eddyTechnicalField').setAttribute"))e.source=e.source.replace('const fluxOpacity=clamp(.15+.85*Math.abs(B)/Bhat,.15,1);',"const fluxOpacity=clamp(.15+.85*Math.abs(B)/Bhat,.15,1);\n $('eddyTechnicalField').setAttribute('opacity',(.12+.65*Math.abs(B)/Bhat).toFixed(3));");
   }
   e.source=lesson(e.source,e.id);count++;
  }
  return 'const entries='+JSON.stringify(entries).replace(/</g,'\\u003c')+';\nfor(const entry of entries)';
 });
 if(!count)throw Error('Module catalog missing: '+file);
 for(const [marker,id] of [['sync-dq','sm07-dq'],['sync-rotor-dq','sm08-rotor-dq']]){
  html=html.replace(new RegExp('<!-- '+marker+':start -->[\\s\\S]*?<!-- '+marker+':end -->'),block=>block
   .replace(/const source=("(?:\\.|[^"\\])*");/,(_,json)=>'const source='+JSON.stringify(lesson(JSON.parse(json),id)).replace(/</g,'\\u003c')+';')
   .replace("if(innerWidth<=850){const head=app.querySelector('.modulehead');head?.style.removeProperty('margin-left');head?.style.removeProperty('width');}",''));
 }
 html=html.replace(/<style id="uniform-module-shell">[\s\S]*?<\/style>/g,'');
 html=html.replace('</head>',()=>'<style id="uniform-module-shell">'+css+'</style></head>');
 html=html.replace(/<style id="transformer-native-frame">[\s\S]*?<\/style>/g,'');
 html=html.replace('</head>',()=>'<style id="transformer-native-frame">'+fs.readFileSync(path.join(root,'transformator/native-frame.css'),'utf8')+'</style></head>');
 html=html.replace(/<script\b[^>]*>\/\* Shared offline mathematical typesetting[\s\S]*?<\/script>/,()=>'<script>'+fs.readFileSync(path.join(root,'powerlab-math.js'),'utf8')+'</script>');
 const marker='// The iframe is an output of fitting, never the viewport input for its content.';
 const at=html.indexOf(marker);
 if(at<0)throw Error('Module fitting script missing');
 const start=html.lastIndexOf('<script',at),open=html.indexOf('>',start),end=html.indexOf('</script>',at);
 html=html.slice(0,open+1)+fs.readFileSync(path.join(root,'module-window-fit.js'),'utf8')+html.slice(end);
 // Defer actual rendering, not individual call sites, until registration is complete.
 const defer="if(document.readyState==='loading'){if(!Lab.initialRoutePending){Lab.initialRoutePending=true;document.addEventListener('DOMContentLoaded',()=>{Lab.initialRoutePending=false;Lab.route();},{once:true});}return;}";
 html=html.replace('Lab.route=function(){if(Lab.dispose)',()=> 'Lab.route=function(){'+defer+'if(Lab.dispose)');
 html=html.replace('Lab.route=function(){const id=location.hash.slice(1);if(!id||id.startsWith',()=> 'Lab.route=function(){'+defer+'const id=location.hash.slice(1);if(!id||id.startsWith');
 html=html.replace('m.mount(app);requestAnimationFrame(Lab.fitNative);','m.mount(app);window.fitWindingModule?.();requestAnimationFrame(Lab.fitNative);');
 // Refit after the synchronous math mutation queue, still before the next paint.
 html=html.replace('window.fitWindingModule?.();requestAnimationFrame(Lab.fitNative);',"window.fitWindingModule?.();{const mounted=app.firstElementChild;requestAnimationFrame(()=>{if(app.firstElementChild!==mounted)return;Lab.fitNative();window.fitWindingModule?.();});}");
 html=html.replace(/<style id="winding-window-layout">[\s\S]*?<\/style>/g,'');
 html=html.replace('</head>',()=>'<style id="winding-window-layout">'+fs.readFileSync(path.join(root,'winding-window-layout.css'),'utf8')+'</style></head>');
 // Every native chart and its KaTeX overlay use the same logical pixels.
 html=html.replace("const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;", "const r=canvas.getBoundingClientRect(),logical=!!canvas.closest('[data-winding-viewport]'),d=Math.min(devicePixelRatio||1,2),w=logical?canvas.clientWidth:r.width,h=logical?canvas.clientHeight:r.height;");
 html=html.replace("const r=canvas.getBoundingClientRect(),ratio=", "const r=canvas.closest('[data-winding-viewport]')?{width:canvas.clientWidth,height:canvas.clientHeight}:canvas.getBoundingClientRect(),ratio=");
 html=require('./synchronous/stability-host.cjs')(html);
 html=html.replaceAll("canvas.closest('[data-winding-viewport]')","canvas.closest('[data-winding-viewport],[data-native-viewport]')");
 fs.writeFileSync(file,html);
 console.log(path.basename(path.dirname(file))+': unified '+count+' imported lessons and native workspaces');
}
module.exports={update,lesson};
if(require.main===module)for(const file of process.argv.slice(2))update(path.resolve(file),{eddy:true});
