/* FEM viewers already report blocking loads through #status. Keep that source
   of truth, but present it over the actual scene rather than in the footer. */
(()=>{'use strict';
 const scene=document.querySelector('.views'),status=document.getElementById('status');if(!scene||!status)return;
 const layer=document.createElement('div');layer.className='lab-scene-loading';layer.hidden=true;
 const card=document.createElement('section');card.className='lab-loading';card.setAttribute('role','status');
 const caption=document.createElement('p'),bar=document.createElement('progress'),retry=document.createElement('button');bar.setAttribute('aria-label','Načítání dat animace');retry.textContent='Zkusit znovu';retry.hidden=true;retry.onclick=()=>location.reload();card.append(caption,bar,retry);layer.append(card);scene.append(layer);
 let timer=null,started=false,disposed=false;
 function sync(){const text=status.textContent||'',busy=/^Načít|^Připravuji/.test(text),error=/^Chyba dat|nelze načíst/i.test(text);
  if(!busy&&!error){clearTimeout(timer);timer=null;layer.hidden=true;scene.setAttribute('aria-busy','false');status.style.visibility='';return;}
  caption.textContent=text;bar.hidden=error;retry.hidden=!error;scene.setAttribute('aria-busy',String(busy));
  const show=()=>{if(disposed)return;layer.hidden=false;status.style.visibility='hidden';};
  // Initial loading is immediate; suppress one-frame flashes during prefetch.
  if(!started||!layer.hidden||error){clearTimeout(timer);timer=null;show();}else if(!timer)timer=setTimeout(()=>{timer=null;show();},200);started=true;
 }
 const observer=new MutationObserver(sync);observer.observe(status,{childList:true,characterData:true,subtree:true});sync();
 addEventListener('pagehide',()=>{disposed=true;clearTimeout(timer);observer.disconnect();retry.onclick=null;},{once:true});
})();
