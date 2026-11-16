const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/barrier/app.js'),'utf8'),start=source.indexOf('function fieldWorkerMain(){'),end=source.indexOf('let fieldWorker=null',start);let result;const context={self:{postMessage:d=>result=d},Uint8ClampedArray};vm.createContext(context);vm.runInContext(source.slice(start,end)+'fieldWorkerMain();',context);
for(const style of ['source','spread']){const input={W:600,H:400,ox:300,oy:200,scale:.02,sources:[[170,180,1],[410,230,2]],R:4,reference:12.926,arrows:true,style,viewKey:style,radius:12};context.self.onmessage({data:input});const first=result;assert.equal(first.pixels.length,first.width*first.height*4);assert.ok(first.lines.length>0);assert.ok(first.lines.every(l=>l.points.every(Number.isFinite)));assert.ok(first.heads.every(a=>a.every(Number.isFinite)));context.self.onmessage({data:{...input,sources:[...input.sources,[300,190,0]]}});assert.deepEqual(result.pixels,first.pixels);assert.equal(JSON.stringify(result.lines),JSON.stringify(first.lines));}
console.log('PASS: both worker field styles, finite raster/lines, neutrino adds no electric field.');
// Rendering contract: a normal 16 ms animation tick must not be discarded,
// and a wide viewport must not silently downscale below CSS resolution.
let draws=0,now=0;const canvas={width:0,height:0,getBoundingClientRect:()=>({width:1920,height:1080})},gl=new Proxy({TIMEOUT_EXPIRED:1,WAIT_FAILED:3,clientWaitSync:()=>2,getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,name)=>name,getAttribLocation:()=>0,drawArrays:()=>draws++,fenceSync:()=>({}),getAttachedShaders:()=>[],getExtension:()=>null},{get:(o,k)=>k in o?o[k]:String(k).startsWith('create')?()=>({}):()=>{}});canvas.getContext=()=>gl;
const render={devicePixelRatio:1,performance:{now:()=>now},addEventListener(){},console};render.window=render;vm.createContext(render);for(const file of ['style.js','nuclear-shader.js','nucleus-view.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/particles',file),'utf8'),render);
const renderer=new render.HiFyzikoNucleusView(canvas),items=[{id:'proton',x:500,y:250,radius:20}];renderer.draw(1920,1080,0,items);now=16;renderer.draw(1920,1080,.016,items);assert.equal(draws,2);assert.equal(canvas.width,1920);assert.equal(canvas.height,1080);renderer.dispose();console.log('PASS: full viewport resolution and successive 16 ms renders when GPU is ready.');
// Equal positive sources cancel their electric field at the midpoint. Potentials
// would add there, so this distinguishes an intensity map from the old map.
{
 const W=600,H=400,cx=95.5*W/192,cy=63.5*H/128,input={W,H,scale:1,sources:[[cx-60,cy,1],[cx+60,cy,1]],R:4,reference:12.926,arrows:false,style:'source',viewKey:'cancellation',radius:12};
 context.self.onmessage({data:input});const first=result,k=(63*192+95)*4;
 assert.deepEqual(Array.from(first.pixels.slice(k,k+3)),[42,91,184],'zero resultant field at symmetric midpoint');
 context.self.onmessage({data:{...input,sources:[[cx-60,cy,1]]}});assert.notDeepEqual(Array.from(result.pixels.slice(k,k+3)),[42,91,184],'one source has nonzero intensity');
 context.self.onmessage({data:{...input,W:W*2,H:H*2,radius:24,sources:input.sources.map(([x,y,z])=>[x*2,y*2,z])}});assert.deepEqual(result.pixels,first.pixels,'relative field map is invariant under zoom');
}
console.log('PASS: vector cancellation, nonzero single-source field, zoom-invariant relative scale.');
