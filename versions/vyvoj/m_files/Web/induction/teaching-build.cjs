module.exports=html=>{
 const start=html.indexOf("Lab.register({id:'10-asynchronni'"),end=html.indexOf('</script>',start);if(start<0)throw Error('AM module missing');
 let s=html.slice(start,end);
 s=s.replace("[2,'MMN F₁ / F₂'],[1,'Toky ψs / ψr']","[2,'Proudová pole F₁ / F₂'],[1,'Spřažené toky ψs / ψr']");
 // Teaching experiments will have their own modules; keep the motor workspace clear.
 s=s.replace(/AMTeaching\.update\(ctx,d\);\s*/g,'');
 html=html.slice(0,start)+s+html.slice(end);
 html=html.replace(/<!-- am-teaching:start -->[\s\S]*?<!-- am-teaching:end -->/g,'');
 return require('./loupe-build.cjs')(html);
};
