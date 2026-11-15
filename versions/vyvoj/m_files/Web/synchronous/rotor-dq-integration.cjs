// Append an isolated module without rebuilding or replacing existing payloads.
const fs=require('fs'),path=require('path');
module.exports=function integrateDQ(file){
 const source=fs.readFileSync(path.join(__dirname,'rotor-dq.html'),'utf8').replace('</head>','<style>.hero,main>footer{display:none}main{padding-top:8px}</style></head>');
 let html=fs.readFileSync(file,'utf8').replace(/<!-- sync-rotor-dq:start -->[\s\S]*?<!-- sync-rotor-dq:end -->\s*/g,'');
 const script=`<!-- sync-rotor-dq:start -->
<script>(()=>{'use strict';
const entry={id:'sm08-rotor-dq',group:'sync',num:'03',title:'Parkova transformace statorových proudů',draft:false,description:'Pohled ze statoru a z rotoru. Táhněte proudem i osami; sledujte, proč se střídavé proudy v synchronně rotujících osách změní na konstantní složky.'};
const source=${JSON.stringify(source).replace(/</g,'\\u003c')};
Lab.register({id:entry.id,title:entry.title,mount(app){
app.innerHTML='<div class="workspace imported-workspace"><div class="modulehead"><a class="back" href="#group-sync">← Synchronní stroje</a><span class="num">'+entry.num+'</span><h1>'+entry.title+'</h1><div class="actions"><button id="rotor-dq-fullscreen">Celá obrazovka</button></div></div><iframe id="transformer-frame" class="transformer-frame" title="'+entry.title+'"></iframe></div>';
const frame=app.querySelector('iframe');let disposed=false,queued=0,observer,fontsReady=false;
const heading=app.querySelector('.modulehead');
// Prepare the logical viewport and centering before loading the child.
Object.assign(frame.style,{width:'1600px',position:'relative',left:'50%',marginLeft:'0px',marginRight:'0px',transformOrigin:'top center',transform:'translateX(-50%)',visibility:'hidden'});
Object.assign(heading.style,{width:'1600px',position:'relative',left:'50%',marginLeft:'0px',marginRight:'0px',transform:'translateX(-50%)',visibility:'hidden'});
frame.style.minHeight='0';
const measure=()=>{queued=0;if(disposed)return;const doc=frame.contentDocument,main=doc?.querySelector('main');if(!main)return;const footer=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--project-credit-space'))||0;window.prepareImportedViewport?.(frame,doc,innerHeight-footer);const h=Math.ceil(Math.max(main.getBoundingClientRect().bottom,main.getBoundingClientRect().top+main.scrollHeight)+(frame.contentWindow.scrollY||0));if(h>0){if(Math.abs((parseFloat(frame.style.height)||0)-h)>1)frame.style.height=h+'px';window.fitImportedModule?.(frame,main,h);if(fontsReady){frame.style.visibility='visible';heading.style.visibility='visible';}}};
const resize=()=>{if(!disposed&&!queued)queued=requestAnimationFrame(measure);};
frame.addEventListener('load',()=>{if(disposed)return;observer?.disconnect();const main=frame.contentDocument?.querySelector('main');if(main){observer=new ResizeObserver(resize);observer.observe(main);frame.contentDocument.fonts.ready.then(()=>{if(disposed)return;fontsReady=true;resize();});}resize();});
window.prepareModuleFrame?.(frame);frame.srcdoc=source;window.addEventListener('resize',resize);const mutation=new MutationObserver(resize);mutation.observe(document.body,{attributes:true,attributeFilter:['class']});app.querySelector('#rotor-dq-fullscreen').onclick=()=>{document.body.classList.toggle('fullscreen');resize();};
Lab.dispose=()=>{disposed=true;cancelAnimationFrame(queued);observer?.disconnect();mutation.disconnect();window.removeEventListener('resize',resize);frame.srcdoc='';document.body.classList.remove('fullscreen');};
}});
Lab.catalog=Lab.catalog.filter(m=>m.id!==entry.id);Lab.catalog.push(entry);
const known=["sm01-princip","sm07-dq","sm02-schema","sm06-torque-origin","sm03-torque","sm11-v-curves","sm05-isolated","sm04-transients","09-synchronni","sm08-rotor-dq","sm09-pmsm-phasor","sm10-pmsm-drive"];
const items=[...known.map(id=>Lab.catalog.find(m=>m.id===id)).filter(Boolean),...Lab.catalog.filter(m=>m.group==='sync'&&!known.includes(m.id))];items.forEach((m,i)=>m.num=String(i+1).padStart(2,'0'));let index=0;Lab.catalog=Lab.catalog.map(m=>m.group==='sync'?items[index++]:m);Lab.route();
})();</script>
<!-- sync-rotor-dq:end -->`;
 html=html.replace('</body>',()=>script+'\n</body>');
 fs.writeFileSync(file,html);return Buffer.byteLength(html);
};
