
(()=>{
  const app=document.getElementById('app');
  const desktop=matchMedia('(min-width:851px)');
  const DESIGN_WIDTH=1600,DESIGN_HEIGHT=1000;
  // Shared by native workspaces and iframe lessons; round down to stay in bounds.
  function boundedScale(width,height,available,designWidth=DESIGN_WIDTH){
    return Math.max(.0001,Math.floor(Math.min(width/designWidth,Math.max(1,available)/height)*10000)/10000);
  }
  // Match the fusion header: compensate for scene scale down to 80% and cap at 1.
  function measureHeading(heading,width,sceneScale){
    if(!heading)return 0;
    const zoom=Math.min(1,sceneScale/.8);
    heading.style.width=(width*sceneScale/zoom)+'px';
    heading.style.zoom=String(zoom);
    const style=getComputedStyle(heading);
    const height=heading.offsetHeight+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0);
    return height*zoom;
  }
  function fillHeight(heading,logicalWidth,availableWidth,headingWidth=logicalWidth){
    const widthScale=availableWidth/logicalWidth;
    const headingHeight=measureHeading(heading,headingWidth,widthScale);
    return Math.max(DESIGN_HEIGHT,Math.floor((availableHeight(heading)-headingHeight)/widthScale));
  }
  function layoutScale(width,height,available,heading,designWidth=DESIGN_WIDTH,headingWidth=designWidth){
    let scale=boundedScale(width,height,available,designWidth);
    if(!heading)return {scale,headingHeight:0};
    let headingHeight=measureHeading(heading,headingWidth,scale);
    while(scale>.0001&&height*scale+headingHeight>available+.001){
      // A narrower row can wrap. Remeasure using its displayed width before accepting.
      const logicalHeight=headingHeight/Math.min(1,scale/.8);
      const next=available>=.8*height+logicalHeight?(available-logicalHeight)/height:available/(height+logicalHeight/.8);
      scale=Math.max(.0001,Math.floor(Math.min(scale-.0001,next)*10000+1e-8)/10000);
      headingHeight=measureHeading(heading,headingWidth,scale);
    }
    return {scale,headingHeight};
  }
  const lifted=new WeakMap();
  const viewportStyles=new WeakMap();
  const frameWidths=new WeakMap();
  const nativeHeadings=new WeakMap();
  const fullscreenButtons=new WeakSet();
  const expandedPanels=new Map();
  function positionExpandedPanels(){
    let changed=false;
    for(const [panel,saved]of expandedPanels){
      if(!panel.isConnected){expandedPanels.delete(panel);continue;}
      if(panel.classList.contains('expanded'))continue;
      saved.placeholder.replaceWith(panel);panel.classList.remove('module-window-expanded');
      if(!saved.nativeRefresh)panel.classList.remove('native-refresh');
      expandedPanels.delete(panel);changed=true;
    }
    for(const panel of app.querySelectorAll?.('.plotcard.expanded')||[]){
      if(expandedPanels.has(panel))continue;
      const placeholder=panel.cloneNode(false);placeholder.removeAttribute('id');
      placeholder.classList.remove('expanded');placeholder.setAttribute('aria-hidden','true');placeholder.inert=true;
      const nativeRefresh=panel.classList.contains('native-refresh');
      panel.before(placeholder);
      if(app.moveBefore)app.moveBefore(panel,null);else app.append(panel);
      panel.classList.add('module-window-expanded','native-refresh');
      expandedPanels.set(panel,{placeholder,nativeRefresh});changed=true;
    }
    if(changed)window.dispatchEvent(new Event('resize'));
  }
  const preparedDetails=new WeakSet(),detailLocations=new WeakMap(),explanationDocuments=new WeakSet();
  function flowRect(element){
    const details=element.matches('details')?element:element.closest('details');
    return (detailLocations.get(details)?.placeholder||element).getBoundingClientRect();
  }
  function closeExplanation(details){
    const saved=detailLocations.get(details);
    if(!saved)return;
    details.open=false;
    saved.placeholder.replaceWith(details);
    detailLocations.delete(details);
    saved.summary.focus({preventScroll:true});
  }
  function prepareExplanations(content){
    window.ModuleGuide?.collect(content);
    for(const details of content.querySelectorAll('details:not([data-window-placeholder])')){
      if(details.hasAttribute?.('data-guide-source'))continue;
      if(preparedDetails.has(details))continue;
      const summary=details.querySelector(':scope > summary');
      if(!summary)continue;
      preparedDetails.add(details);details.dataset.windowExplanation='true';
      summary.addEventListener('click',event=>{
        // A lesson with its own modal explanation already handled this click.
        if(event.defaultPrevented)return;
        event.preventDefault();
        if(details.open){closeExplanation(details);return;}
        const placeholder=details.cloneNode(false);
        placeholder.removeAttribute('id');placeholder.removeAttribute('data-window-explanation');
        placeholder.dataset.windowPlaceholder='true';placeholder.setAttribute('aria-hidden','true');placeholder.inert=true;
        const style=getComputedStyle(details);
        const extra=style.boxSizing==='border-box'?0:['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth'].reduce((n,key)=>n+(parseFloat(style[key])||0),0);
        placeholder.style.setProperty('height',(parseFloat(style.height)+extra)+'px','important');
        details.before(placeholder);detailLocations.set(details,{placeholder,summary});
        if(content.moveBefore)content.moveBefore(details,null);else content.append(details);
        details.open=true;
      });
      details.addEventListener('toggle',()=>{if(!details.open)closeExplanation(details);});
    }
    const doc=content.ownerDocument;
    if(doc&&!explanationDocuments.has(doc)){
      explanationDocuments.add(doc);
      doc.defaultView.moduleWindowFlowRect=flowRect;
      doc.addEventListener('keydown',event=>{
        if(event.key!=='Escape')return;
        const opened=doc.querySelector('details[data-window-explanation][open]');
        if(!opened)return;
        event.preventDefault();event.stopImmediatePropagation();closeExplanation(opened);
      },true);
    }
  }
  function prepareHeading(heading){
    if(!heading)return;
    const candidates=Array.from(heading.querySelectorAll('button')).filter(el=>el.dataset.moduleFullscreen||/cel[áéou]+\s*(obrazovk|okn)|fullscreen|(?:^|\s)fs(?:\s|$)/i.test([el.textContent,el.title,el.getAttribute('aria-label'),el.id].join(' ').replace(/\s+/g,' ')));
    let button=candidates.find(el=>!el.dataset.windowFullscreenCreated)||candidates[0];
    for(const duplicate of candidates)if(duplicate!==button&&duplicate.dataset.windowFullscreenCreated)duplicate.remove();
    if(!button){
      let actions=heading.querySelector('.actions');
      if(!actions){actions=document.createElement('div');actions.className='actions';heading.append(actions);}
      button=document.createElement('button');button.type='button';button.textContent='Celá obrazovka';
      button.dataset.windowFullscreenCreated='true';
      actions.append(button);
    }
    button.dataset.moduleFullscreen='true';
    window.ModuleGuide?.prepareHeading(heading,button);
    if(!fullscreenButtons.has(button)){
      fullscreenButtons.add(button);
      button.addEventListener('click',event=>{
        event.preventDefault();event.stopImmediatePropagation();
        const active=document.fullscreenElement||document.body.classList.contains('fullscreen')||document.querySelector('.plotcard.expanded');
        if(active){
          document.body.classList.remove('fullscreen');
          document.querySelectorAll('.plotcard.expanded').forEach(panel=>panel.classList.remove('expanded'));
          if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
        }else{
          document.body.classList.add('fullscreen');
          document.documentElement.requestFullscreen?.().catch(()=>{});
        }
        window.dispatchEvent(new Event('resize'));
      },true);
    }
  }
  const currentScale=element=>Number(element.style.zoom)||1;
  const isStage=element=>element?.classList?.contains('module-frame-stage')||element?.classList?.contains('machine-frame-stage');
  const frameHost=frame=>isStage(frame.parentElement)?frame.parentElement.parentElement:frame.parentElement;
  window.prepareModuleFrame=frame=>{
    if(isStage(frame.parentElement))return;
    const stage=document.createElement('div');
    stage.className='module-frame-stage';
    stage.style.cssText='position:relative;width:100%;min-width:0';
    frame.before(stage);
    if(stage.moveBefore)stage.moveBefore(frame,null);else stage.append(frame);
    frame.style.position='absolute';frame.style.top='0px';frame.style.width=DESIGN_WIDTH+'px';
    prepareHeading(frameHost(frame).querySelector(':scope > .modulehead'));
  };
  window.prepareMachineFrame=window.prepareModuleFrame;

  // The iframe is an output of fitting, never the viewport input for its content.
  // Pin viewport-dependent CSS to the host window before measuring the document.
  window.prepareImportedViewport=(frame,doc,hostHeight)=>{
    const main=doc.querySelector?.('main');
    if(main)prepareExplanations(main);
    if(main?.classList?.contains('uniform-module-layout')&&!isStage(frame.parentElement)){
      window.prepareModuleFrame(frame);
    }
    const available=Math.max(1,Math.floor(widthOf(frameHost(frame))));
    const standard=main?.classList?.contains('uniform-module-layout');
    const width=standard?1600:main?naturalWidth(main,available):available;
    frameWidths.set(frame,width);
    if(frame.style.width!==width+'px')frame.style.width=width+'px';
    if(frame.style.zoom)frame.style.removeProperty('zoom');
    let height=standard?1000:Math.max(1,Math.round(hostHeight));
    if(main&&getComputedStyle(main).getPropertyValue?.('--module-flexible-height').trim()==='1'){
      // Give a width-limited lesson the remaining window height as well. Derive
      // it from the host, never from the previously fitted child viewport.
      const heading=frameHost(frame).querySelector(':scope > .modulehead');
      if(heading){
        height=fillHeight(heading,width,available);
      }
    }
    const root=doc.documentElement.style;
    if(root.getPropertyValue('--module-host-height')!==height+'px')root.setProperty('--module-host-height',height+'px');
    for(const style of doc.querySelectorAll('style')){
      let saved=viewportStyles.get(style);
      if(saved&&style.textContent===saved.output&&saved.height===height)continue;
      if(!saved||style.textContent!==saved.output)saved={source:style.textContent};
      // Resolve only height conditions; width breakpoints remain native CSS.
      const tokens=[];
      const source=saved.source.replace(/url\([^)]*\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
        value=>'__pl_css_'+(tokens.push(value)-1)+'__');
      const pinned=source.replace(/\((min|max)-height\s*:\s*([\d.]+)px\s*\)/g,
        (_,bound,value)=>((bound==='min'?height>=+value:height<=+value)?'(min-width:0px)':'(min-width:1000000px)'))
        .replace(/(-?(?:\d*\.)?\d+)(?:d|s|l)?vh\b/g,(_,value)=>'calc(var(--module-host-height) * '+(+value/100)+')')
        .replace(/__pl_css_(\d+)__/g,(_,index)=>tokens[index]);
      saved.output=pinned;saved.height=height;viewportStyles.set(style,saved);
      if(style.textContent!==pinned)style.textContent=pinned;
    }
  };

  function widthOf(element){
    const style=getComputedStyle(element);
    // A scrollbar created by the PREVIOUS fitted layout must not narrow the
    // next viewport input. Window CSS pixels already account for browser/OS zoom.
    if(Number.isFinite(window.innerWidth)&&(element===app||element.parentElement===app)){
      const inset=el=>{const s=getComputedStyle(el);return ['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth','marginLeft','marginRight'].reduce((n,k)=>n+(parseFloat(s[k])||0),0);};
      return Math.max(1,window.innerWidth-inset(document.body)-inset(app)-(element===app?0:inset(element)));
    }
    return element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
  }

  // Derive an unscaled layout width from CSS constraints, not the last fitted
  // bounding box. Thus enlarging a module cannot change the next measurement.
  function naturalWidth(content,available){
    if(content.classList?.contains('uniform-module-layout'))return 1600;
    const style=getComputedStyle(content),limit=parseFloat(style.maxWidth);
    if(!Number.isFinite(limit)||!/^\d+(?:\.\d+)?px$/.test(style.maxWidth||''))return available;
    const extra=style.boxSizing==='border-box'?0:
      ['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+(parseFloat(style[key])||0),0);
    return Math.max(1,Math.min(available,Math.ceil(limit+extra)));
  }

  function collapsedHeight(content,height,scale){
    for(const section of content.querySelectorAll(':scope > details[open]')){
      if(['absolute','fixed'].includes(getComputedStyle(section).position))continue;
      const summary=section.querySelector(':scope > summary');
      if(summary)height-=(section.getBoundingClientRect().height-summary.getBoundingClientRect().height)/scale;
    }
    return height;
  }

  function positionSummaries(content,visibleHeight,scale){
    const saved=lifted.get(content)??[];
    if(visibleHeight===Infinity){
      for(const {marker,section} of saved)marker.replaceWith(section);
      lifted.delete(content);
      return;
    }
    const top=content.getBoundingClientRect().top;
    const stage=Array.from(content.children).find(row=>row.tagName!=='DETAILS'&&
      Array.from(row.querySelectorAll('svg,canvas')).some(figure=>{
        const bounds=figure.getBoundingClientRect();
        return bounds.width/scale>=160&&bounds.height/scale>=120;
      }));
    if(!stage)return;
    for(const section of content.querySelectorAll(':scope > details:not([open])')){
      const summary=section.querySelector(':scope > summary');
      if(!summary||!summary.getClientRects().length||saved.some(item=>item.section===section))continue;
      if((summary.getBoundingClientRect().bottom-top)/scale<=visibleHeight)continue;
      const marker=content.ownerDocument.createComment('Original section position');
      section.before(marker);
      stage.before(section);
      saved.push({marker,section});
    }
    if(saved.length)lifted.set(content,saved);
  }

  function fit(element,content,naturalHeight,available,width,layoutZoom){
    if(!desktop.matches&&!content.classList?.contains('uniform-module-layout')){
      element.style.removeProperty('zoom');
      element.style.removeProperty('width');
      element.style.removeProperty('transform');
      element.style.removeProperty('transform-origin');
      element.style.removeProperty('left');
      element.style.removeProperty('position');
      element.style.removeProperty('margin-bottom');
      element.style.removeProperty('margin-left');
      element.style.removeProperty('margin-right');
      element.classList.remove('module-window-fit');
      positionSummaries(content,Infinity,1);
      return;
    }
    const standard=content.classList?.contains('uniform-module-layout');
    const innerScale=element===content?currentScale(element):1;
    const closedHeight=collapsedHeight(content,naturalHeight,innerScale);
    const fittedWidth=element===content?naturalWidth(content,width):(frameWidths.get(element)||naturalWidth(content,width));
    // The viewport is a hard bound in BOTH dimensions, for every module.
    // A width-only scale (or a minimum zoom floor) can push most of a tall lesson off screen.
    const scale=layoutZoom??Math.min(width/Math.max(1,fittedWidth),Math.max(1,available)/Math.max(1,closedHeight));
    const topOffset=element===content?0:content.getBoundingClientRect().top;
    positionSummaries(content,closedHeight*scale<=available+(lifted.has(content)?-12:.5)?Infinity:available/scale-topOffset,innerScale);
    element.classList.add('module-window-fit');
    if(element.style.width!==fittedWidth+'px')element.style.width=fittedWidth+'px';
    if(element===content&&content.dataset.windingViewport){
      // CSS zoom changes layout dimensions too; transformed overflow does not.
      element.style.zoom=String(Math.floor(scale*10000)/10000);
      element.style.removeProperty('transform');
      element.style.removeProperty('left');
      element.style.removeProperty('position');
      element.style.removeProperty('margin-bottom');
    }else if(element===content){
      const zoom=String(Math.round(scale*10000)/10000);
      if(element.style.zoom!==zoom)element.style.zoom=zoom;
    }else if(isStage(element.parentElement)){
      // The stage reserves exactly the displayed height. Keep the unzoomed
      // iframe viewport independent of browser zoom and rounded device pixels.
      const zoom=Math.floor((scale+1e-10)*10000)/10000;
      element.style.removeProperty('zoom');
      element.style.position='absolute';
      element.style.top='0px';
      element.style.left='50%';
      element.style.transform='translateX(-50%) scale('+zoom+')';
      element.style.transformOrigin='top center';
      element.style.margin='0px';
      element.parentElement.style.height=(naturalHeight*zoom)+'px';
      const heading=frameHost(element)?.querySelector?.(':scope > .modulehead');
      if(heading){
        for(const property of ['transform','left','position'])heading.style.removeProperty(property);
        heading.style.marginLeft='auto';
        heading.style.marginRight='auto';
        measureHeading(heading,fittedWidth,zoom);
      }
    }else{
      // CSS transforms do not resize the child viewport, unlike CSS zoom.
      element.style.removeProperty('zoom');
      const zoom=Math.floor((scale+1e-10)*10000)/10000;
      const transform='translateX(-50%) scale('+zoom+')';
      element.style.position='relative';
      element.style.left='50%';
      if(element.style.transform!==transform)element.style.transform=transform;
      element.style.transformOrigin='top center';
      // The host heading follows the actual fitted module edge, not the page gutter.
      const heading=element.parentElement?.querySelector?.(':scope > .modulehead');
      if(heading){
        heading.style.position='relative';
        heading.style.left='50%';
        heading.style.transform='translateX(-50%)';
        heading.style.marginLeft='0px';
        heading.style.marginRight='0px';
        measureHeading(heading,fittedWidth,zoom);
      }

      element.style.marginLeft='0px';
      element.style.marginRight='0px';
      const margin=-(naturalHeight*(1-zoom))+'px';
      if(element.style.marginBottom!==margin)element.style.marginBottom=margin;
    }
  }

  function availableHeight(element){
    const footer=document.getElementById('app-project-credit');
    const footerBounds=footer?.getBoundingClientRect();
    // Fixed footer POSITION is affected by a transient horizontal scrollbar.
    // Its reserved height and the window viewport remain stable inputs.
    let edge=Number.isFinite(footerBounds?.height)?innerHeight-footerBounds.height-(desktop.matches?0:12):Math.min(innerHeight,footerBounds?.top??innerHeight);
    const bottomInset=el=>{const s=getComputedStyle(el);return (parseFloat(s.paddingBottom)||0)+(parseFloat(s.borderBottomWidth)||0);};
    const container=element.parentElement;
    if(container===app)edge-=bottomInset(app);
    else if(container?.parentElement===app)edge-=bottomInset(app)+bottomInset(container);
    const top=element.getBoundingClientRect().top+(window.scrollY||0);
    return Math.max(1,edge-Math.max(0,top)-4);
  }

  window.fitImportedModule=(frame,content,naturalHeight)=>{
    const width=widthOf(frameHost(frame));
    // Synchronous lessons can grow horizontally after KaTeX or a mode switch.
    // Measure on the logical viewport prepared above, never on the scaled frame.
    // Enlarge the CHILD viewport before shrinking the complete visible extent;
    // shrinking a 1600px iframe alone would still clip its overflowing right edge.
    if(content.classList?.contains('uniform-module-layout')){
      const logical=frameWidths.get(frame)||DESIGN_WIDTH;
      const extent=Math.ceil(Math.max(logical,(content.scrollWidth||logical)+(content.offsetLeft||0)));
      frameWidths.set(frame,extent);
    }
    const heading=frameHost(frame).querySelector(':scope > .modulehead');
    const height=Math.max(1,naturalHeight);
    const designWidth=frameWidths.get(frame)||naturalWidth(content,width);
    const {scale}=layoutScale(width,height,availableHeight(heading||frame),heading,designWidth);
    frame.style.height=height+'px';
    fit(frame,content,height,height*scale,width,heading?scale:undefined);
  };

  let native=null,pending=false,observedHeading=null;
  const observer=new ResizeObserver(schedule);
  const headingObserver=new MutationObserver(schedule);
  function update(){
    pending=false;
    positionExpandedPanels();
    const child=Array.from(app.children||[]).find(el=>!el.classList.contains('module-window-heading'))||app.firstElementChild;
    const module=location.hash&&!location.hash.startsWith('#group-')&&child&&!child.classList.contains('imported-workspace')?child:null;
    if(module!==native){
      observer.disconnect();
      headingObserver.disconnect();observedHeading=null;
      native=module;
      if(native)observer.observe(native);
    }
    const winding=!!native&&!!window.Lab?.catalog?.some(m=>m.id===location.hash.slice(1)&&['common','induction','sync'].includes(m.group));
    app.classList.toggle('winding-window-host',winding);
    app.classList.toggle('module-window-host',!!native);
    if(!native)return;
    native.classList.add('workspace','uniform-module-layout');
    native.dataset.nativeViewport='true';
    prepareExplanations(native);
    let heading=nativeHeadings.get(native)||native.querySelector?.(':scope > .modulehead');
    if(heading){
      prepareHeading(heading);
      nativeHeadings.set(native,heading);
      if(heading.parentElement===native){heading.classList.add('module-window-heading');native.before(heading);}
      heading.style.removeProperty('zoom');
      if(observedHeading!==heading){headingObserver.disconnect();headingObserver.observe(heading,{childList:true,subtree:true});observedHeading=heading;}
    }
    if(window.Lab?.catalog?.some(m=>m.id===location.hash.slice(1)&&['common','induction','sync'].includes(m.group))){
      native.dataset.windingViewport='true';
      native.dataset.module=location.hash.slice(1);
      native.classList.add('native-refresh');
    }
    // Keep native chart viewport units independent of the fitted CSS zoom.
    const viewportHeight='1000px';
    if(!native.style.getPropertyValue('--native-viewport-height')){
      native.style.setProperty('--native-viewport-height',viewportHeight);
    }
    const width=widthOf(app);
    const available=availableHeight(native);
    if(heading){
      // Native and embedded lessons use the same heading size and scene fitting.
      // The lesson remains a direct app child so its renderers and CSS keep working.
      native.style.zoom='1';
      const fill=winding||['energy-workspace','dc-workspace','sp-transition'].some(name=>native.classList.contains(name))||!!native.querySelector(':scope > .gridplots');
      native.toggleAttribute('data-native-fill',fill);
      const naturalWidth=Math.max(1,native.offsetWidth);
      const style=getComputedStyle(native);
      const inset=(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0);
      if(fill){
        const logicalHeight=fillHeight(heading,naturalWidth,width,naturalWidth-inset);
        native.style.setProperty('height',logicalHeight+'px','important');
        native.style.setProperty('--native-viewport-height',logicalHeight+'px');
      }else native.style.removeProperty('height');
      const naturalHeight=Math.max(native.offsetHeight,native.scrollHeight);
      const result=layoutScale(width,naturalHeight,availableHeight(heading),heading,naturalWidth,naturalWidth-inset);
      native.style.zoom=String(result.scale);
      heading.style.marginLeft='auto';heading.style.marginRight='auto';
      return;
    }
    // Measure at natural zoom. CSS zoom can change viewport units, wrapping and
    // scroll overflow, so measuring the fitted box feeds its output back in.
    if(winding){
      // Same contract as imported lessons: 1600 x 1000 content plus a
      // heading at the same scale. Keep the DOM intact for module handlers.
      const heading=native.querySelector(':scope > .modulehead');
      native.style.zoom='1';
      if(heading)heading.style.zoom='1';
      const {scale,headingHeight}=layoutScale(width,DESIGN_HEIGHT,available,heading);
      native.style.setProperty('height',(1000+headingHeight)+'px','important');
      native.style.zoom=String(scale);
      if(heading)heading.style.zoom='1';
      return;
    }
    const fittedZoom=native.style.zoom;
    if(desktop.matches||native.dataset.windingViewport)native.style.zoom='1';
    const naturalHeight=Math.max(native.offsetHeight,native.scrollHeight);
    native.style.zoom=fittedZoom;
    fit(native,native,naturalHeight,available,width);
  }
  // Route calls this synchronously after mount, before the browser can paint.
  window.fitWindingModule=update;
  document.fonts?.ready.then(schedule);
  function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
  const bodyObserver=new MutationObserver(schedule);
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('resize',schedule);
  for(const event of ['input','change','click','toggle'])app.addEventListener?.(event,schedule,true);
  let browserFullscreen=false;
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement)browserFullscreen=true;
    else if(browserFullscreen){browserFullscreen=false;document.body.classList.remove('fullscreen');}
    schedule();
  });
  schedule();
})();
