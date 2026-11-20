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
env.Lab=Lab;env.katex={renderToString:s=>s};
function load(id){const a=html.indexOf("Lab.register({id:'"+id+"'"),b=html.indexOf('</script>',a);vm.runInContext(html.slice(a,b),env);registered.mount({});return cfg;}
function context(state){const nodes={};return {state,$:id=>nodes[id]??={classList:{toggle(){}},setAttribute(){}},canvases:Array.from({length:4},()=>({clientWidth:700,clientHeight:400})),chart:(i,...a)=>chart(i,...a),equal:(i,...a)=>chart(i,...a)};}
function signature(c,state){trace=[];c.draw(context(state));return crypto.createHash('sha256').update(JSON.stringify(trace)).digest('hex');}
const cases={
 '02-rozloha':[{q:2},{n:5}],
 '03-pohyb':[{q:2,y:5},{p:2},{y:8},{orders:[1,5]},{normal:false},{t:75}],
 '04-cinitel':[{q:2},{t:.8},{mode:1}],
 '05-drazkove':[{q:2},{choice:1},{extraOn:true},{t:75}],
 '06-casoprostor':[{stage:2},{on:true},{mode:1},{mode:2}]
};
for(const [id,changes]of Object.entries(cases)){
 const c=load(id),base={...c.defaults,t:c.defaults.t||31};const before=signature(c,base);
 for(const change of changes)assert.notEqual(signature(c,{...base,...change}),before,id+' effect '+JSON.stringify(change));
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
