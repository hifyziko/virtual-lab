'use strict';
const C=require('./common.cjs'),{cp,root}=C;
const commands=[
 ['versions/vyvoj/tools/test-navigation.cjs','versions/aktualni/web/index.html'],
 ['tools/test-progressive.cjs'],
 ['tools/test-module-guide.cjs'],
 ['versions/vyvoj/m_files/Web/synchronous/test-synchronizing.cjs'],
 ['versions/vyvoj/m_files/Web/synchronous/test-rotor-dq.cjs'],
 ['tools/test-commutation.cjs'],
 ['tools/test-particle-library.cjs'],
 ['tools/test-fusion-navigation.cjs'],
 ['tools/test-fusion-controls.cjs'],
 ['tools/test-fusion-render-lifecycle.cjs'],
 ['tools/test-coulomb.cjs'],
 ['tools/test-coulomb-quantum.cjs'],
 ['tools/test-fusion-dt.cjs'],
 ['tools/test-fusion-reactions.cjs'],
 ['tools/test-fusion-visual-contract.cjs'],
 ['tools/test-fusion-field-worker.cjs'],
 ['tools/test-tunneling-wave.cjs'],
 ['tools/test-coulomb-mobile.cjs'],
 ['tools/project/files.cjs','audit']
];
for(const args of commands)cp.execFileSync(process.execPath,args,{cwd:root,stdio:'inherit'});
console.log('PASS: build navigation, models, public sources. No browser was opened.');
