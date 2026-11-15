const fs=require('fs'),path=require('path');
module.exports=function(html){
 const start=html.indexOf("Lab.register({id:'10-asynchronni'"),end=html.indexOf('</script>',start);if(start<0||end<0)throw Error('AM module missing');let s=html.slice(start,end);
 s=s.replace('C.motorBase(a);','window.InductionMachineArt.canvas(a,s.rotor);');
 s=s.replace('k<18;k++){let pos=k*T/18,band=Math.floor(k/3)', 'k<24;k++){let pos=k*T/24,band=Math.floor(k/4)');
 s=s.replace('x=.895*Math.cos(pos),y=.895*Math.sin(pos)','x=194/211*Math.cos(pos),y=194/211*Math.sin(pos)');
 s=s.replace('k<12;k++){let pos=k*T/12+s.rotor,x=.47*Math.cos(pos),y=.47*Math.sin(pos)', 'k<20;k++){let pos=k*T/20+s.rotor,x=129/211*Math.cos(pos),y=129/211*Math.sin(pos)');
 s=s.replace('C.motorSlot(a,x,y,pos,col);',"a.dot(x,y,col,5);");
 s=s.replace('a.dot(n,d.T,metrics[0][3],4);a.dot(n,M.load(n,s),\'#c34d28\',3);',"workingPoint(a,n,d.T,metrics[0][3]);workingPoint(a,n,M.load(n,s),'#c34d28',true);");
 s=s.replace('a.dot(n,rightToLeft(100*v/refs[i]),metrics[i][3],3)', 'workingPoint(a,n,rightToLeft(100*v/refs[i]),metrics[i][3])');
 if(!s.includes('function workingPoint('))s=s.replace('const defaults=',`function workingPoint(p,x,y,color,diamond=false){
 const c=p.c,px=p.X(x),py=p.Y(y),r=diamond?7:6;
 c.save();c.beginPath();c.rect(p.pad.l,p.pad.t,p.w-p.pad.l-p.pad.r,p.h-p.pad.t-p.pad.b);c.clip();
 c.beginPath();if(diamond){c.moveTo(px,py-r);c.lineTo(px+r,py);c.lineTo(px,py+r);c.lineTo(px-r,py);c.closePath();}else c.arc(px,py,r,0,2*Math.PI);
 c.fillStyle='#fff';c.fill();c.strokeStyle=color;c.lineWidth=2.5;c.stroke();
 c.beginPath();c.arc(px,py,2,0,2*Math.PI);c.fillStyle=color;c.fill();c.restore();
}
const defaults=`);
 if(!s.includes('/* operating-speed-guide */'))s=s.replace('if(a){const rightToLeft=',"if(a){/* operating-speed-guide */a.line([n,n],[bottom,top],'#617b83',1,[4,4]);const rightToLeft=");
 // Direct speed manipulation pauses the mechanical run; restart restores it.
 s=s.replace("+ctl('Režim','auto',C.select('auto',[[1,'Automatický rozběh'],[0,'Ruční otáčky']],1))",'');
 s=s.replace("C.number('Rscale',1,.01,100,.05)","C.number('Rscale',1,.01,4,.05)");
 s=s.replace("ctx.$('n').disabled=!!ctx.state.auto;","ctx.$('n').disabled=false;");
 s=s.replace("Object.assign(ctx.state,{omega:0,n:0,t:0,rotor:0,physicalTime:0})","Object.assign(ctx.state,{auto:true,omega:0,n:0,t:0,rotor:0,physicalTime:0})");
 s=s.replace('Přepněte na ruční otáčky a dojeďte k ns.','Uchopte posuvník otáček (tím přejdete do ručního režimu) a dojeďte k ns. Tlačítko Znovu z klidu obnoví automatický rozběh.');
 if(!s.includes('/* speed-direct-control */'))s=s.replace('init(ctx){',`init(ctx){/* speed-direct-control */ctx.$('n').addEventListener('pointerdown',()=>{ctx.state.auto=false;ctx.state.n=ctx.state.omega*60/T;ctx.dirty()});`);
 if(!s.includes('/* bounded-rotor-resistance */'))s=s.replace("if(id==='skinMode')s.kR=1;", "/* bounded-rotor-resistance */if(id==='Rscale')s.Rscale=Number.isFinite(s.Rscale)?Math.max(.01,Math.min(4,s.Rscale)):1;if(id==='skinMode')s.kR=1;");
 s=s.replace("timeLabel:'Natočení pole'","timeControl:false");
 // Dragging pauses in manual mode; an explicit Play resumes acceleration.
 if(!s.includes('play(ctx){'))s=s.replace('advance(ctx,dt,rate){','play(ctx){ctx.state.auto=true;syncControls(ctx);ctx.dirty()},\nadvance(ctx,dt,rate){');
 s=s.replaceAll('ctx.start()', 'ctx.stop()');
 // Both ordinate axes share zero; only expand limits so no curve is clipped.
 if(!s.includes('/* aligned-axis-zero */')){
  s=s.replace('],bottom=Math.min(-.5,...torqueValues)*1.15,top=','];let bottom=Math.min(-.5,...torqueValues)*1.15;const top=');
  s=s.replace('const rlow=Math.min(-10,...relative.map(v=>v-5)),rhigh=Math.max(110,...relative.map(v=>v+5));',`let rlow=Math.min(-10,...relative.map(v=>v-5));const rhigh=Math.max(110,...relative.map(v=>v+5));
/* aligned-axis-zero */
const negativeRatio=Math.max(-bottom/top,-rlow/rhigh);
bottom=-top*negativeRatio;rlow=-rhigh*negativeRatio;`);
  s=s.replace('for(let k=0;k<=4;k++){const v=rlow+k*(rhigh-rlow)/4,y=a.Y(rightToLeft(v));',`const rightTicks=[0,...Array.from({length:5},(_,k)=>rlow+k*(rhigh-rlow)/4).filter(v=>Math.abs(a.Y(rightToLeft(v))-a.Y(0))>16)].sort((a,b)=>a-b);for(const v of rightTicks){const y=a.Y(rightToLeft(v));`);
  s=s.replace('pravá osa používá procenta vlastní reference každé křivky.', 'pravá osa používá procenta vlastní reference každé křivky. Nuly obou svislých os leží ve stejné výšce.');
  if(!s.includes('/* aligned-axis-zero */'))throw Error('AM axis range block missing');
 }
 s=s.replace("if(id==='n'){s.omega=s.n*T/60;s.auto=false}","if(id==='n'){s.omega=s.n*T/60;s.auto=false;ctx.stop()}");
 s=s.replace("ctx.state.n=ctx.state.omega*60/T;ctx.dirty()", "ctx.state.n=ctx.state.omega*60/T;ctx.stop();ctx.dirty()");
 // Manual scrubbing advances both the operating point and the visual phase.
 // One synchronous-speed span corresponds to one electrical field revolution;
 // integrate rotor phase using mean mechanical speed over the dragged interval.
 s=s.replace("if(id==='n'){s.omega=s.n*T/60;s.auto=false;ctx.stop()}", "if(id==='n'){const previous=s.omega*60/T,ns=60*s.f/s.p,phase=(s.n-previous)/ns*T;s.t=((s.t+phase*180/Math.PI)%360+360)%360;s.rotor=((s.rotor+phase*(previous+s.n)/(2*ns*s.p))%T+T)%T;s.omega=s.n*T/60;s.auto=false;ctx.stop()}");
 html=html.slice(0,start)+s+html.slice(end);
 // Keep playback/tempo independent of the optional angle control.
 const mountStart=html.indexOf("Lab.mount=function"),mountEnd=html.indexOf("return ctx};",mountStart)+12;
 let mount=html.slice(mountStart,mountEnd);
 if(!mount.includes("cfg.timeControl===false")){
 mount=mount.replace("<div class=\"control time\"><label for=\"time\">","${cfg.timeControl===false?'':`<div class=\"control time\"><label for=\"time\">");
 mount=mount.replace("<output id=\"timeValue\"></output></div><div class=\"control\"><label for=\"tempo\">","<output id=\"timeValue\"></output></div>`}<div class=\"control\"><label for=\"tempo\">");
 mount=mount.replace("if(time){$('time').value=","if(time){if(cfg.timeControl!==false){$('time').value=");
 mount=mount.replace(";$('play').textContent=playing?",";}$('play').textContent=playing?");
 mount=mount.replace(";$('time').oninput=",";if(cfg.timeControl!==false)$('time').oninput=");
 }
 mount=mount.replace("playing=!playing;last=0;sync()", "playing=!playing;last=0;if(playing)cfg.play?.(ctx);sync()");
 mount=mount.replace('start(){if(!playing){playing=true;last=0;sync()}},','');
 html=html.slice(0,mountStart)+mount+html.slice(mountEnd);
 html=html.replace(/<!-- am-loupe-art:start -->[\s\S]*?<!-- am-loupe-art:end -->/g,'');
 const at=html.indexOf("Lab.register({id:'10-asynchronni'");const script=html.lastIndexOf('<script',at);
 return html.slice(0,script)+'<!-- am-loupe-art:start --><script>'+fs.readFileSync(path.join(__dirname,'../synchronous/machine-art.js'),'utf8')+'</script><!-- am-loupe-art:end -->'+html.slice(script);
};
