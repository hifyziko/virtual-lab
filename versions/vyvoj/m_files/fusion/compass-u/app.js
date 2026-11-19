(()=>{'use strict';
 const $=id=>document.getElementById(id),data=window.CompassUData,video=$('video'),seek=$('seek'),cover=$('cover'),progress=$('loadProgress');
 const clips=[...document.querySelectorAll('[data-clip]')],times={assembly:0,interior:0};let active='assembly',loadTimer,disposed=false,scrubbing=false,resume=false;
 const math=(node,text)=>window.katex.render(text,node,{throwOnError:false,strict:'ignore'});
 const rows=(node,values)=>{node.replaceChildren();for(const [label,value]of values){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;math(dd,value);row.append(dt,dd);node.append(row);}};
 rows($('parameters'),data.parameters);document.querySelectorAll('[data-math]').forEach(node=>math(node,node.dataset.math));
 function phase(name){const value=data.heating[name];rows($('heating'),value.rows);$('heatingNote').textContent=value.note;for(const b of document.querySelectorAll('[data-phase]'))b.setAttribute('aria-pressed',String(b.dataset.phase===name));}
 // Unit-bearing text also uses the shared mathematical typesetter.
 function heatingNote(name){phase(name);if(name==='initial'){$('heatingNote').replaceChildren(document.createTextNode('Navíc dva diagnostické svazky, každý '));const span=document.createElement('span');math(span,'0{,}5\\,\\mathrm{MW}');$('heatingNote').append(span,document.createTextNode('.'));}}
 heatingNote('initial');for(const b of document.querySelectorAll('[data-phase]'))b.onclick=()=>heatingNote(b.dataset.phase);
 const time=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'—';
 function update(){const duration=video.duration||0;if(!scrubbing)seek.value=duration?Math.round(1000*video.currentTime/duration):0;$('clock').textContent=time(video.currentTime)+' / '+time(video.duration);$('play').textContent=video.paused?'Přehrát':'Pozastavit';$('play').setAttribute('aria-label',video.paused?'Přehrát animaci':'Pozastavit animaci');}
 function hideLoad(){clearTimeout(loadTimer);cover.hidden=true;}
 function showLoad(immediate=false){clearTimeout(loadTimer);const show=()=>{if(disposed)return;cover.hidden=false;$('loadText').textContent='Načítání videa…';$('retry').hidden=true;progress.hidden=false;progress.removeAttribute('value');};if(immediate)show();else loadTimer=setTimeout(show,400);}
 function fail(){clearTimeout(loadTimer);cover.hidden=false;$('loadText').textContent='Video se nepodařilo načíst.';progress.hidden=true;$('retry').hidden=false;}
 function chapters(){const node=$('chapters');node.replaceChildren();for(const [label,seconds]of data.clips[active].chapters){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(Number.isFinite(video.duration))video.currentTime=Math.min(seconds,video.duration);};node.append(b);}}
 function select(name){times[active]=video.currentTime||0;video.pause();active=name;for(const b of clips)b.setAttribute('aria-pressed',String(b.dataset.clip===name));$('clipTitle').textContent=data.clips[name].title;video.setAttribute('aria-label',data.clips[name].title);seek.disabled=true;showLoad(true);const clip=clips.find(b=>b.dataset.clip===name);video.poster=clip.dataset.videoPoster;$('play').disabled=false;video.src=clip.dataset.videoSrc;video.load();chapters();update();}
 clips.forEach(b=>b.onclick=()=>{if(b.dataset.clip!==active)select(b.dataset.clip);});
 video.addEventListener('loadedmetadata',()=>{seek.disabled=false;video.currentTime=Math.min(times[active],video.duration||0);update();});
 for(const event of ['loadeddata','canplay','playing','seeked'])video.addEventListener(event,hideLoad);
 for(const event of ['waiting','stalled','seeking'])video.addEventListener(event,()=>{if(!video.paused||video.seeking)showLoad();});
 for(const event of ['timeupdate','durationchange','play','pause','ended'])video.addEventListener(event,update);
 video.addEventListener('error',()=>{if(!disposed)fail();});
 $('retry').onclick=()=>{times[active]=video.currentTime||0;showLoad(true);video.load();};
 $('play').onclick=async()=>{if(video.paused){try{await video.play();}catch(error){if(video.error)fail();}}else video.pause();};
 seek.addEventListener('pointerdown',()=>{scrubbing=true;resume=!video.paused;video.pause();});
 seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/1000*video.duration;update();});
 const endScrub=()=>{if(!scrubbing)return;scrubbing=false;if(resume)video.play().catch(()=>{});resume=false;};
 window.addEventListener('pointerup',endScrub);window.addEventListener('pointercancel',endScrub);seek.addEventListener('change',endScrub);
 $('speed').onchange=()=>{video.playbackRate=Number($('speed').value);};
 const dialog=$('compass-help');$('help').onclick=()=>dialog.showModal();$('closeHelp').onclick=()=>dialog.close();
 window.HiFyzikoFusionDispose=()=>{disposed=true;clearTimeout(loadTimer);video.pause();video.removeAttribute('src');video.load();window.removeEventListener('pointerup',endScrub);window.removeEventListener('pointercancel',endScrub);};
 select('assembly');
})();
