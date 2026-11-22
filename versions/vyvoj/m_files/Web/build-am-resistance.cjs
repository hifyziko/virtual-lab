const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'induction');
const ref=fs.readFileSync(path.join(__dirname,'../HiFyziko_TR04_pricna_vetev_v8.html'),'utf8');
const mathCss=ref.match(/<style id="katex-typesetting">([\s\S]*?)<\/style>/)[1];
const lib=[...ref.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('!function')&&m[1].includes('ParseError'))[1];
const css=fs.readFileSync(path.join(dir,'torque.css'),'utf8').split('.schema-scroll')[0];
let html=fs.readFileSync(path.join(dir,'resistance-template.html'),'utf8').replace('/*SHARED*/',css+mathCss).replace('/*MATH*/',lib).replace('/*UI*/',fs.readFileSync(path.join(dir,'resistance-control.js'),'utf8')+';\n'+fs.readFileSync(path.join(__dirname,'magnetic-field/contours.js'),'utf8')+';\n'+fs.readFileSync(path.join(dir,'resistance-coil.js'),'utf8')+';\n'+fs.readFileSync(path.join(dir,'resistance.js'),'utf8'));
fs.writeFileSync(path.join(dir,'resistance.html'),require('./project-credit.cjs')(html));
console.log('Built rotor resistance experiment');
