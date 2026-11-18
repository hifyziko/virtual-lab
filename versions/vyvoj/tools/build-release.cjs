/* Reproducible web delivery; immutable version directories, no destructive cleanup. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),version=process.argv[2]||'aktualni',working=version==='aktualni';
if(!working&&!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(version||''))throw Error('Usage: node tools/build-release.cjs 1.1.0');
const dest=require('../../../tools/project/release-output.cjs').mirror(version),web=path.join(dest,'web');
if(!working&&fs.existsSync(dest))throw Error('Version already exists: '+version+'; choose a new version.');
execFileSync(process.execPath,['m_files/Web/integrate-transformers.cjs'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['m_files/Web/build-compact-delivery.cjs'],{cwd:root,stdio:'inherit'});
const src=path.join(root,'m_files/Web/nahled-usporna-vyuka'),files=[];
function collect(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())collect(p);else files.push(p);}}
collect(src);
const allowed=f=>f==='index.html'||f==='sources/VEJKON_auta_zdroje.txt'||/^machines\/(startup|dc|bldc|sync-(pm|smooth|salient))-compact-live\/(b\d+\.js|manifest\.js|viewer\.js|viewer-canvas\.js|index\.html|fallback\.html)$/.test(f);
fs.mkdirSync(web,{recursive:true});
const manifest=[];
for(const file of files){const rel=path.relative(src,file).replaceAll('\\','/');if(!allowed(rel))continue;const to=path.join(web,rel);fs.mkdirSync(path.dirname(to),{recursive:true});let data=fs.readFileSync(file);if(rel==='index.html')data=Buffer.from(data.toString('utf8').replace(/Verze \d+\.\d+\.\d+ ·/,'Verze '+(working?'1.0':version)+' ·'));fs.writeFileSync(to,data);manifest.push({path:rel,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
const bytes=manifest.reduce((n,f)=>n+f.bytes,0);
fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({version:working?'1.0':version,channel:version,date:'2026-11-08',entry:'web/index.html',bytes,files:manifest},null,2));
fs.writeFileSync(path.join(dest,'SPUSTIT.cmd'),'@echo off\r\nstart "" "%~dp0web\\index.html"\r\n');
fs.copyFileSync(path.join(root,'COPYRIGHT.md'),path.join(dest,'COPYRIGHT.md'));
if(fs.existsSync(path.join(root,'CHANGELOG.md')))fs.copyFileSync(path.join(root,'CHANGELOG.md'),path.join(dest,'CHANGELOG.md'));
fs.writeFileSync(path.join(dest,'CTETE.md'),`# Verze ${working?'1.0':version}\n\nOtevřete SPUSTIT.cmd nebo web/index.html. Pro web nahrajte celý obsah složky web, včetně machines a sources. Samotný index.html neobsahuje všechny externí animace polí.\n\nVývojové podklady, testy, MATLAB a Ansys se na web nenahrávají. Stávající rozpracované kapitoly zůstávají výslovně označené; žádný původní modul není odstraněn.\n\nSHA-256 a seznam souborů jsou v manifest.json. ${working?'Tuto pracovní složku průběžně aktualizujeme. Číslované vydání vzniká pouze na výslovný pokyn uživatele.':'Toto je uložená záloha.'}\n`);
execFileSync(process.execPath,['tools/test-navigation.cjs',path.join(web,'index.html')],{cwd:root,stdio:'inherit'});
require('./update-version-index.cjs');
console.log(JSON.stringify({version,files:manifest.length,bytes,entry:path.join(web,'index.html')}));
