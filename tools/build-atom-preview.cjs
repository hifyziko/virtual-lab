const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'../versions/vyvoj/m_files/fusion/particle-list');
const template=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const [file,mode,id,title,legend,note] of [
 ['atomy.html','atoms','fu03-atomy','Galerie atomů','Oběh a měkká dráha jsou názorné schéma, nikoli skutečná trajektorie.','Obal a modré body znázorňují tytéž elektrony · 1.0'],
 ['jadra.html','nuclei','fu02-jadra','Galerie jader','Červený proton · šedý neutron · bez elektronového obalu','Ilustrativní povrchy a měřítko · 1.0']
]){
 const html=template.replace('data-fusion-page="fu02-galerie"','data-fusion-page="'+id+'"').replace('data-gallery-initial="all"','data-gallery-initial="'+mode+'"')
  .replace('<title>Částice a jádra · Virtuální laboratoř</title>','<title>'+title+' · Virtuální laboratoř</title>')
  .replace('<h1>Částice a jádra</h1>','<h1>'+title+'</h1>')
  .replace(/<span data-gallery-legend>.*?<\/span>/,'<span data-gallery-legend>'+legend+'</span>').replace(/<span data-gallery-note>.*?<\/span>/,'<span data-gallery-note>'+note+'</span>');
 fs.writeFileSync(path.join(dir,file),html);
}
