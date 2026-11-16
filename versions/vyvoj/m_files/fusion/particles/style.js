/* The single visual definition used by the gallery and all consuming modules. */
(function(root){
const style={
 fields:{electric:"#b57825",magnetic:"#356ac3"},
 colors:{p:0xeb3026,n:0x8a8a8a,e:0x126bc3,positron:0xa638d2,neutrino:0xf2f7f5,neutrinoOutline:0x294a53},
 labels:{p:'\\mathrm p^{+}',n:'\\mathrm n',e:'\\mathrm e^{-}',positron:'\\mathrm e^{+}',neutrino:'\\nu_{\\mathrm e}'},
 radii:{p:.69,n:.69,e:.38,positron:.38,neutrino:.3},
 segments:[64,40],fontSize:'18px',
 particleLabels:{fontSize:50,referenceDiameter:150,orbitScale:1},
 render:{initialScale:1.25,minScale:.85,maxScale:1.5},
 background:0xf9faf6,
 light:{hemisphere:1.25,key:2,fill:.4},
 motion:{patchCount:20,patchSharpness:22,lobeAmplitude:.038,breathingAmplitude:.004,driftAmplitude:.012},
 spacing:.78,
 nucleusIds:['proton','deuteron','triton','helium3','alpha'],
 atomViews:{
  hydrogen:{name:'Atom vodíku',nucleus:'proton',electrons:1},
  deuterium:{name:'Atom deuteria',nucleus:'deuteron',electrons:1},
  tritium:{name:'Atom tritia',nucleus:'triton',electrons:1},
  helium:{name:'Atom helia-4',nucleus:'alpha',electrons:2}
 },
 electronCloud:{radius:3.5,opacity:.19,markers:[[2.75,.85,0],[-2.75,-.85,0]],markerRadius:.16,orbitRadius:2.88,orbitTilt:.28,orbitSpeed:.45,orbitOpacity:.36},
 connected:{vibration:1.5,yaw:0,pitch:0,autoRotate:false,atoms:{
  proton:[[0,0,0,1]],neutron:[[0,0,0,0]],electron:[[0,0,0,-1]],positron:[[0,0,0,-1]],neutrino:[[0,0,0,-2]],
  deuteron:[[-.58,0,0,1],[.58,0,0,0]],
  triton:[[-.68,-.39,0,1],[.68,-.39,0,0],[0,.78,0,0]],
  helium3:[[-.68,-.39,0,1],[.68,-.39,0,1],[0,.78,0,0]],
  alpha:[[-.65,-.65,0,1],[.65,.65,0,1],[-.65,.65,0,0],[.65,-.65,0,0]]
 }},
 layouts:{1:[[0,0,0]],2:[[-.68,0,.05],[.68,0,-.05]],3:[[0,.65,-.13],[-.66,-.43,.12],[.66,-.43,.06]],4:[[-.58,.5,.28],[.6,.5,-.15],[-.6,-.54,-.2],[.58,-.54,.28]]},
 species:{
  proton:{name:'Proton',kinds:['p']},neutron:{name:'Neutron',kinds:['n']},electron:{name:'Elektron',kinds:['e']},positron:{name:'Pozitron',kinds:['positron']},neutrino:{name:'Elektronové neutrino',kinds:['neutrino']},
  deuteron:{name:'Deuteron',kinds:['p','n']},triton:{name:'Triton',kinds:['p','n','n']},
  helium3:{name:'Jádro helia-3',kinds:['p','p','n']},alpha:{name:'Alfa · jádro helia-4',kinds:['p','n','n','p']}
 }
};
root.HiFyzikoParticleStyle=style;
if(typeof module!=='undefined')module.exports=style;
})(typeof window==='undefined'?globalThis:window);
