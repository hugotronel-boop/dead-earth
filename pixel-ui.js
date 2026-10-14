/* DEAD EARTH UI PIXEL : skin jouable et lien avec le moteur GPS/survie. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const ICONS=['bandage','ammo','food','parts','wood','cloth','water','metal','medkit'];
  let animTimer=null,actionTimer=null,toastTimer=null;
  let drawer=null;
  function snapshot(){return window.DEAD_EARTH_SNAPSHOT?.()||null}
  function renderMini(s){
    if(!s)return;
    $('miniHpBar').style.width=s.hp+'%';$('miniEnergyBar').style.width=s.energy+'%';
    $('stealthMini').textContent=(100-s.noise)+'%';$('capacityMini').textContent=s.capacity.toFixed(1)+'/30';
    $('miniInventory').innerHTML=ICONS.map(id=>`<div class="mini-slot"><img src="assets/item-${id}.png" alt=""><em>${s.inventory[id]||0}</em></div>`).join('');
    const remain=Math.max(0,s.dailyRemaining);
    $('remoteCount').textContent=remain+'/2 À DISTANCE';
    $('openLoot').disabled=false;
    $('gpsMode').classList.toggle('selected',s.mode==='gps');$('demoMode').classList.toggle('selected',s.mode!=='gps');
    $('drawingControls').hidden=!s.drawing;
  }
  function characterAction(type){
    const hero=document.querySelector('.survivor-figure');
    const hint=$('heroAction');
    const allowed=['idle','walk','run','scavenge','eat','drink','rest','hurt','heal'];
    if(!allowed.includes(type))type='idle';
    clearTimeout(animTimer);clearTimeout(actionTimer);
    hero.classList.remove('walk','run','scavenge','eat','drink','hurt');
    hero.classList.add(type==='rest'?'idle':type==='heal'?'idle':type);
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
    const focus=$('openLoot');drawer=null;
    focus?.focus({preventScroll:true});
  }
  function openDrawer(id){
    closeDrawer();drawer=$(id);if(!drawer)return;
    drawer.hidden=false;$('drawerScrim').hidden=false;
    drawer.querySelector('.close-button')?.focus({preventScroll:true});
  }
  function init(){
    $('openLoot').addEventListener('click',()=>openDrawer('lootDrawer'));
    $('openRefuge').addEventListener('click',()=>openDrawer('refugeDrawer'));
    $('portraitPanel').addEventListener('click',()=>document.querySelector('[data-tab="survivor"]').click());
    $('inventoryPanel').addEventListener('click',()=>document.querySelector('[data-tab="inventory"]').click());
    $('drawerScrim').addEventListener('click',closeDrawer);
    document.querySelectorAll('[data-close-drawer]').forEach(el=>el.addEventListener('click',closeDrawer));
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeDrawer()});
    $('editSafeZone').addEventListener('click',closeDrawer);
    $('drawingUndo').addEventListener('click',()=>$('undoSafePoint').click());
    $('drawingDone').addEventListener('click',()=>$('finishSafeZone').click());
    $('drawingCancel').addEventListener('click',()=>$('cancelSafeZone').click());
    // The drawing engine updates DOM.hidden rather than re-rendering all sections.
    const observer=new MutationObserver(()=>{$('drawingControls').hidden=$('finishSafeZone').hidden});
    observer.observe($('finishSafeZone'),{attributes:true,attributeFilter:['hidden']});
    $('zoomIn').addEventListener('click',()=>{let m=window.DEAD_EARTH_MAP;if(m){m.zoom=Math.min(18,m.zoom+.7);m.queueDraw()}});
    $('zoomOut').addEventListener('click',()=>{let m=window.DEAD_EARTH_MAP;if(m){m.zoom=Math.max(13.5,m.zoom-.7);m.queueDraw()}});
    window.addEventListener('de:render',e=>renderMini(e.detail));
    window.addEventListener('de:action',e=>characterAction(e.detail.type));
    window.addEventListener('de:poi',()=>openDrawer('lootDrawer'));
    window.addEventListener('de:tab',()=>closeDrawer());
    window.addEventListener('de:message',e=>{
      const msg=e.detail.message;
      if(/neutralisé|zombie|Horde/i.test(msg))characterAction('hurt');
    });
    renderMini(snapshot());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
