/* Float32 storage only: no interpolation or change to the field solver. */
(function codecFactory(root){'use strict';
function pack(d){const a=[d.lines.length];for(const line of d.lines){a.push(line.length);for(const p of line)a.push(...p);}a.push(d.profile.length);for(const p of d.profile)a.push(p.x,p.B);const s=d.surface;a.push(s?1:0);if(s){a.push(s.N,s.K,s.min,s.max);for(const v of s.values)a.push(v);}return new Float32Array(a);}
function unpack(a){let i=0;const lines=[],n=a[i++];for(let j=0;j<n;j++){const line=[],count=a[i++];for(let k=0;k<count;k++)line.push([a[i++],a[i++],a[i++]]);lines.push(line);}const profile=[],count=a[i++];for(let j=0;j<count;j++)profile.push({x:a[i++],B:a[i++]});let surface=null;if(a[i++]){const N=a[i++],K=a[i++],min=a[i++],max=a[i++];surface={N,K,min,max,values:a.subarray(i,i+(N+1)*(K+1))};}return {lines,profile,surface};}
root.ConfinementAtlasCodec={pack,unpack};root.ConfinementAtlasCodec.workerSource='('+codecFactory.toString()+')(self);';if(typeof module!=='undefined')module.exports=root.ConfinementAtlasCodec;
})(typeof globalThis!=='undefined'?globalThis:this);
