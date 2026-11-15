'use strict';
const C=require('./common.cjs'),{cp,root}=C;
const commands=[
 ['versions/vyvoj/tools/test-navigation.cjs','versions/aktualni/web/index.html'],
 ['tools/test-progressive.cjs'],
 ['versions/vyvoj/m_files/Web/synchronous/test-synchronizing.cjs'],
 ['versions/vyvoj/m_files/Web/synchronous/test-rotor-dq.cjs'],
 ['tools/test-commutation.cjs'],
 ['tools/test-particle-library.cjs'],
 ['tools/test-coulomb.cjs'],
 ['tools/test-coulomb-quantum.cjs'],
 ['tools/test-fusion-dt.cjs'],
 ['tools/project/files.cjs','audit']
];
for(const args of commands)cp.execFileSync(process.execPath,args,{cwd:root,stdio:'inherit'});
console.log('PASS: build navigation, models, public sources. No browser was opened.');
