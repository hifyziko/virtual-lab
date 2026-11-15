const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../versions/vyvoj/m_files/fusion/barrier/model.js');
const dd=M.pair('deuteron','deuteron'),dt=M.pair('deuteron','triton'),dh=M.pair('deuteron','helium3');
for(const r of [5,10,24,35]){
 assert.equal(M.potential(dd,r),M.potential(dt,r));
 assert.equal(M.potential(dh,r),2*M.potential(dt,r));
 const eps=1e-4,derivative=(M.potential(dt,r+eps)-M.potential(dt,r-eps))/(2*eps);
 assert.ok(Math.abs(derivative+M.force(dt,r,0)[0])<1e-6);
}
assert.deepEqual(M.force(M.pair('triton','neutron'),10,3),[0,0]);
// Same Verlet scheme as the free-flight interaction: energy conservation and turning point.
let x=24,v=-Math.sqrt(2*(100-M.potential(dt,24))/dt.mu),min=x;
for(let i=0;i<20000;i++){const h=.002;v+=M.force(dt,x,0)[0]/dt.mu*h/2;x+=v*h;v+=M.force(dt,x,0)[0]/dt.mu*h/2;min=Math.min(min,x);const energy=dt.mu*v*v/2+M.potential(dt,x);assert.ok(Math.abs(energy-100)<.01);if(x>35)break;}
assert.ok(Math.abs(min-dt.C/100)<.001);
for(const base of ['versions/aktualni/web','versions/vyvoj/versions/aktualni/web']){
 const file=path.resolve(__dirname,'..',base,'fuze-bariera/index.html'),html=fs.readFileSync(file,'utf8');
 for(const [,ref]of html.matchAll(/(?:src|href)="([^"#]+)"/g))assert.ok(fs.existsSync(path.resolve(path.dirname(file),ref)),ref);
 const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',base,'../manifest.json')));
 for(const name of ['index.html','style.css','app.js','model.js','fusion.js'])assert.ok(manifest.files.some(f=>f.path==='fuze-bariera/'+name),'Missing runtime file in delivery manifest: '+name);
}
console.log('Coulomb: gradient, isotope/charge comparisons, neutron, energy, turning point and delivery links passed.');
