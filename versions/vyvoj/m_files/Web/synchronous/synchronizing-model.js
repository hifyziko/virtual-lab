(function(root){'use strict';
const W=2*Math.PI*50, X=.25, R=.025, H=2, D=2, wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function create(o={}){return Object.assign({t:0,theta:0,delta:-Math.PI/6,df:.1,voltage:400,grid:400,sequence:1,closed:false,closedAt:null,i:[0,0,0],pm:0,peak:0,type:"smooth",damper:true,damping:20},o);}
function values(s){const u=[],e=[];for(let k=0;k<3;k++){u.push(Math.SQRT2*s.grid/400*Math.cos(s.theta-k*2*Math.PI/3));e.push(Math.SQRT2*s.voltage/400*Math.cos(s.theta+s.delta-s.sequence*k*2*Math.PI/3));}const pe=e.reduce((a,v,k)=>a+v*s.i[k]/3,0),p=-u.reduce((a,v,k)=>a+v*s.i[k]/3,0);return {u,e,pe,p,angle:wrap(s.delta)*180/Math.PI,frequency:50+s.df,current:Math.hypot(...s.i)/Math.sqrt(3)};}
function conditions(s){return [Math.abs(s.voltage/s.grid-1)<=.05,Math.abs(s.df)<=.1+1e-9,s.sequence===1,Math.abs(wrap(s.delta))<=5*Math.PI/180];}
function close(s,force=false){if(s.closed||(!force&&!conditions(s).every(Boolean)))return false;s.closed=true;s.closedAt=s.t;s.atClose={angle:values(s).angle,df:s.df,voltage:s.voltage,sequence:s.sequence};return true;}
function derivative(s){const v=values(s);return {theta:W,delta:2*Math.PI*s.df,df:s.closed?50*(s.pm-v.pe-(D+(s.damper?s.damping:0))*s.df/50)/(2*H):0,i:s.i.map((i,k)=>s.closed?W/X*(v.e[k]-v.u[k]-R*i):0)};}
function shifted(s,d,h){return {...s,theta:s.theta+h*d.theta,delta:s.delta+h*d.delta,df:s.df+h*d.df,i:s.i.map((v,k)=>v+h*d.i[k])};}
function step(s,dt){const n=Math.ceil(dt/.0001),h=dt/n;for(let j=0;j<n;j++){const a=derivative(s),b=derivative(shifted(s,a,h/2)),c=derivative(shifted(s,b,h/2)),d=derivative(shifted(s,c,h));for(const key of ['theta','delta','df'])s[key]+=h*(a[key]+2*b[key]+2*c[key]+d[key])/6;for(let k=0;k<3;k++)s.i[k]+=h*(a.i[k]+2*b.i[k]+2*c.i[k]+d.i[k])/6;s.t+=h;s.theta%=2*Math.PI;s.peak=Math.max(s.peak,...s.i.map(Math.abs));}return s;}
// A complete record fixes graph limits and lets students scrub back through the same event.
// Trailing one-period RMS / torque averages include the zero-current prehistory.
function simulate(initial,duration=4){const sequenceFault=initial.sequence!==1;duration=sequenceFault?Math.min(duration,.12):duration;const s=create({...initial,i:[...initial.i],closed:false,closedAt:null});close(s,true);const samples=[],window=40,dt=.0005,squares=Array(window).fill(0),moments=Array(window).fill(0);let sumI=0,sumM=0,index=0,lost=false,endReason=sequenceFault?'sequence-window':'duration';
function record(t){const v=values(s),square=s.i.reduce((a,i)=>a+i*i,0)/3,moment=-(v.pe+(s.damper?s.damping:0)*s.df/50)/(1+s.df/50);sumI+=square-squares[index];sumM+=moment-moments[index];squares[index]=square;moments[index]=moment;index=(index+1)%window;samples.push({t,delta:s.delta,df:s.df,i:[...s.i],current:Math.sqrt(Math.max(0,sumI/window)),moment:sumM/window,peak:s.peak});}
record(0);for(let n=1;n<=Math.round(duration/dt);n++){step(s,dt);record(n*dt);if(Math.abs(s.delta-initial.delta)>=2*Math.PI||Math.abs(s.df)>20){lost=true;endReason=Math.abs(s.df)>20?'speed-limit':'pole-slip';break;}}
return {samples,end:samples.at(-1).t,lost,endReason,checks:conditions(initial),initial:{...initial,i:[...initial.i]}};}
function at(run,t){const index=Math.max(0,Math.min(run.samples.length-1,Math.round(t/.0005)));return run.samples[index];}
const api={create,values,conditions,close,step,simulate,at,wrap,constants:{W,X,R,H,D}};if(typeof module==='object')module.exports=api;else root.Synchronizing=api;
})(globalThis);
