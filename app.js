/* DEAD EARTH — prototype jouable, sans backend, données GPS conservées localement. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (n, a = 0, b = 100) => Math.min(b, Math.max(a, n));
  const random = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = arr => arr[random(0, arr.length - 1)];
  const safe = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const DEFAULT_CENTER = [48.8566, 2.3522]; // Démo fictive centrée sur Paris ; jamais une adresse personnelle.
  const STORAGE_KEY = 'dead-earth-alpha-v1';
  const ITEMS = {
    water:{label:'Eau potable',icon:'◉',weight:.5},food:{label:'Conserve',icon:'▣',weight:.4},bandage:{label:'Bandage',icon:'✚',weight:.1},
    wood:{label:'Bois',icon:'▥',weight:1.2},metal:{label:'Ferraille',icon:'⚙',weight:.8},cloth:{label:'Tissu',icon:'▤',weight:.2},
    ammo:{label:'Munitions',icon:'✧',weight:.04},parts:{label:'Pièces',icon:'⌘',weight:.25},medkit:{label:'Trousse de secours',icon:'✛',weight:1.1}
  };
  const RECIPES = [
    {id:'bandage',name:'Bandage',cost:{cloth:2},gain:{bandage:1},desc:'Soigne 30 points de vie.'},
    {id:'medkit',name:'Trousse de secours',cost:{cloth:3,bandage:2,parts:1},gain:{medkit:1},desc:'Soigne 70 points de vie.'},
    {id:'ammo',name:'Munitions de fortune',cost:{metal:2,parts:1},gain:{ammo:4},desc:'Équipement fictif pour les combats.'}
  ];
  const UPGRADES = [
    {id:'walls',name:'Renforcer les barricades',cost:{wood:3,metal:2},desc:'+25 résistance au refuge',effect:s=>s.fort=clamp(s.fort+25)},
    {id:'workshop',name:'Améliorer l’atelier',cost:{wood:4,parts:2},desc:'+1 niveau de base',effect:s=>s.baseLevel++},
    {id:'generator',name:'Installer un générateur',cost:{metal:4,parts:3},desc:'-10 menace immédiate',effect:s=>s.threat=clamp(s.threat-10)}
  ];
  const ZOMBIES = [
    {name:'Rôdeur',hp:30,damage:[5,13],xp:18},
    {name:'Coureur',hp:42,damage:[8,17],xp:26},
    {name:'Hurleur',hp:36,damage:[5,12],xp:24}
  ];
  const LOCATIONS = [
    {id:'market',name:'Supérette abandonnée',type:'Supermarché',symbol:'▣',dx:.006,dy:.004,danger:25,loot:['food','water','cloth']},
    {id:'pharmacy',name:'Pharmacie de quartier',type:'Pharmacie',symbol:'✚',dx:-.004,dy:.005,danger:38,loot:['bandage','cloth','medkit']},
    {id:'workshop',name:'Dépôt de bricolage',type:'Bricolage',symbol:'⚙',dx:.007,dy:-.004,danger:42,loot:['wood','metal','parts']},
    {id:'forest',name:'Lisière boisée',type:'Nature',symbol:'♣',dx:-.006,dy:-.004,danger:33,loot:['wood','cloth','water']},
    {id:'warehouse',name:'Entrepôt désaffecté',type:'Entrepôt',symbol:'▥',dx:.012,dy:.008,danger:71,loot:['metal','parts','ammo']},
    {id:'station',name:'Station-service vide',type:'Station',symbol:'◈',dx:-.010,dy:.008,danger:51,loot:['water','food','parts']}
  ];
  const missions = [
    {id:'first',name:'Première expédition',desc:'Fouille une zone de ravitaillement.',target:1,progress:s=>s.totalSearches,reward:{wood:2,food:1},xp:40},
    {id:'supplies',name:'Collecteur de provisions',desc:'Termine 4 fouilles.',target:4,progress:s=>s.totalSearches,reward:{water:2,bandage:1},xp:70},
    {id:'repair',name:'Notre dernière forteresse',desc:'Améliore ton refuge deux fois.',target:2,progress:s=>s.totalUpgrades,reward:{metal:2,parts:2},xp:80},
    {id:'fighter',name:'Éliminer la menace',desc:'Vaincs deux zombies.',target:2,progress:s=>s.kills,reward:{bandage:2,ammo:4},xp:90}
  ];
  const fresh = () => ({version:1,created:Date.now(),mode:'demo',lat:null,lon:null,hp:100,energy:100,water:86,food:80,xp:0,
    level:1,baseLevel:1,fort:25,threat:14,noise:0,selected:'market',searchMethod:'quiet',totalSearches:0,totalUpgrades:0,kills:0,
    inventory:{water:3,food:3,bandage:2,wood:4,metal:3,cloth:2,ammo:5,parts:2,medkit:0},
    claimed:[],cooldowns:{},logs:[{time:Date.now(),message:'Transmission reçue. Bienvenue dans DEAD EARTH.'}]});
  function load(){
    try {
      const obj=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!obj || obj.version!==1 || !obj.inventory || !Array.isArray(obj.logs))return fresh();
      const base=fresh();
      return {...base,...obj,inventory:{...base.inventory,...obj.inventory},claimed:Array.isArray(obj.claimed)?obj.claimed:[],cooldowns:obj.cooldowns||{},logs:obj.logs.slice(0,55),
        mode:'demo',lat:null,lon:null}; // Ne pas persister ni restaurer les coordonnées GPS exactes.
    } catch {return fresh();}
  }
  let game=load();
  let center=[...DEFAULT_CENTER];
  let pois=[];
  let map=null,markers=[],playerMarker=null,selectedMarker=null,gpsWatch=null,combat=null,sound=false,currentTab='map',toastTimer=null;
  let selectedMethod='quiet';
  const METHODS={quiet:{name:'Discrète',time:60,risk:0,noise:4,bonus:0,energy:10},normal:{name:'Normale',time:30,risk:12,noise:15,bonus:1,energy:15},fast:{name:'Brutale',time:10,risk:27,noise:32,bonus:2,energy:22}};
  function log(msg){game.logs.unshift({time:Date.now(),message:msg});game.logs=game.logs.slice(0,55);}
  function save(){
    try{const copy={...game,lat:null,lon:null,mode:'demo'}; localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));}catch{ /* Local storage disabled: session still playable. */ }
  }
  function commit(msg){if(msg)log(msg);save();renderAll();if(msg)toast(msg);}
  function toast(msg){const node=$('toast');node.textContent=msg;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3900);}
  function xpGain(n){game.xp+=n;while(game.xp>=game.level*100){game.xp-=game.level*100;game.level++;game.hp=clamp(game.hp+10);log(`Niveau ${game.level} atteint ! +10 santé.`);}}
  function inventoryWeight(){return Object.entries(game.inventory).reduce((total,[id,qty])=>total+(ITEMS[id]?.weight||0)*qty,0)}
  const quantity = id => Math.max(0,Number(game.inventory[id])||0);
  function canPay(cost){return Object.entries(cost).every(([key,val])=>quantity(key)>=val)}
  function pay(cost){if(!canPay(cost))return false;Object.entries(cost).forEach(([key,val])=>game.inventory[key]-=val);return true}
  function takeLoot(items){
    const acquired=[];
    for(const [id,qty] of Object.entries(items)){
      const room=Math.max(0,30-inventoryWeight());
      const fit=Math.max(0,Math.min(qty,Math.floor((room+0.000001)/ITEMS[id].weight)));
      if(fit){game.inventory[id]=(game.inventory[id]||0)+fit;acquired.push(`${fit} ${ITEMS[id].label}`)}
    }
    return acquired;
  }
  function getPoiList(lat,lon){return LOCATIONS.map((p,i)=>({...p,lat:lat+p.dy,lon:lon+p.dx,id:`sim-${p.id}`,source:'simulation',danger:p.danger+(i%2)*4}));}
  function distanceM(a,b,c,d){
    const rad=Math.PI/180,R=6371000,dLat=(c-a)*rad,dLon=(d-b)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dLon/2)**2;
    return R*2*Math.asin(Math.sqrt(x));
  }
  function danger(){const p=pois.find(p=>p.id===game.selected);return clamp(game.threat+(p?p.danger:30)*.47+game.noise*.35)}
  function renderHud(){
    $('hudHp').innerHTML=`${game.hp} <small>/ 100</small>`;$('hpBar').style.width=`${game.hp}%`;
    $('hudEnergy').innerHTML=`${game.energy} <small>/ 100</small>`;$('energyBar').style.width=`${game.energy}%`;
    $('hudWater').innerHTML=`${game.water} <small>/ 100</small>`;$('waterBar').style.width=`${game.water}%`;
    $('hudLevel').textContent=`NIV. ${String(game.level).padStart(2,'0')}`;
    $('xpBar').style.width=`${game.xp/game.level}%`;
    $('day').textContent=String(1+Math.floor((Date.now()-game.created)/86400000)).padStart(2,'0');
    const t=Math.round(danger());$('sidebarThreat').textContent=`${t}%`;$('sidebarThreatBar').style.width=`${t}%`;
    $('sidebarThreatText').textContent=t>70?'Activité critique : risque élevé de rencontre.':t>40?'Mouvements hostiles détectés dans le secteur.':'Faible activité des infectés.';
    $('connection').textContent=game.mode==='gps'?'GPS ACTIF':'MODE DÉMO';
    $('mapModeLabel').textContent=game.mode==='gps'?'MODE GPS · POSITION PRIVÉE':'ZONE SIMULÉE · DÉMO';
    $('mapCoords').textContent=game.mode==='gps'?'POSITION MASQUÉE':'SECTEUR FICTIF 01';
    $('survivorStatus').textContent=game.hp>60?'OPÉRATIONNEL':game.hp>25?'BLESSÉ':'CRITIQUE';
    $('latestLog').textContent=game.logs[0]?.message||'Fréquence de survie active.';
    $('demoMode').classList.toggle('selected',game.mode==='demo');
    $('gpsMode').classList.toggle('selected',game.mode==='gps');
  }
  function renderPois(){
    $('poiCount').textContent=String(pois.length).padStart(2,'0');
    $('poiCounter').textContent=`${String(pois.length).padStart(2,'0')} ACTIFS`;
    $('poiList').innerHTML=pois.map(p=>{
      const cd=Math.max(0,Math.ceil(((game.cooldowns[p.id]||0)-Date.now())/60000));
      const detail=game.mode==='gps'&&game.lat!==null?`${Math.round(distanceM(game.lat,game.lon,p.lat,p.lon))} m · `:'';
      return `<button class="poi-card ${game.selected===p.id?'active':''}" data-poi="${safe(p.id)}"><span class="poi-symbol">${p.symbol}</span><span><b>${safe(p.name)}</b><small>${detail}${cd?`Disponible dans ${cd} min`:safe(p.type)}</small></span><span class="poi-danger">${p.danger}%</span></button>`;
    }).join('');
    const p=pois.find(p=>p.id===game.selected)||pois[0];
    if(!p){$('targetCard').innerHTML='<p>Aucun lieu disponible. Reviens en mode démo.</p>';return;}
    const cd=Math.max(0,Math.ceil(((game.cooldowns[p.id]||0)-Date.now())/60000));
    const dist=game.mode==='gps'&&game.lat!==null?Math.round(distanceM(game.lat,game.lon,p.lat,p.lon))+' m':'Expédition virtuelle';
    $('targetCard').innerHTML=`<div class="target-eyebrow">/ LIEU SÉLECTIONNÉ · ${safe(p.type)}</div>
      <h3>${safe(p.name)}</h3><p>Ravitaillement virtuel. Les bâtiments réels ne doivent pas être visités pour jouer.</p>
      <div class="target-info"><span>MENACE : ${p.danger}%</span><span>${dist}</span></div>
      <div class="search-options">${Object.entries(METHODS).map(([id,m])=>`<button type="button" data-method="${id}" class="${selectedMethod===id?'active':''}">${m.name}<br><small>⚡ ${m.energy}</small></button>`).join('')}</div>
      <button id="searchBtn" class="btn accent" ${cd||game.energy<METHODS[selectedMethod].energy||game.hp===0?'disabled':''}>${cd?`↻ RAVITAILLEMENT · ${cd} MIN`:'⌕ LANCER LA FOUILLE'}</button>
      <p class="hint">${game.mode==='gps'?'GPS = exploration géographique. La fouille se fait virtuellement.':'En mode démo, toutes les zones sont fictives.'}</p>`;
    $('targetCard').querySelectorAll('[data-method]').forEach(el=>el.addEventListener('click',()=>{selectedMethod=el.dataset.method;renderPois()}));
    $('searchBtn').addEventListener('click',searchPoi);
    $('poiList').querySelectorAll('[data-poi]').forEach(el=>el.addEventListener('click',()=>{
      game.selected=el.dataset.poi;save();renderPois();renderHud();refreshMarkers();
      const selected=pois.find(p=>p.id===game.selected);if(map&&selected)map.panTo([selected.lat,selected.lon]);
    }));
  }
  function searchPoi(){
    if(combat)return;
    const p=pois.find(p=>p.id===game.selected);if(!p)return;
    if((game.cooldowns[p.id]||0)>Date.now())return toast('Ce lieu a besoin de se ravitailler.');
    const m=METHODS[selectedMethod];if(game.energy<m.energy)return toast('Endurance insuffisante : repose-toi.');
    if(game.hp===0)return toast('Tu dois d’abord récupérer au refuge.');
    game.energy=clamp(game.energy-m.energy);game.water=clamp(game.water-2);game.food=clamp(game.food-2);
    game.noise=clamp(game.noise+m.noise);game.threat=clamp(game.threat+Math.round(m.noise*.25));
    game.totalSearches++;
    game.cooldowns[p.id]=Date.now()+90000; // 90 s réel, et non une attente imposée pour le joueur.
    const amount=1+m.bonus+random(0,2),loot={};for(let i=0;i<amount;i++){let id=pick(p.loot);loot[id]=(loot[id]||0)+1;}
    const found=takeLoot(loot);xpGain(12+(p.danger>>3));
    const risk=clamp(8+p.danger*.45+m.risk+game.noise*.16,0,85);
    log(`Fouille ${m.name.toLowerCase()} · ${p.name} : ${found.length?found.join(', '):'sac plein'}.`);
    if(Math.random()*100<risk){save();renderAll();startCombat(p)}
    else{game.threat=clamp(game.threat-4);commit(`Fouille réussie ! ${found.length?found.join(', '):'Sac à dos plein.'}`)}
  }
  function startCombat(p){
    const tier=p?.danger||35;
    const z={...ZOMBIES[tier>65?random(0,2):random(0,1)]};
    z.hp+=Math.floor(game.level*.9);z.maxHp=z.hp;
    combat={z,guard:false,round:0};
    if(sound)beep(110,.13);
    if(navigator.vibrate)navigator.vibrate([90,60,130]);
    log(`Alerte ! ${z.name} repéré près de ${p?.name||'la base'}.`);save();showCombat();
  }
  function modal({tag,title,text,content='',actions=[]}){
    $('modalTag').textContent=tag;$('modalTitle').textContent=title;$('modalText').textContent=text;
    $('modalContent').innerHTML=content;$('modalActions').innerHTML='';
    actions.forEach(({name,fn,alt=false})=>{const b=document.createElement('button');b.className=`btn ${alt?'outlined':''}`;b.textContent=name;b.onclick=fn;$('modalActions').appendChild(b)});
    $('modal').hidden=false;document.body.classList.add('modal-open');
  }
  function closeModal(){if(combat)return;$('modal').hidden=true;document.body.classList.remove('modal-open')}
  function showCombat(note='Un infecté bloque ton chemin. Que fais-tu ?'){
    if(!combat)return;
    const z=combat.z;
    modal({tag:'⚠ CONTACT HOSTILE',title:`${z.name.toUpperCase()} DÉTECTÉ`,text:note,
      content:`<div class="combat-meter"><div><b>☣ ${z.name}</b><strong>${Math.max(0,z.hp)} / ${z.maxHp} PV</strong></div><div class="progress"><div style="width:${100*clamp(z.hp,0,z.maxHp)/z.maxHp}%"></div></div></div><div class="target-info"><span>♥ Tes PV : ${game.hp}</span><span>ϟ Endurance : ${game.energy}</span><span>✧ Munitions : ${quantity('ammo')}</span></div>`,
      actions:[{name:'⚔ ATTAQUER',fn:()=>combatAction('attack')},{name:'✧ TIRER',fn:()=>combatAction('shoot')},{name:'◈ ESQUIVER',fn:()=>combatAction('dodge'),alt:true},{name:'↗ FUIR',fn:()=>combatAction('flee'),alt:true}]
    });
  }
  function combatAction(action){
    if(!combat)return;const z=combat.z;let note='';
    if(action==='attack'){
      if(game.energy<8){showCombat('Tu es trop épuisé pour attaquer. Tente de fuir.');return;}
      game.energy-=8;const dmg=random(10,20)+Math.floor(game.level*.9);z.hp-=dmg;game.noise=clamp(game.noise+6);
      note=`Tu frappes le ${z.name.toLowerCase()} et infliges ${dmg} dégâts.`;
    }else if(action==='shoot'){
      if(quantity('ammo')===0){showCombat('Tu n’as plus de munitions.');return;}
      game.inventory.ammo--;const dmg=random(24,38)+Math.floor(game.level*.8);z.hp-=dmg;
      game.noise=clamp(game.noise+30);game.threat=clamp(game.threat+12);note=`Coup de feu ! ${dmg} dégâts. Le bruit attire les infectés.`;
    }else if(action==='dodge'){
      if(game.energy<8){showCombat('Pas assez d’endurance pour esquiver.');return;}
      game.energy-=8;combat.guard=true;note='Tu anticipes son attaque et réduis les dégâts.';
    }else if(action==='flee'){
      if(game.energy>=5&&Math.random()<(game.energy>20?.82:.6)){
        game.energy=clamp(game.energy-5);game.threat=clamp(game.threat+3);combat=null;closeModal();commit('Tu as réussi à fuir le combat.');return;
      }game.energy=clamp(game.energy-5);note='La fuite échoue. Le zombie t’atteint !';
    }
    if(z.hp<=0){game.kills++;xpGain(z.xp);game.threat=clamp(game.threat-8);combat=null;closeModal();commit(`☠ ${z.name} neutralisé ! +${z.xp} XP.`);return;}
    combat.round++;
    const raw=random(...z.damage);const hit=combat.guard?Math.ceil(raw*.25):raw;combat.guard=false;
    game.hp=clamp(game.hp-hit);note+=` ${z.name} t’inflige ${hit} dégâts.`;
    if(game.hp<=0){
      combat=null;game.hp=55;game.energy=40;game.water=clamp(game.water-12);game.food=clamp(game.food-10);
      const loss=Math.min(quantity('food'),1);game.inventory.food-=loss;
      save();renderAll();modal({tag:'ÉVACUATION',title:'TU AS SURVÉCU...',text:'Tu as été ramené au refuge. Une partie de tes ressources a été perdue, mais ta progression est conservée.',actions:[{name:'RETOUR AU REFUGE',fn:()=>{closeModal();switchTab('base')}}]});return;
    }
    save();renderAll();showCombat(note);
  }
  function renderSurvivor(){
    const rows=[['Niveau',game.level],['Expérience',`${game.xp} / ${game.level*100}`],['Satiété',`${game.food}%`],['Hydratation',`${game.water}%`],['Bruit',`${game.noise}%`],['Zombies éliminés',game.kills],['Fouilles terminées',game.totalSearches],['Mode',game.mode==='gps'?'GPS · hybride':'Démo · hybride']];
    $('survivorStats').innerHTML=rows.map(([name,value])=>`<div class="info-line"><span>${name}</span><strong>${safe(value)}</strong></div>`).join('');
    $('eatBtn').disabled=quantity('food')===0||game.food>=100;
    $('drinkBtn').disabled=quantity('water')===0||game.water>=100;
    $('healBtn').disabled=quantity('bandage')===0||game.hp>=100;
    $('restBtn').disabled=game.energy>=100;
  }
  function useItem(id,prop,points,msg){
    if(quantity(id)<1||game[prop]>=100)return;
    game.inventory[id]--;game[prop]=clamp(game[prop]+points);commit(msg);
  }
  function rest(){game.energy=clamp(game.energy+45);game.noise=clamp(game.noise-20);game.threat=clamp(game.threat-8);game.food=clamp(game.food-4);game.water=clamp(game.water-4);commit('Repos au refuge : +45 endurance.');}
  function costText(cost){return Object.entries(cost).map(([id,num])=>`${num} ${ITEMS[id].label}`).join(' · ')}
  function renderBase(){
    $('baseLevel').textContent=game.baseLevel;$('fortValue').textContent=`${game.fort} / 100`;$('fortBar').style.width=`${game.fort}%`;
    $('upgradeList').innerHTML=UPGRADES.map(u=>`<div class="upgrade-card"><div><strong>${safe(u.name)}</strong><p>${safe(u.desc)}</p><p>${safe(costText(u.cost))}</p></div><button class="btn outlined" data-upgrade="${u.id}" ${canPay(u.cost)?'':'disabled'}>AMÉLIORER</button></div>`).join('');
    $('upgradeList').querySelectorAll('[data-upgrade]').forEach(el=>el.addEventListener('click',()=>{
      const u=UPGRADES.find(u=>u.id===el.dataset.upgrade);if(!u||!pay(u.cost))return;
      u.effect(game);game.totalUpgrades++;xpGain(30);commit(`${u.name} : amélioration terminée.`);
    }));
  }
  function defendBase(){
    const horde=random(8,20),power=Math.round(game.fort*.65+game.baseLevel*8+random(0,30));
    const damage=clamp(Math.round(horde*2.5-power*.25),3,50);
    game.fort=clamp(game.fort-damage);game.threat=clamp(game.threat+8);game.energy=clamp(game.energy-12);
    const success=game.fort>0;xpGain(success?35:12);
    commit(`Horde de ${horde} infectés : barricades -${damage}, ${success?'refuge défendu !':'défenses détruites !'}`);
    modal({tag:'RAPPORT DE DÉFENSE',title:success?'REFUGE DÉFENDU':'BARRICADES ROMPUES',text:`${horde} infectés ont frappé ton refuge virtuel. Résistance restante : ${game.fort}/100. Cette simulation est déclenchée uniquement à ta demande.`,actions:[{name:'CONTINUER',fn:closeModal}]});
  }
  function renderInventory(){
    $('capacityText').textContent=`${inventoryWeight().toFixed(1)} / 30 KG`;
    $('capacityBar').style.width=`${Math.min(100,inventoryWeight()/30*100)}%`;
    $('inventoryGrid').innerHTML=Object.entries(ITEMS).map(([id,item])=>`<div class="item-card ${quantity(id)===0?'empty':''}"><div class="item-symbol">${item.icon}</div><b>${safe(item.label)}</b><small>× ${quantity(id)} · ${item.weight} kg/u.</small></div>`).join('');
    $('craftList').innerHTML=RECIPES.map(r=>`<div class="upgrade-card"><div><strong>${safe(r.name)}</strong><p>${safe(r.desc)}</p><p>${safe(costText(r.cost))}</p></div><button class="btn outlined" data-craft="${r.id}" ${canPay(r.cost)&&inventoryWeight()+Object.entries(r.gain).reduce((a,[id,n])=>a+ITEMS[id].weight*n,0)<=30?'':'disabled'}>FABRIQUER</button></div>`).join('');
    $('craftList').querySelectorAll('[data-craft]').forEach(el=>el.addEventListener('click',()=>{
      const r=RECIPES.find(r=>r.id===el.dataset.craft);if(!r||!canPay(r.cost))return;
      // Poids final vérifié avant de consommer les ingrédients.
      const gained=Object.entries(r.gain).reduce((a,[id,n])=>a+ITEMS[id].weight*n,0);
      const spent=Object.entries(r.cost).reduce((a,[id,n])=>a+ITEMS[id].weight*n,0);
      if(inventoryWeight()-spent+gained>30)return toast('Le sac est trop lourd.');
      pay(r.cost);for(const [id,num] of Object.entries(r.gain))game.inventory[id]+=num;
      xpGain(10);commit(`${r.name} fabriqué !`);
    }));
  }
  function renderMissions(){
    $('missionList').innerHTML=missions.map(m=>{
      const current=clamp(m.progress(game),0,m.target),done=game.claimed.includes(m.id);
      return `<div class="mission-card"><div class="mission-card-head"><strong>${safe(m.name)}</strong><small>${current} / ${m.target}</small></div><p>${safe(m.desc)}</p><p>Récompense : ${safe(costText(m.reward))} · ${m.xp} XP</p><div class="progress"><div style="width:${100*current/m.target}%"></div></div><button class="btn outlined" data-mission="${m.id}" ${current<m.target||done?'disabled':''}>${done?'TERMINÉE':current>=m.target?'RÉCUPÉRER':'EN COURS'}</button></div>`;
    }).join('');
    $('missionList').querySelectorAll('[data-mission]').forEach(el=>el.addEventListener('click',()=>{
      const m=missions.find(m=>m.id===el.dataset.mission);if(!m||game.claimed.includes(m.id)||m.progress(game)<m.target)return;
      game.claimed.push(m.id);const acquired=takeLoot(m.reward);xpGain(m.xp);commit(`Mission « ${m.name} » accomplie. ${acquired.join(', ')||'Sac trop plein pour les ressources.'}`);
    }));
    $('journal').innerHTML=game.logs.map(e=>`<div class="log-entry"><time>${new Date(e.time).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</time><span>${safe(e.message)}</span></div>`).join('');
  }
  function renderAll(){renderHud();renderPois();renderSurvivor();renderBase();renderInventory();renderMissions();}
  function switchTab(tab){currentTab=tab;document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===`page-${tab}`));if(tab==='map'&&map)setTimeout(()=>map.invalidateSize(),150);window.scrollTo({top:0,behavior:'instant'});}
  function createIcon(symbol,kind='',selected=false){return window.L.divIcon({className:'',iconAnchor:[17,31],html:`<div class="map-pin ${kind} ${selected?'selected':''}"><span>${symbol}</span></div>`});}
  function createMap(){
    if(!window.L){$('mapFallback').hidden=false;return;}
    try{
      map=L.map('map',{zoomControl:false,scrollWheelZoom:false}).setView(center,14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).on('tileerror',()=>{$('mapFallback').hidden=false;}).addTo(map);
      L.control.zoom({position:'bottomright'}).addTo(map);
      refreshMarkers();
    }catch(e){$('mapFallback').hidden=false;console.warn('Carte non disponible:',e);}
  }
  function refreshMarkers(){
    if(!map||!window.L)return;
    for(const m of markers)map.removeLayer(m);markers=[];
    if(playerMarker)map.removeLayer(playerMarker);
    playerMarker=L.marker(center,{icon:createIcon('⌂','home')}).addTo(map).bindPopup('Refuge virtuel · coordonnées privées');
    for(const p of pois){const marker=L.marker([p.lat,p.lon],{icon:createIcon(p.symbol,'',p.id===game.selected)}).addTo(map);
      marker.on('click',()=>{game.selected=p.id;save();renderPois();renderHud();refreshMarkers()});
      marker.bindTooltip(p.name);markers.push(marker);
    }
    for(let i=0;i<4;i++){
      const off=[[-.003,.008],[.008,-.003],[.009,.010],[-.008,-.008]][i];
      markers.push(L.marker([center[0]+off[0],center[1]+off[1]],{icon:createIcon('☣','zombie')}).addTo(map).bindTooltip('Zone infectée · simulation'));
    }
  }
  function setDemo(){
    if(gpsWatch!==null){navigator.geolocation?.clearWatch(gpsWatch);gpsWatch=null;}
    game.mode='demo';game.lat=null;game.lon=null;center=[...DEFAULT_CENTER];pois=getPoiList(...center);
    if(!pois.some(p=>p.id===game.selected))game.selected=pois[0].id;
    if(map){map.setView(center,14);refreshMarkers()};commit('Mode démo activé : zone totalement fictive.');
  }
  function setGPS(){
    if(!navigator.geolocation){toast('GPS indisponible dans ce navigateur.');return;}
    if(!window.isSecureContext){toast('GPS : utilise une connexion HTTPS.');return;}
    toast('Demande de localisation : ton adresse ne sera pas sauvegardée.');
    if(gpsWatch!==null)navigator.geolocation.clearWatch(gpsWatch);
    gpsWatch=navigator.geolocation.watchPosition(pos=>{
      const lat=pos.coords.latitude,lon=pos.coords.longitude;
      if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
      const moved=game.lat===null||distanceM(lat,lon,game.lat,game.lon)>90;
      game.mode='gps';game.lat=lat;game.lon=lon;center=[lat,lon];
      if(moved){pois=getPoiList(lat,lon);game.selected=pois[0].id;if(map){map.setView(center,14);refreshMarkers()}}
      // Seules des zones *simulées autour du GPS* sont proposées dans l'alpha.
      save();renderAll();
    },err=>{const msg=err.code===1?'Autorisation GPS refusée.': 'Position GPS indisponible.';toast(`${msg} Mode démo conservé.`);setDemo();},
    {enableHighAccuracy:false,maximumAge:60000,timeout:12000});
  }
  function beep(freq,duration){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sawtooth';osc.frequency.value=freq;gain.gain.setValueAtTime(.05,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);osc.onended=()=>ctx.close();}catch{}}
  function init(){
    pois=getPoiList(...center);if(!pois.some(p=>p.id===game.selected))game.selected=pois[0].id;
    renderAll();createMap();
    document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
    $('demoMode').addEventListener('click',setDemo);$('gpsMode').addEventListener('click',setGPS);
    $('recenter').addEventListener('click',()=>{if(map)map.setView(center,14);else toast('Carte indisponible. La liste des lieux reste utilisable.')});
    $('eatBtn').addEventListener('click',()=>useItem('food','food',30,'Conserve consommée. +30 satiété.'));
    $('drinkBtn').addEventListener('click',()=>useItem('water','water',30,'Eau consommée. +30 hydratation.'));
    $('healBtn').addEventListener('click',()=>useItem('bandage','hp',30,'Bandage utilisé. +30 santé.'));
    $('restBtn').addEventListener('click',rest);$('defendBtn').addEventListener('click',defendBase);
    $('viewJournal').addEventListener('click',()=>switchTab('missions'));
    $('soundToggle').addEventListener('click',()=>{sound=!sound;$('soundToggle').textContent=sound?'♫':'♪';$('soundToggle').setAttribute('aria-label',sound?'Désactiver le son':'Activer le son');toast(sound?'Son activé.':'Son désactivé.')});
    $('resetBtn').addEventListener('click',()=>modal({tag:'RÉINITIALISATION',title:'RECOMMENCER ?',text:'Cette action efface ta progression locale. Tu pourras continuer à jouer en mode démo.',actions:[{name:'ANNULER',fn:closeModal,alt:true},{name:'EFFACER LA PARTIE',fn:()=>{closeModal();game=fresh();selectedMethod='quiet';setDemo();switchTab('map');}}]}));
    $('modal').addEventListener('click',e=>{if(e.target===$('modal')&&!combat)closeModal()});
    window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!combat)closeModal()});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')renderAll()});
    if('serviceWorker' in navigator && window.isSecureContext)navigator.serviceWorker.register('./sw.js').catch(()=>{});
    toast('Transmission ouverte. Prêt pour ta première expédition !');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
