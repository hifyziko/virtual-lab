const fs=require('fs'),path=require('path'),dir=__dirname;
module.exports=function(css,lib){
 let h=fs.readFileSync(path.join(dir,'isolated-template.html'),'utf8').replace('/*STYLE*/',()=>fs.readFileSync(path.join(dir,'isolated.css'),'utf8')).replace('/*KATEX*/',()=>'<style>'+css+'</style><script>'+lib+'</script>');
 const scripts=['isolated-model.js','princip-model.js','machine-art.js','isolated.js'].map(n=>'<script>'+fs.readFileSync(path.join(dir,n),'utf8')+'</script>').join('');
 h=h.replace('/*SCRIPTS*/',()=>scripts);fs.writeFileSync(path.join(dir,'isolated.html'),h);return h;
};
