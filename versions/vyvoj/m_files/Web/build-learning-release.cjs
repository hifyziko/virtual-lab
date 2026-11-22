const fs=require('fs'),path=require('path');
const root=__dirname,file=path.join(root,'interaktivni-elektricke-stroje.html');
let html=fs.readFileSync(file,'utf8').replace(/<!-- learning-release:start -->[\s\S]*?<!-- learning-release:end -->\s*/g,'');
const pitchStart=html.indexOf("Lab.register({id:'12-krok'"),pitchEnd=html.indexOf('</script>',pitchStart);
if(pitchStart<0||pitchEnd<pitchStart)throw Error('Pitch module anchors');
html=html.slice(0,pitchStart)+fs.readFileSync(path.join(root,'pitch-module.js'),'utf8')+html.slice(pitchEnd);
const motionStart=html.indexOf("Lab.register({id:'03-pohyb'"),motionEnd=html.indexOf('</script>',motionStart);
if(motionStart<0||motionEnd<motionStart)throw Error('Harmonic motion module anchors');
html=html.slice(0,motionStart)+fs.readFileSync(path.join(root,'harmonic-motion.js'),'utf8')+html.slice(motionEnd);
html=html.replace(/<script id="rotating-field-module">[\s\S]*?<\/script>/,()=>'<script id="rotating-field-module">\n'+fs.readFileSync(path.join(root,'tocive-pole.js'),'utf8')+'\n</script>');
// Keep the original MMF module in its native position so direct hash links also
// have the field dependencies before the first mount.
const mmfStart=html.indexOf("Lab.register({id:'01-drazky'"),mmfEnd=html.indexOf('\n}});',mmfStart)+6;
if(mmfStart<0||mmfEnd<mmfStart)throw Error('MMF module anchors');
// Strip dependencies injected by the previous build together with the module.
const depMarker='/* winding-field-dependencies:start */',oldDeps=html.lastIndexOf(depMarker,mmfStart);
const replaceStart=oldDeps>=0&&mmfStart-oldDeps<100000?oldDeps:mmfStart;
const mmfSources=['magnetic-field/polar-slots.js','magnetic-field/contours.js','synchronous/machine-art.js','mmf-field.js','mmf-module.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
html=html.slice(0,replaceStart)+depMarker+'\n'+mmfSources+html.slice(mmfEnd);
const chartFn=html.indexOf('Lab.chart=function'),chartMarker='/* Canvas presentation shared by the original modules; no model parameters. */';
let chartStart=chartFn;while(chartStart>0){const before=html.slice(0,chartStart).trimEnd();if(!before.endsWith(chartMarker))break;chartStart=before.length-chartMarker.length;}
const chartEnd=html.indexOf('\n};',chartFn);
if(chartStart<0||chartEnd<chartStart||chartEnd-chartStart>12000)throw Error('Shared chart anchor');
html=html.slice(0,chartStart)+fs.readFileSync(path.join(root,'native-chart-style.js'),'utf8')+html.slice(chartEnd+4);
const css=['home-discovery.css','learning-modules.css','skew-integrated-cancellation.css','skew-block-layout.css','energy-experiments/style.css','parameter-controls.css'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const js=['learning-models.js','skew-stator.js','skew-whole-rod.js','skew-integrated-cancellation.js','skew-block-layout.js','skew-module.js','conversion-module.js','single-phase-simple-scene.js','single-phase-conversion.js','../em-core/motional-art.js','energy-experiments/model.js','magnetic-field/contours.js','energy-experiments/fields.js','energy-experiments/field-lines.js','energy-experiments/armature-art.js','../em-core/biot-savart.js','energy-experiments/circuit-field.js','energy-experiments/rod-scene.js','energy-experiments/rod-section.js','energy-experiments/ui.js','home-discovery.js','parameter-controls.js'].map(f=>{let source=fs.readFileSync(path.join(root,f),'utf8');if(f==='energy-experiments/armature-art.js')source=source.replace('__SALIENT_PATH__',fs.readFileSync(path.join(root,'synchronous/machine-art.js'),'utf8').match(/const salient='([^']+)'/)[1]);return source;}).join('\n');
html=html.replace('</body>',()=>`<!-- learning-release:start -->\n<style>${css}</style><script>${js}\n</script>\n<!-- learning-release:end -->\n</body>`);
html=html.replaceAll('Vinutí a společné principy','Vinutí').replaceAll('Účinky elektrického proudu a elektromagnetická indukce','Základní elektromagnetické principy');
// The page title is sufficient; keep the shared shell free of a branding header.
html=html.replace(/<header class="top">[\s\S]*?<\/header>/,'');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Virtuální laboratoř elektrických strojů</title>');
fs.writeFileSync(file,html);
require('./build-sync-dq.cjs');
require('./synchronous/dq-integration.cjs')(file);
require('./build-rotor-dq.cjs');
require('./synchronous/rotor-dq-integration.cjs')(file);
require('./direct-current/integrate.cjs')(file);
/* Historical -katex/-responzivni copies are retired; publish through build-release.cjs. */
console.log('Integrated learning modules and cancellation on the stator · 1.4.0');
