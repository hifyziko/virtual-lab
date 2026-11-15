/* Didactic range for electrically excited synchronous machines, at fixed frequency. */
(function(root){
function constrain(doc){const d=doc.getElementById('xd'),q=doc.getElementById('xq'),leak=doc.getElementById('xsigma');if(!d||!q)return;
const clamp=(el,min,max)=>{const value=+el.value;el.min=String(min);el.max=String(max);el.value=String(Math.round(Math.max(min,Math.min(max,value))*100)/100);};
clamp(d,.6,2);clamp(q,Math.max(.3,Math.ceil(+d.value*.5*100)/100),+d.value);
q.title='Elektrické buzení: 0,5 Xd ≤ Xq ≤ Xd. Rovnost je mez hladkého rotoru; téměř shodné hodnoty jsou povolené.';
if(leak)clamp(leak,0,Math.min(.3,Math.round((+q.value-.05)*100)/100));
}
if(typeof module==='object')module.exports=constrain;else root.SyncReactanceControls=()=>constrain(document);
})(typeof window==='object'?window:globalThis);
