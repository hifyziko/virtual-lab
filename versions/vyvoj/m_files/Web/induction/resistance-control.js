// Reserve just over half the track for the first tenth of the resistance range.
function rotorResistanceControl(input){
 const initial=Number(input.value);
 input.max=1900;
 input.step=1;
 const format=new Intl.NumberFormat('cs-CZ',{maximumFractionDigits:4});
 function set(r){
  input.value=Math.round(r<=.1?r*10000:1000+(r-.1)*1000);
  describe();
 }
 function read(){
  const position=Number(input.value);
  return position<=1000?position/10000:(position-900)/1000;
 }
 function describe(){input.setAttribute('aria-valuetext',format.format(read()));}
 input.addEventListener('input',describe);
 set(initial);
 return {read,set,formatted:()=>format.format(read())};
}
