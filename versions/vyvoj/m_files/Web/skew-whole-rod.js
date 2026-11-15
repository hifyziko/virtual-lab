
window.SkewWholeRod={render({Q,p,a,nu,position}){
 const total=nu*2*Math.PI*p*a/Q,theta=position*2*Math.PI,N=24,top=145,height=380,xA=150,xC=xA+45*a;
 const cumulative=z=>z*LearningModels.sinc(total*z/2)*Math.cos(theta+total/2-total*z/2),result=cumulative(1),value=z=>LearningModels.sinc(total/(2*N))*Math.cos(theta-total*(z-.5));
 const tex=(x,y,w,text)=>'<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="42"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:17px;color:#23434a;text-align:center">'+katex.renderToString(text,{throwOnError:false})+'</div></foreignObject>';
 let h="<text x=\"340\" y=\"32\" text-anchor=\"middle\" font-weight=\"650\">Od místních napětí k napětí celé tyče</text><text x=\"130\" y=\"96\" text-anchor=\"middle\" style=\"font-size:16px\">Vodič a svorky</text><text x=\"335\" y=\"89\" text-anchor=\"middle\" style=\"font-size:15px\">Dílčí</text><text x=\"335\" y=\"107\" text-anchor=\"middle\" style=\"font-size:15px\">napětí</text><text x=\"515\" y=\"96\" text-anchor=\"middle\" style=\"font-size:16px\">Součet od A</text>";
 // Unwrapped stator behind the tracked bar; one harmonic period is Q/(nu*p) slot pitches.
 const pitch=45,shift=position*Q/(nu*p)*pitch,centre=xA;
 h+='<defs><clipPath id="sk-rod-stator-clip"><rect x="104" y="'+(top+8)+'" width="158" height="'+(height-16)+'"/></clipPath></defs><g clip-path="url(#sk-rod-stator-clip)" data-stator-position="'+position+'"><rect x="104" y="'+(top+8)+'" width="158" height="'+(height-16)+'" fill="#f0f4f5"/>';
 const offset=((centre+shift)%pitch+pitch)%pitch;
 for(let x=offset+Math.floor((104-offset)/pitch)*pitch;x<280;x+=pitch)h+='<rect x="'+(x-5)+'" y="'+top+'" width="10" height="'+height+'" fill="#c6d2d7"/><path d="M'+(x-5)+' '+top+'V'+(top+height)+'" stroke="#aabcc4" stroke-width=".7"/>';
 for(let y=top+24;y<top+height;y+=24)h+='<path d="M104 '+y+'H262" stroke="#d9e2e5" stroke-width=".6"/>';
 h+='</g><text x="183" y="574" text-anchor="middle" style="font-size:12px;fill:#71858b">Rozvinutý stator · schematicky</text>';
 h+='<path d="M'+xA+' '+top+'H68V307M68 355V'+(top+height)+'H'+xC+'" fill="none" stroke="#83999e" stroke-width="1.8"/><circle cx="68" cy="331" r="24" fill="#fff" stroke="#5b747c" stroke-width="1.8"/><text x="68" y="338" text-anchor="middle" font-size="22">V</text>';
 h+='<path d="M'+xA+' '+top+'L'+xC+' '+(top+height)+'" stroke="#dfd0b4" stroke-width="10" stroke-linecap="butt"/>';
 // Soft envelopes distinguish left- and right-pointing local contributions.
 for(const sign of [-1,1]){
  let area='M335 '+top;
  for(let j=0;j<=240;j++){const z=j/240,v=value(z);area+='L'+(335+48*(sign<0?Math.min(0,v):Math.max(0,v)))+' '+(top+height*z)}
  area+='L335 '+(top+height)+'Z';
  h+='<path data-contribution-tone="'+sign+'" d="'+area+'" fill="'+(sign<0?'#a24e9d':'#168e9a')+'" opacity=".12"/>';
 }
 for(const z of [0,.25,.5,.75,1]){const y=top+height*z;h+='<path d="M'+(xA+(xC-xA)*z+10)+' '+y+'H620" stroke="#e5ecec" stroke-width="1" stroke-dasharray="3 5"/><text x="630" y="'+(y+5)+'" style="font-size:13px;fill:#71858b">'+z.toLocaleString('cs-CZ')+'</text>'}h+=tex(610,100,60,'z/L');h+='<path d="M335 '+top+'V'+(top+height)+'" stroke="#d5e0e0" stroke-width="1"/>';for(let j=0;j<N;j++){const z=(j+.5)/N,x=xA+(xC-xA)*z,y=top+height*z,v=value(z),c=v>=0?'#168e9a':'#a24e9d',len=58*Math.abs(v),start=x+18,end=start+(v>=0?1:-1)*len;
 h+='<path data-local-contribution="'+v+'" d="M'+(xA+(xC-xA)*j/N)+' '+(top+height*j/N)+'L'+(xA+(xC-xA)*(j+1)/N)+' '+(top+height*(j+1)/N)+'" stroke="'+c+'" stroke-width="4"/>';
 // Arrows use a separate lane so negative contributions do not cover the bar.
 const origin=335,tip=origin+v*48;
 if(Math.abs(v)>.02){h+='<path d="M'+origin+' '+y+'H'+(tip-Math.sign(v)*5)+'" stroke="'+c+'" stroke-width="1.6"/><path d="M'+tip+' '+y+'l'+(-Math.sign(v)*6)+' -3v6Z" fill="'+c+'"/>';}
 }
 for(const [x,y,label] of [[xA,top,'A'],[xC,top+height,'C']])h+='<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="white" stroke="#506d77" stroke-width="2"/><text x="'+x+'" y="'+(y+(label==='A'?-12:20))+'" text-anchor="middle" font-weight="650" style="paint-order:stroke;stroke:white;stroke-width:4px;stroke-linejoin:round">'+label+'</text>';
 h+='<path d="M515 '+top+'V'+(top+height)+'" stroke="#aebfc5" stroke-dasharray="4 5"/>';
 for(const v of [-1,0,1]){const x=515+v*90;h+='<path d="M'+x+' '+top+'V'+(top+height)+'" stroke="#e1e9e9"/><text x="'+x+'" y="127" text-anchor="middle">'+v+'</text>'}
 let d='';for(let j=0;j<=200;j++){const z=j/200;d+=(j?'L':'M')+(515+90*cumulative(z))+' '+(top+height*z)}
 h+='<path data-cumulative d="'+d+'" fill="none" stroke="#007e6c" stroke-width="3"/><circle data-terminal-result="'+result+'" cx="'+(515+90*result)+'" cy="'+(top+height)+'" r="5" fill="#007e6c"/>';
 h+=tex(425,536,180,'u_i(0,z)/\\widehat U_{i0}')+tex(20,590,640,'u_i(A,C)/\\widehat U_{i0}='+((Math.abs(result)<.00005?0:result).toFixed(3).replace('.','{,}')));
 h+="<path d=\"M155 654h24\" stroke=\"#168e9a\" stroke-width=\"3\"/><text x=\"188\" y=\"659\" style=\"font-size:15px\">Kladný příspěvek</text><path d=\"M370 654h24\" stroke=\"#a24e9d\" stroke-width=\"3\"/><text x=\"403\" y=\"659\" style=\"font-size:15px\">Záporný příspěvek</text><text x=\"340\" y=\"700\" text-anchor=\"middle\" style=\"font-size:14px;fill:#60747b\">Svorky voltmetru zůstávají na obou koncích tyče.</text>";
 return h;
}};

