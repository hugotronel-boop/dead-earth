/* DEAD EARTH 0.4 — interface pixel : commandes regroupées, animations et tiroirs. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  let animTimer=null,actionTimer=null,drawer=null;
  function snapshot(){return window.DEAD_EARTH_SNAPSHOT?.()||null}
  function renderMini(s){
    if(!s)return;
    $('remoteCount').textContent=Math.max(0,s.dailyRemaining)+'/2 À DISTANCE';
    $('gpsMode').classList.toggle('selected',s.mode==='gps');
    $('demoMode').classList.toggle('selected',s.mode!=='gps');
    $('drawingControls').hidden=!s.drawing;
  }
  function characterAction(type){
    const hero=document.querySelector('.survivor-figure'),hint=$('heroAction');
    const allowed=['idle','walk','run','scavenge','eat','drink','rest','hurt','heal'];
    if(!allowed.includes(type))type='idle';
    clearTimeout(animTimer);clearTimeout(actionTimer);
    hero.classList.remove('walk','run','scavenge','eat','drink','hurt');
    hero.classList.add(type==='rest'||type==='heal'?'idle':type);
    const avatar=document.querySelector('.character-image');
    if(avatar){avatar.className='character-image';avatar.classList.add('anim-'+type)}
    const names={idle:'',walk:'EN MARCHE',run:'EN COURSE',scavenge:'FOUILLE EN COURS',eat:'NOURRITURE',drink:'HYDRATATION',rest:'REPOS',heal:'SOINS',hurt:'CONTACT HOSTILE'};
    hint.textContent=names[type];hint.classList.toggle('show',type!=='idle');
    if(type!=='idle'&&type!=='scavenge')animTimer=setTimeout(()=>characterAction('idle'),type==='hurt'?1200:1700);
    if(type!=='idle'&&type!=='scavenge')actionTimer=setTimeout(()=>hint.classList.remove('show'),1500);
  }
  function closeDrawer(){
    if(!drawer)return;
    drawer.hidden=true;$('drawerScrim').hidden=true;
    const previous=drawer.id;drawer=null;
    $(previous==='refugeDrawer'?'openRefuge':'openLoot')?.focus({preventScroll:true});
  }
  function openDrawer(id){
    closeTools();closeDrawer();drawer=$(id);if(!drawer)return;
    drawer.hidden=false;$('drawerScrim').hidden=false;
    drawer.querySelector('.close-button')?.focus({preventScroll:true});
  }
  function closeTools(){
    $('mapToolsPanel').hidden=true;
    $('mapMenuToggle').setAttribute('aria-expanded','false');
    $('mapMenuChevron').textContent='▾';
  }
  function toggleTools(){
    const opening=$('mapToolsPanel').hidden;
    if(opening)closeDrawer();
    $('mapToolsPanel').hidden=!opening;
    $('mapMenuToggle').setAttribute('aria-expanded',String(opening));
    $('mapMenuChevron').textContent=opening?'▴':'▾';
  }
  function init(){
    $('openLoot').addEventListener('click',()=>openDrawer('lootDrawer'));
    $('openRefuge').addEventListener('click',()=>openDrawer('refugeDrawer'));
    $('drawerScrim').addEventListener('click',closeDrawer);
    document.querySelectorAll('[data-close-drawer]').forEach(el=>el.addEventListener('click',closeDrawer));
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){closeDrawer();closeTools()}});
    $('editSafeZone').addEventListener('click',closeDrawer);
    $('mapMenuToggle').addEventListener('click',toggleTools);
    document.addEventListener('pointerdown',ev=>{if(!$('mapTools').contains(ev.target))closeTools()});
    for(const id of ['gpsMode','demoMode','recenter','zoomIn','zoomOut'])$(id).addEventListener('click',closeTools);
    $('zoomIn').addEventListener('click',()=>{let m=window.DEAD_EARTH_MAP;if(m){m.zoom=Math.min(18,m.zoom+.7);m.queueDraw()}});
    $('zoomOut').addEventListener('click',()=>{let m=window.DEAD_EARTH_MAP;if(m){m.zoom=Math.max(13.5,m.zoom-.7);m.queueDraw()}});
    window.addEventListener('de:render',e=>renderMini(e.detail));
    window.addEventListener('de:action',e=>characterAction(e.detail.type));
    window.addEventListener('de:poi',()=>openDrawer('lootDrawer'));
    window.addEventListener('de:tab',()=>{closeDrawer();closeTools()});
    window.addEventListener('de:message',e=>{if(/neutralisé|zombie|Horde/i.test(e.detail.message))characterAction('hurt')});
    renderMini(snapshot());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
