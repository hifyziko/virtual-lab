// The legacy route keeps the catalogue's scroll offset. Reset only this lesson,
// before fitting and once after its fonts load; parameter edits never scroll.
module.exports=function stabilityHost(html){
 const marker="/* stability-initial-position */";
 if(!html.includes(marker)){
  const anchor="const frame=document.getElementById('transformer-frame');";
  if(!html.includes(anchor))throw Error('Imported frame anchor missing');
  html=html.replace(anchor,marker+"\nif(entry.id==='09-synchronni')window.scrollTo({top:0,left:0,behavior:'instant'});\n"+anchor);
 }
 const ready='fontsReady=true;resizeModule();';
 const replacement="fontsReady=true;if(entry.id==='09-synchronni')window.scrollTo({top:0,left:0,behavior:'instant'});resizeModule();";
 if(html.includes(ready))html=html.replace(ready,replacement);
 return html;
};
