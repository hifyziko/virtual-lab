// Salient iron path supplied at build time from synchronous/machine-art.js.
window.ArmatureArt=function(theta,current,field){
 const shape='__SALIENT_PATH__';
 let h='<path d="M60 387V57H500V387H440V252H460V97H100V252H120V387Z" fill="#e7eeec" stroke="#8caaa3" stroke-width="2"/>';
 h+=`<g id="ee-armature" transform="translate(280 312) rotate(${-theta*180/Math.PI})"><path d="${shape}" fill="#f3eee3" stroke="#b9781c" stroke-width="2"/><path d="M-125 0H125" stroke="#b79b71" stroke-dasharray="4 4"/></g>`;
 h+='<g transform="translate(280 312)">'+field+'</g>';
 // Two cross-sections of the SAME DC coil around the upper stator yoke.
 for(const [y,polarity]of [[42,-1],[112,1]]){h+=`<rect x="215" y="${y-9}" width="130" height="18" rx="4" fill="#ead0a4" stroke="#b9781c" stroke-width="1.5"/>`;for(let x=228;x<340;x+=18){h+=`<circle cx="${x}" cy="${y}" r="5.5" fill="#fffaf0" stroke="#b9781c"/>`;if(current*polarity>0)h+=`<circle cx="${x}" cy="${y}" r="2" fill="#8b5b19"/>`;else if(current*polarity<0)h+=`<path d="M${x-2.5} ${y-2.5}l5 5m-5 0 5-5" stroke="#8b5b19"/>`;}}
 h+='<circle cx="280" cy="312" r="11" fill="#647b78" stroke="#fff" stroke-width="2"/>';
 return h;
};
