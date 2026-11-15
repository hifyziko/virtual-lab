// Presentation of the vehicle model. All physical values come from WMath.vehicle.
Lab.vehicleContributions=(canvas,values,colors,unit)=>{
 const r=canvas.getBoundingClientRect(),dpi=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;if(!w||!h)return;
 canvas.width=Math.round(w*dpi);canvas.height=Math.round(h*dpi);const c=canvas.getContext('2d');c.setTransform(dpi,0,0,dpi,0,0);c.clearRect(0,0,w,h);
 const narrow=w<420,left=narrow?76:102,right=narrow?88:115,top=22,row=Math.min(64,(h-42)/4),pw=Math.max(30,w-left-right),lo=Math.min(0,...values),hi=Math.max(1,...values),extent=hi-lo,X=v=>left+(v-lo)/extent*pw,zero=X(0),names=['Valení','Vzduch','Svah','Celkem'];
 const text=(t,x,y,size,color,align='left')=>{c.font=(size>=16?'650 ':'500 ')+size+'px system-ui';c.fillStyle=color;c.textAlign=align;c.fillText(t,x,y)};
 text(unit,w-18,14,12,'#536c76','right');
 values.forEach((value,i)=>{const y=top+i*row,barH=Math.min(20,row*.36);if(i===3){c.fillStyle='#f0f6f4';c.beginPath();c.roundRect(10,y-5,w-20,row-2,8);c.fill()}
  text(names[i],20,y+row*.48,13,colors[i]);c.fillStyle='#e9efed';c.beginPath();c.roundRect(left,y+row*.2,pw,barH,barH/2);c.fill();const x=X(value),bw=Math.abs(x-zero);if(bw>.5){c.fillStyle=colors[i];c.beginPath();c.roundRect(Math.min(x,zero),y+row*.2,bw,barH,Math.min(5,bw/2));c.fill()}
  text(value.toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1}),w-18,y+row*.48,narrow?15:19,colors[i],'right');
 });
 if(lo<0){c.strokeStyle='#8ba39d';c.lineWidth=1;c.setLineDash([3,4]);c.beginPath();c.moveTo(zero,top);c.lineTo(zero,top+row*4-4);c.stroke();c.setLineDash([])}
 text(narrow?'Záporné = ve směru jízdy.':'Záporné hodnoty působí ve směru jízdy.',20,h-8,11,'#637980');
};
Lab.vehicleCurves=(p,speeds,data,total,speed,current,colors)=>{
 const c=p.c,lower=p.h-p.pad.b,upper=p.pad.t;
 // A light area highlights the complete mechanical balance, also below zero.
 c.save();c.beginPath();c.rect(p.pad.l,upper,p.w-p.pad.l-p.pad.r,lower-upper);c.clip();c.beginPath();c.moveTo(p.X(speeds[0]),p.Y(0));speeds.forEach((x,i)=>c.lineTo(p.X(x),p.Y(total[i])));c.lineTo(p.X(speeds.at(-1)),p.Y(0));c.closePath();c.fillStyle='rgba(0,126,108,.055)';c.fill();
 c.strokeStyle='#91aaa5';c.setLineDash([4,5]);c.lineWidth=1;c.beginPath();c.moveTo(p.X(speed),upper);c.lineTo(p.X(speed),lower);c.stroke();c.restore();
 data.forEach((v,k)=>p.line(speeds,v,colors[k],2.1,k===0?[7,4]:k===2?[3,5]:[]));p.line(speeds,total,'#142b35',3);current.forEach((v,k)=>p.dot(speed,v,colors[k],3));const sum=current.reduce((a,b)=>a+b,0);p.dot(speed,sum,'#142b35',5);
 const label=speed.toLocaleString('cs-CZ')+' km/h',x=Math.max(p.pad.l+42,Math.min(p.w-p.pad.r-42,p.X(speed)));c.save();c.font='600 12px system-ui';const width=c.measureText(label).width+18;c.fillStyle='#fff';c.strokeStyle='#d1dfda';c.beginPath();c.roundRect(x-width/2,upper+7,width,23,5);c.fill();c.stroke();c.fillStyle='#294c58';c.textAlign='center';c.fillText(label,x,upper+23);c.restore();
};
