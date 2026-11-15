// Compile the legacy lesson into its final layout before browser parsing.
module.exports=function(source){
 if(source.includes('data-static-short-circuit'))return source;
 function take(pattern){
  const match=pattern.exec(source);if(!match)throw Error('Short-circuit element missing: '+pattern);
  const start=match.index,tag=match[1],tokens=new RegExp('<(/?)'+tag+'\\b[^>]*>','g');tokens.lastIndex=start;
  let depth=0,end;for(let token;token=tokens.exec(source);){depth+=token[1]?-1:1;if(!depth){end=tokens.lastIndex;break;}}
  if(!end)throw Error('Unclosed '+tag);
  const value=source.slice(start,end);source=source.slice(0,start)+source.slice(end);return value;
 }
 const scheme=take(/<(section) class="card"><h2>Schéma použité/);
 const equations=take(/<(section) class="card equations">/);
 source=source.replace(/<div class="bottom">\s*<\/div>/,'');
 source=source.replace('<aside class="side">','<aside class="side">'+scheme);
 source=source.replace('</aside>',equations+'</aside>');
 source=source.replace(/class="card metric"/g,'class="card metric" hidden');
 source=source.replace('<div class="card"><h2>Fáze při stejném zkratu','<div class="card envelope-results"><h2>Fáze při stejném zkratu');
 const notice=take(/<(div|p) [^>]*id="clipWarning"[^>]*>/).replace('id="clipWarning"','id="clipWarning" role="status"');
 source=source.replace('</section>\n<aside class="side">',notice+'</section>\n<aside class="side">');
 if(!source.includes(notice))throw Error('Graph insertion missing');
 source=source.replace(/<p class="axis-note">[\s\S]*?<\/p>/,'').replace('id="play"','id="play" hidden');
 source=source.replace('<summary>Předpoklady modelu</summary>','<summary>Pomocné vztahy a předpoklady modelu</summary>');
 return source.replace(/<main\b/,'<main data-static-short-circuit');
};
