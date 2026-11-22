// Exercise actual module renderers, recording drawing commands (no browser).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const html=fs.readFileSync('versions/vyvoj/m_files/Web/interaktivni-elektricke-stroje.html','utf8');
const at=html.indexOf('root.WMath=api'),start=html.lastIndexOf('<script',at),body=html.indexOf('>',start)+1,end=html.indexOf('</script>',at);
const env={};vm.createContext(env);vm.runInContext(html.slice(body,end),env);
let cfg,registered,trace=[];
const record=(name,...args)=>trace.push([name,...args]);
const canvasContext=new Proxy({}, {get:(_,key)=>(...args)=>record('canvas.'+String(key),...args),set:(_,key,value)=>{record('canvas.'+String(key),value);return true;}});
const plot={c:canvasContext,X:x=>x,Y:y=>y,line:(...a)=>record('line',...a),dot:(...a)=>record('dot',...a)};
const chart=(...a)=>{record('chart',...a.slice(1));return plot;};
const Lab={register:m=>registered=m,mount:(_,c)=>cfg=c,legend:()=>'',control:(_,id,content)=>'<label>'+id+content+'</label>',select:(id)=>'<select id="'+id+'"></select>',number:id=>'<input id="'+id+'">',range:id=>'<input id="'+id+'">',check:id=>'<input id="'+id+'">',palette:['red','blue','green','orange','black','grey','pink','purple'],linspace:(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1)),chart};
for(const method of ['text','fill','arrow','bar','slots'])Lab[method]=(_,...args)=>record(method,...args);
env.Lab=Lab;env.katex=require('../versions/vyvoj/m_files/fusion/particles/vendor/katex.js');
env.window=env;
env.Path2D=class {constructor(path){this.path=path}};
const machineArt=fs.readFileSync('versions/vyvoj/m_files/Web/synchronous/machine-art.js','utf8');
vm.runInContext(machineArt.slice(machineArt.indexOf('// Shared induction cross-section'),machineArt.indexOf('// DC machine extension')),env);
Object.assign(plot,{w:700,h:400});
function load(id){const a=html.indexOf("Lab.register({id:'"+id+"'"),b=html.indexOf('</script>',a);vm.runInContext(html.slice(a,b),env);registered.mount({});return cfg;}
function context(state){const nodes={};return {state,$:id=>nodes[id]??={classList:{toggle(){}},setAttribute(){}},canvases:Array.from({length:4},()=>({clientWidth:700,clientHeight:400})),chart:(i,...a)=>chart(i,...a),equal:(i,...a)=>chart(i,...a)};}
function signature(c,state){trace=[];c.draw(context(state));return crypto.createHash('sha256').update(JSON.stringify(trace)).digest('hex');}
const cases={
 '02-rozloha':[{q:2},{n:5}],
 '03-pohyb':[{q:2,y:5},{p:2},{y:8},{orders:[1,5]},{normal:false},{t:75},{mode:1}],
 '04-cinitel':[{q:2},{t:.8},{mode:1}],
 '05-drazkove':[{q:2},{choice:1},{extraOn:true},{t:75}],
 '06-casoprostor':[{stage:2},{on:true},{mode:1},{mode:2}]
};
for(const [id,changes]of Object.entries(cases)){
 const c=load(id),base={...c.defaults,t:c.defaults.t||31};const before=signature(c,base);
 for(const change of changes)assert.notEqual(signature(c,{...base,...change}),before,id+' effect '+JSON.stringify(change));
 if(id==='03-pohyb'){
  assert.equal(c.panels[0].title,'Příčný řez strojem');
  assert.equal(c.layout,'harmonic-motion');
  const css=fs.readFileSync('versions/vyvoj/m_files/Web/winding-window-layout.css','utf8');
  assert.match(css,/\.gridplots\.harmonic-motion\{[^}]*grid-template-rows:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(c.help,/class="katex"/);
  for(const [q,p,y] of [[1,1,1],[4,1,10],[8,4,24]]){
   const ctx=context({...base,q,p,y});
   trace=[];c.draw(ctx);
   const copper=trace.filter(row=>row[0]==='canvas.fillRect'&&(row[1]===183||row[1]===192));
   assert.equal(copper.length,2*2*6*p*q); // Two layers in both views.
   assert.equal(ctx.$('motion-coil-pair').textContent,'Cívka mezi drážkami 1 a '+(y+1));
   const pitch=2*Math.PI/(6*p*q);
   assert(trace.some(row=>row[0]==='canvas.arc'&&row[6]===true&&Math.abs(row[4]-row[5]-y*pitch)<1e-10));
  }
  for(const [mode,expected] of [[0,-600],[1,-15000]]){
   trace=[];c.draw(context({...base,p:1,orders:[5],mode}));
   assert.equal(trace.find(row=>row[0]==='bar')[1][0],expected);
   const component=trace.find(row=>row[0]==='line')[2];
   assert.equal(component.filter((v,i)=>i&&v>0&&component[i-1]<=0).length,mode?1:5);
  }
  for(const [order,direction] of [[5,-1],[7,1]]){
   for(const mode of [0,1])for(const p of [1,2]){
    for(const t of [0,18,36]){
     trace=[];c.draw(context({...base,p,t,orders:[order],mode}));
     const pairs=(mode?1:order)*p,mu=mode?order:1;
     const amplitude=env.WMath.kw(base.q,base.y/(3*base.q),mode?1:order)/order;
     const angle=(direction*mu*t*Math.PI/180+(amplitude<0?Math.PI:0))/pairs;
     const crest=trace.find(row=>row[0]==='dot')[1]*Math.PI/180;
     assert(Math.abs(Math.cos(crest-angle)-1)<1e-10);
     const marks=trace.flatMap((row,i)=>row[0]==='canvas.fillStyle'&&row[1]===Lab.palette[0]?[trace[i-4]]:[]);
     assert.equal(marks.length,2); // One tracked crest per order in both views.
     const r=Math.min(plot.h*.42,plot.w*.241),radius=r*160/211;
     const tip=Math.min(8,Math.max(4,r*.04));
     assert.equal(marks[0][0],'canvas.moveTo');
     assert(Math.abs(marks[0][1]-plot.w*.257-radius*Math.cos(angle)+direction*tip*Math.sin(angle))<1e-8);
     assert(Math.abs(marks[0][2]-plot.h*.50+radius*Math.sin(angle)+direction*tip*Math.cos(angle))<1e-8);
     const probeDot=trace.filter(row=>row[0]==='dot').at(-1);
     assert(Math.abs(probeDot[2]-amplitude*Math.cos(mu*t*Math.PI/180))<1e-10);
    }
   }
  }
  const wrap=context({...base,mode:0,t:359,orders:[5]});
  c.advance(wrap,.08,25);trace=[];c.draw(wrap);
  const wrappedAngle=trace.find(row=>row[0]==='dot')[1]*Math.PI/180;
  const shift=env.WMath.kw(base.q,base.y/(3*base.q),5)<0?Math.PI:0;
  assert(Math.abs(Math.cos(wrappedAngle-(-361*Math.PI/180+shift)/5)-1)<1e-10);
  const ctx=context({...base,t:73,orders:[1,3,7]});
  c.change(ctx,'mode',{value:'1'});trace=[];c.draw(ctx);
  assert.equal(ctx.state.t,73);
  assert.deepEqual(Array.from(trace.find(row=>row[0]==='bar')[1]),[3000,0,21000]);
 }
 if(['02-rozloha','04-cinitel'].includes(id)){
  assert(!c.controls(c.defaults).includes('id="p"'));assert(!('p' in c.defaults));
  assert.equal(signature(c,{...base,p:1}),signature(c,{...base,p:8}),'removed poles do not affect the calculation');
 }
 if(id==='05-drazkove'){
  const ctx=context({...c.defaults});c.init(ctx);assert.equal(ctx.$('extra').disabled,true);
  c.change(ctx,'extraOn',{checked:true});assert.equal(ctx.$('extra').disabled,false);
  assert.notEqual(signature(c,{...base,extraOn:true,extra:5}),signature(c,{...base,extraOn:true,extra:7}));
  c.reset(ctx);assert.equal(ctx.$('extra').disabled,true);
 }
 if(id==='06-casoprostor')for(const change of [{mu:7},{mix:.4}])assert.notEqual(signature(c,{...base,on:true,...change}),signature(c,{...base,on:true}));
 console.log('PASS renderer control effects:',id);
}
console.log('PASS: no pole selectors in factor-only modules; optional harmonic disabled until enabled; remaining tested controls change visible drawing commands. Browser rendering not exercised.');
