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
  const DAILY_REMOTE_LIMIT = 2;
  const GPS_RANGE_METERS = 120;
  const SAFE_SIDE_M = 20;  // Le refuge est toujours un carré fixe de 400 m².
  const SAFE_RELOCATION_DAYS = 30;
  const SAFE_RELOCATION_MS = SAFE_RELOCATION_DAYS * 24 * 60 * 60 * 1000;
  const POI_RADIUS_M = 2800;
  const MAX_GPS_ACCURACY_M = 120;
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
    dailyRemote:{day:'',used:0},safeZone:null,micEnabled:false,lastMicLevel:null,
    inventory:{water:3,food:3,bandage:2,wood:4,metal:3,cloth:2,ammo:5,parts:2,medkit:0},
    claimed:[],cooldowns:{},logs:[{time:Date.now(),message:'Transmission reçue. Bienvenue dans DEAD EARTH.'}]});
  function load(){
    try {
      const obj=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!obj || obj.version!==1 || !obj.inventory || !Array.isArray(obj.logs))return fresh();
      const base=fresh();
      return {...base,...obj,inventory:{...base.inventory,...obj.inventory},claimed:Array.isArray(obj.claimed)?obj.claimed:[],cooldowns:obj.cooldowns||{},logs:obj.logs.slice(0,55),
        dailyRemote:obj.dailyRemote||base.dailyRemote,safeZone:obj.safeZone||null,micEnabled:!!obj.micEnabled,lastMicLevel:Number.isFinite(obj.lastMicLevel)?obj.lastMicLevel:null,
        mode:'demo',lat:null,lon:null}; // Ne pas persister ni restaurer les coordonnées GPS exactes.
    } catch {return fresh();}
  }
  let game=load();
  window.DEAD_EARTH_SNAPSHOT=()=>({hp:game.hp,energy:game.energy,water:game.water,food:game.food,level:game.level,xp:game.xp,noise:game.noise,inventory:{...game.inventory},mode:game.mode,dailyRemaining:remoteLeft(),capacity:inventoryWeight(),threat:danger(),drawing:safeDrawing});
  let center=game.safeZone?[...game.safeZone.center]:[...DEFAULT_CENTER];
  let pois=[];
  let map=null,gpsWatch=null,combat=null,sound=false,currentTab='map',toastTimer=null;
  let scanBusy=false,scanToken=null,safeDrawing=false,safeDraft=[],safeCandidate=null,gpsAccuracy=Infinity;
  let lastPOIRequest=null,lastPOIRequestAt=0,poiRequestSerial=0,poiLoading=false,poiError='';
  let selectedMethod='quiet';
  const METHODS={quiet:{name:'Discrète',time:60,risk:0,noise:4,bonus:0,energy:10},normal:{name:'Normale',time:30,risk:12,noise:15,bonus:1,energy:15},fast:{name:'Brutale',time:10,risk:27,noise:32,bonus:2,energy:22}};
  function log(msg){game.logs.unshift({time:Date.now(),message:msg});game.logs=game.logs.slice(0,55);}
  function save(){
    try{const copy={...game,lat:null,lon:null,mode:'demo'}; localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));}catch{ /* Local storage disabled: session still playable. */ }
  }
  function commit(msg){if(msg)log(msg);save();renderAll();if(msg)toast(msg);if(msg)window.dispatchEvent(new CustomEvent('de:message',{detail:{message:msg}}));}
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
  // Les jours de jeu sont des jours civils locaux, et non des tranches glissantes de 24 h.
  // En calculant des dates UTC à partir des composants locaux, on évite les décalages d'heure d'été.
  function dayNumber(now=Date.now()){
    const start = new Date(game.created), today = new Date(now);
    if(!Number.isFinite(start.getTime()))return 1;
    const civil = d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
    return Math.max(1,1+Math.round((civil(today)-civil(start))/86400000));
  }
  // Le compteur journalier est fondé sur le jour local du téléphone (alpha hors ligne).
  function localDay(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
  function ensureDaily(){if(!game.dailyRemote || game.dailyRemote.day!==localDay())game.dailyRemote={day:localDay(),used:0}}
  function remoteLeft(){ensureDaily();return Math.max(0,DAILY_REMOTE_LIMIT-game.dailyRemote.used)}
  function isOnSite(p){return game.mode==='gps'&&game.lat!=null&&p.source==='osm'&&gpsAccuracy<=MAX_GPS_ACCURACY_M&&distanceM(game.lat,game.lon,p.lat,p.lon)<=GPS_RANGE_METERS}
  function isRemote(p){return !isOnSite(p)}
  function canSearch(p){return (game.cooldowns[p.id]||0)<=Date.now()&&game.energy>=METHODS[selectedMethod].energy&&game.hp>0&&!scanBusy&&(!isRemote(p)||remoteLeft()>0)}
  // Catégories réelles OpenStreetMap : le butin est évidemment virtuel.
  const POI_TYPES={
    supermarket:{name:'Supermarché',symbol:'▣',loot:['food','water','cloth'],danger:29},
    convenience:{name:'Épicerie',symbol:'▣',loot:['food','water'],danger:24},
    bakery:{name:'Boulangerie',symbol:'▣',loot:['food','water'],danger:22},
    butcher:{name:'Boucherie',symbol:'▣',loot:['food','cloth'],danger:28},
    greengrocer:{name:'Primeur',symbol:'▣',loot:['food','water'],danger:25},
    general:{name:'Commerce général',symbol:'▣',loot:['food','water','cloth'],danger:32},
    grocery:{name:'Épicerie',symbol:'▣',loot:['food','water'],danger:24},
    hardware:{name:'Quincaillerie',symbol:'⚙',loot:['wood','metal','parts'],danger:44},
    doityourself:{name:'Bricolage',symbol:'⚙',loot:['wood','metal','parts'],danger:44},
    car_parts:{name:'Pièces automobiles',symbol:'⚙',loot:['metal','parts'],danger:46},
    outdoor:{name:'Équipement outdoor',symbol:'▣',loot:['cloth','parts','bandage'],danger:39},
    pharmacy:{name:'Pharmacie',symbol:'✚',loot:['bandage','cloth','medkit'],danger:39},
    chemist:{name:'Parapharmacie',symbol:'✚',loot:['bandage','cloth'],danger:30},
    fuel:{name:'Station-service',symbol:'◈',loot:['water','food','parts'],danger:46},
    restaurant:{name:'Restaurant',symbol:'▣',loot:['food','water'],danger:35},
    cafe:{name:'Café',symbol:'▣',loot:['food','water'],danger:30},
    fast_food:{name:'Restauration',symbol:'▣',loot:['food','water'],danger:32},
    hospital:{name:'Hôpital',symbol:'✚',loot:['bandage','medkit','cloth'],danger:64},
    clinic:{name:'Clinique',symbol:'✚',loot:['bandage','medkit'],danger:50}
  };
  async function findRealPoi(lat,lon){
    // Overpass est interrogé seulement après l'autorisation GPS, sans bloquer le fond de carte.
    const serial=++poiRequestSerial;
    const around=`around:${POI_RADIUS_M},${lat},${lon}`;
    const query=`[out:json][timeout:20];(nwr(${around})["shop"~"^(supermarket|convenience|bakery|butcher|greengrocer|general|grocery|hardware|doityourself|car_parts|outdoor|chemist)$"];nwr(${around})["amenity"~"^(pharmacy|fuel|restaurant|cafe|fast_food|hospital|clinic)$"];);out center tags;`;
    const urls=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
    poiLoading=true;poiError='';renderPois();
    for(const server of urls){
      try{
        const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),13500);
        let response;
        try{response=await fetch(server+'?data='+encodeURIComponent(query),{signal:ctl.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timer)}
        if(!response.ok)throw Error('Overpass: '+response.status);
        const data=await response.json();if(serial!==poiRequestSerial||game.mode!=='gps')return;
        const used=new Set();
        const found=(data.elements||[]).map(e=>{
          const t=e.tags||{},key=POI_TYPES[t.shop]?t.shop:POI_TYPES[t.amenity]?t.amenity:null;
          const type=POI_TYPES[key],loc=e.center||e;
          if(!type||!Number.isFinite(loc.lat)||!Number.isFinite(loc.lon))return null;
          const id='osm-'+e.type+'-'+e.id;
          if(used.has(id))return null;used.add(id);
          return{id,name:(t.name||type.name).slice(0,65),type:type.name,symbol:type.symbol,lat:loc.lat,lon:loc.lon,
            danger:clamp(type.danger+(Number(e.id)%13),12,80),loot:type.loot,source:'osm'};
        }).filter(Boolean).filter(p=>distanceM(lat,lon,p.lat,p.lon)<=POI_RADIUS_M)
          .sort((a,b)=>distanceM(lat,lon,a.lat,a.lon)-distanceM(lat,lon,b.lat,b.lon)).slice(0,40);
        pois=found;poiLoading=false;poiError=found.length?'':`Aucun point de ravitaillement répertorié à moins de ${(POI_RADIUS_M/1000).toFixed(1).replace('.',',')} km. Les deux fouilles virtuelles restent disponibles en mode Démo.`;
        game.selected=pois[0]?.id||'';refreshMarkers();renderAll();
        toast(found.length?`${found.length} lieu(x) OpenStreetMap repéré(s) autour de toi.`:poiError);return;
      }catch(e){if(serial!==poiRequestSerial)return}
    }
    if(serial!==poiRequestSerial||game.mode!=='gps')return;
    pois=[];game.selected='';poiLoading=false;poiError='Service des lieux indisponible. Réessaie dans quelques instants ou joue les fouilles à distance en mode Démo.';
    lastPOIRequestAt=0;refreshMarkers();renderAll();toast(poiError);
  }
  function loadPOIsNear(lat,lon,force=false){
    if(!force&&lastPOIRequest&&Date.now()-lastPOIRequestAt<45000&&distanceM(lat,lon,...lastPOIRequest)<350)return;
    lastPOIRequest=[lat,lon];lastPOIRequestAt=Date.now();
    ++poiRequestSerial;pois=[];game.selected='';poiLoading=true;poiError='';refreshMarkers();renderAll();
    findRealPoi(lat,lon).catch(()=>{});
  }
  function squareAt(lat,lon){
    const half=SAFE_SIDE_M/2;
    const dLat=half/111195,dLon=half/(111320*Math.max(.01,Math.cos(lat*Math.PI/180)));
    return [[lat-dLat,lon-dLon],[lat-dLat,lon+dLon],[lat+dLat,lon+dLon],[lat+dLat,lon-dLon]];
  }
  function refugeNextMove(){
    const time=game.safeZone?.placedAt;
    return Number.isFinite(time)&&time>0?time+SAFE_RELOCATION_MS:0;
  }
  function refugeCanMove(){return !game.safeZone || Date.now()>=refugeNextMove()}
  function renderSafe(){
    const zone=game.safeZone,el=$('safeZoneStatus');if(!el)return;
    if(safeDrawing)el.textContent=safeCandidate
      ?'Carré provisoire de 20 × 20 mètres sur la carte. Confirme pour enregistrer définitivement son emplacement.'
      :'Touche la carte pour choisir l’emplacement du carré de 20 × 20 mètres. Puis appuie sur VALIDER.';
    else if(!zone)el.textContent='Aucun refuge posé. Sa position reste privée et est enregistrée sur cet appareil uniquement.';
    else if(refugeCanMove())el.textContent='Refuge placé (400 m²). Tu peux maintenant le déplacer une fois ; après confirmation, nouveau délai de 30 jours.';
    else el.textContent='Refuge verrouillé (400 m²). Prochain déplacement possible le '+new Date(refugeNextMove()).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+'.';
    $('editSafeZone').disabled=safeDrawing||!refugeCanMove();
    $('editSafeZone').textContent=zone?'⌖ DÉPLACER MON REFUGE':'⌖ PLACER MON REFUGE';
    $('drawingControls').hidden=!safeDrawing;$('drawingDone').disabled=!safeCandidate;
    $('remoteCount').textContent=`${remoteLeft()} / ${DAILY_REMOTE_LIMIT} FOUILLES À DISTANCE`;
    $('micToggle').textContent=game.micEnabled?'🎙 MICRO ACTIVÉ POUR LES FOUILLES · DÉSACTIVER':'🎙 ACTIVER LE MICRO PENDANT LES FOUILLES';
    $('micToggle').setAttribute('aria-pressed',String(!!game.micEnabled));
    $('lastMicReading').textContent=game.lastMicLevel===null?'Dernière fouille : aucun signal mesuré.':`Dernier bruit ambiant mesuré : ${game.lastMicLevel}/100 (échelle de jeu, pas des décibels).`;
  }
  function startDrawing(){
    if(safeDrawing)return;
    if(!refugeCanMove())return toast('Refuge verrouillé jusqu’au '+new Date(refugeNextMove()).toLocaleDateString('fr-FR')+'.');
    safeDrawing=true;safeDraft=[];safeCandidate=null;
    map?.setDrawing(true,[]);if(game.safeZone)map?.setView(game.safeZone.center,18);else if(map){map.zoom=18;map.queueDraw();}
    renderSafe();toast('Touche la carte pour y placer un carré de 20 × 20 m, puis valide.');
  }
  function addHomeVertex(lat,lon){
    if(!safeDrawing||!Number.isFinite(lat)||!Number.isFinite(lon))return;
    safeCandidate=[lat,lon];safeDraft=squareAt(lat,lon);
    map?.setDrawing(true,safeDraft);renderSafe();
    $('placementHint').textContent='⌂ REFUGE 20 × 20 M · CHANGE SA POSITION OU VALIDE';
  }
  function finishDrawing(){
    if(!safeDrawing)return;
    if(!safeCandidate)return toast('Touche d’abord la carte pour choisir le terrain du refuge.');
    if(!refugeCanMove()){cancelDrawing();return toast('Déplacement indisponible avant 30 jours.');}
    const now=Date.now();game.safeZone={center:[...safeCandidate],points:safeDraft.map(p=>[...p]),manual:true,placedAt:now};
    safeDrawing=false;safeCandidate=null;safeDraft=[];map?.setDrawing(false,[]);refreshMarkers();
    commit('Refuge 20 × 20 m enregistré. Prochain déplacement possible dans 30 jours.');
  }
  function cancelDrawing(){
    if(!safeDrawing)return;
    safeDrawing=false;safeCandidate=null;safeDraft=[];map?.setDrawing(false,[]);refreshMarkers();renderSafe();toast('Placement annulé : refuge précédent conservé.');
  }
  // Mesure RMS locale. Une permission est demandée uniquement après une action de fouille.
  async function scanNoise(duration,token){
    let stream=null,audio=null,analyser=null,levelTotal=0,peak=0,count=0,hasMic=false,denied=false;
    token.stop=()=>{token.cancelled=true;stream?.getTracks().forEach(t=>t.stop());if(audio&&audio.state!=='closed')audio.close().catch(()=>{})};
    try{
      if(game.micEnabled && navigator.mediaDevices?.getUserMedia && window.isSecureContext){
        try{
          stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
          if(token.cancelled)return null;
          token.stop=()=>{token.cancelled=true;stream?.getTracks().forEach(t=>t.stop());};
          const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx){audio=new Ctx();await audio.resume();const src=audio.createMediaStreamSource(stream);analyser=audio.createAnalyser();analyser.fftSize=1024;src.connect(analyser);hasMic=true;}
        }catch(e){denied=true;}
      }
      const begin=Date.now(),bins=new Float32Array(1024);
      return await new Promise(resolve=>{
        const timer=setInterval(()=>{
          if(token.cancelled){clearInterval(timer);resolve(null);return;}
          const progress=clamp((Date.now()-begin)/duration,0,1);let loud=0;
          if(analyser){analyser.getFloatTimeDomainData(bins);let power=0;for(const v of bins)power+=v*v;const rms=Math.sqrt(power/bins.length);loud=Math.round(clamp(25*Math.log10(1+rms/0.001),0,100));levelTotal+=loud;peak=Math.max(peak,loud);count++;}
          const b=$('scanNoiseBar'),txt=$('scanCountdown');if(b)b.style.width=(hasMic?loud:Math.round(progress*100))+'%';if(txt)txt.textContent=Math.max(0,Math.ceil((duration-(Date.now()-begin))/1000))+' s';
          if(progress>=1){clearInterval(timer);resolve({level:hasMic?Math.round(levelTotal/Math.max(1,count)*.6+peak*.4):0,hasMic,denied})}
        },120);
      });
    }finally{stream?.getTracks().forEach(t=>t.stop());if(audio&&audio.state!=='closed')audio.close().catch(()=>{});}
  }
  function renderHud(){
    $('hudHp').textContent=game.hp;$('hpBar').style.width=`${game.hp}%`;
    $('hudEnergy').textContent=game.energy;$('energyBar').style.width=`${game.energy}%`;
    $('hudWater').textContent=game.water;$('waterBar').style.width=`${game.water}%`;
    $('hudLevel').textContent=String(game.level).padStart(2,'0');
    $('xpBar').style.width=`${game.xp/game.level}%`;
    $('day').textContent=String(dayNumber()).padStart(2,'0');
    const t=Math.round(danger());$('sidebarThreat').textContent=`${t}%`;$('sidebarThreatBar').style.width=`${t}%`;
    $('sidebarThreatText').textContent=t>70?'Activité critique : risque élevé de rencontre.':t>40?'Mouvements hostiles détectés dans le secteur.':'Faible activité des infectés.';
    $('connection').textContent=game.mode==='gps'?'GPS ACTIF':'MODE DÉMO';
    $('mapModeLabel').textContent=game.mode==='gps'?'◎ MODE GPS':'◇ MODE DÉMO';
    $('mapCoords').textContent=game.mode==='gps'?'POSITION MASQUÉE':'SECTEUR FICTIF 01';
    $('survivorStatus').textContent=game.hp>60?'OPÉRATIONNEL':game.hp>25?'BLESSÉ':'CRITIQUE';
    // Le journal est uniquement sur la page Missions.
    $('demoMode').classList.toggle('selected',game.mode==='demo');
    $('gpsMode').classList.toggle('selected',game.mode==='gps');
  }
  function renderPois(){
    $('poiCount').textContent=String(pois.length).padStart(2,'0');
    $('poiCounter').textContent=`${String(pois.length).padStart(2,'0')} ACTIFS`;
    $('poiList').innerHTML=pois.map(p=>{
      const cd=Math.max(0,Math.ceil(((game.cooldowns[p.id]||0)-Date.now())/60000));
      const distance=game.mode==='gps'&&game.lat!==null?`${Math.round(distanceM(game.lat,game.lon,p.lat,p.lon))} m · `:'';
      const status=p.source==='osm'?'◉ LIEU RÉFÉRENCÉ':'◇ FICTIF';
      return `<button class="poi-card ${game.selected===p.id?'active':''}" data-poi="${safe(p.id)}"><span class="poi-symbol">${p.symbol}</span><span><b>${safe(p.name)}</b><small>${distance}${cd?`Disponible dans ${cd} min`:status}</small></span><span class="poi-danger">${p.danger}%</span></button>`;
    }).join('');
    const p=pois.find(p=>p.id===game.selected)||pois[0];
    if(!p){
      $('targetCard').innerHTML=`<p>${safe(poiLoading?'Recherche des commerces autour de ta position GPS…':poiError||'Aucun lieu disponible ici.')}</p>${game.mode==='gps'&&!poiLoading?'<button id="retryPlaces" class="btn">↻ RECHERCHER LES LIEUX</button>':''}`;
      $('retryPlaces')?.addEventListener('click',()=>{if(game.lat!==null)loadPOIsNear(game.lat,game.lon,true)});
      renderSafe();return;
    }
    const cd=Math.max(0,Math.ceil(((game.cooldowns[p.id]||0)-Date.now())/60000));
    const dist=game.mode==='gps'&&game.lat!==null?Math.round(distanceM(game.lat,game.lon,p.lat,p.lon))+' m':'À distance';
    const onsite=isOnSite(p),remote=isRemote(p),remaining=remoteLeft();
    const disabled=!canSearch(p);
    const label=cd?`↻ RAVITAILLEMENT · ${cd} MIN`:scanBusy?'FOUILLE EN COURS…':remote&&remaining===0?'2/2 FOUILLES À DISTANCE UTILISÉES':'⌕ LANCER LA FOUILLE';
    $('targetCard').innerHTML=`<div class="target-eyebrow">/ LIEU SÉLECTIONNÉ · ${safe(p.type)}</div>
      <h3>${safe(p.name)}</h3><p>${p.source==='osm'?'Point d’intérêt réel référencé sur OpenStreetMap. Le ravitaillement est fictif, sans entrée dans le bâtiment.':'Lieu fictif. Pour fouiller en te déplaçant, active le GPS et attends les vrais lieux référencés.'}</p>
      <div class="target-info"><span>MENACE : ${p.danger}%</span><span>${dist}</span></div>
      <div class="target-info"><span>${onsite?'✓ SUR PLACE · FOUILLE GPS':'◇ À DISTANCE'}</span><span>${remaining}/${DAILY_REMOTE_LIMIT} GRATUITES</span></div>
      <div class="search-options">${Object.entries(METHODS).map(([id,m])=>`<button type="button" data-method="${id}" class="${selectedMethod===id?'active':''}">${m.name}<br><small>⚡ ${m.energy}</small></button>`).join('')}</div>
      <button id="searchBtn" class="btn accent" ${disabled?'disabled':''}>${label}</button>
      <p class="hint">${onsite?'À moins de 120 m de ce lieu : aucune fouille à distance consommée.':`Fouille à distance : ${remaining} restante(s) aujourd’hui. Au-delà, rapproche-toi à 120 m d'un vrai point de ravitaillement avec le GPS.`}${game.mode==='gps'&&gpsAccuracy>MAX_GPS_ACCURACY_M?' · Position trop imprécise pour débloquer une fouille sur place.':''}</p>`;
    $('targetCard').querySelectorAll('[data-method]').forEach(el=>el.addEventListener('click',()=>{selectedMethod=el.dataset.method;renderPois()}));
    $('searchBtn').addEventListener('click',searchPoi);
    $('poiList').querySelectorAll('[data-poi]').forEach(el=>el.addEventListener('click',()=>{
      game.selected=el.dataset.poi;save();renderPois();renderHud();refreshMarkers();
      const selected=pois.find(p=>p.id===game.selected);if(map&&selected)map.panTo([selected.lat,selected.lon]);
    }));
    renderSafe();
  }
  async function searchPoi(){
    if(combat||scanBusy)return;
    const p=pois.find(p=>p.id===game.selected);if(!p)return;
    if((game.cooldowns[p.id]||0)>Date.now())return toast('Ce lieu a besoin de se ravitailler.');
    const m=METHODS[selectedMethod];if(game.energy<m.energy)return toast('Endurance insuffisante : repose-toi.');
    if(game.hp===0)return toast('Récupère d’abord au refuge.');
    if(isRemote(p)&&remoteLeft()===0)return toast('Tes deux fouilles à distance sont utilisées : approche-toi à 120 m d’un vrai lieu GPS.');
    scanBusy=true;const token={cancelled:false};scanToken=token;renderPois();window.dispatchEvent(new CustomEvent('de:action',{detail:{type:'scavenge'}}));
    const duration=selectedMethod==='quiet'?9000:selectedMethod==='normal'?7000:5000;
    modal({tag:'⌕ FOUILLE EN COURS',title:'RESTE DISCRET',text:game.micEnabled?'Le bruit ambiant est analysé localement pendant la fouille. Aucun enregistrement.':'Micro désactivé : la discrétion dépend de ta méthode de fouille.',
      content:'<div class="scan-counter" id="scanCountdown">…</div><div class="scan-meter"><div id="scanNoiseBar"></div></div><p class="hint">Le micro et la fouille s’arrêtent si tu annules.</p>',
      actions:[{name:'ANNULER LA FOUILLE',alt:true,fn:()=>token.stop?.()}]});
    let mic=null;
    try{mic=await scanNoise(duration,token)}catch(e){mic={level:0,hasMic:false,denied:true}}
    scanBusy=false;scanToken=null;
    if(token.cancelled||mic===null){closeModal();renderAll();window.dispatchEvent(new CustomEvent('de:action',{detail:{type:'idle'}}));toast('Fouille annulée. Aucune ressource consommée.');return}
    closeModal();window.dispatchEvent(new CustomEvent('de:action',{detail:{type:'idle'}}));
    // On prélève les ressources uniquement après la fin de la fouille et on revérifie la distance.
    if(isRemote(p)){ensureDaily();if(!remoteLeft()){renderAll();return toast('Quota de fouilles à distance épuisé.')}game.dailyRemote.used++;}
    game.energy=clamp(game.energy-m.energy);game.water=clamp(game.water-2);game.food=clamp(game.food-2);
    const soundLevel=mic.hasMic?mic.level:0;
    game.lastMicLevel=mic.hasMic?soundLevel:null;
    game.noise=clamp(game.noise+m.noise+Math.round(soundLevel*.45));game.threat=clamp(game.threat+Math.round((m.noise+soundLevel*.55)*.25));
    game.totalSearches++;game.cooldowns[p.id]=Date.now()+90000;
    const amount=1+m.bonus+random(0,2),loot={};for(let i=0;i<amount;i++){let id=pick(p.loot);loot[id]=(loot[id]||0)+1;}
    const found=takeLoot(loot);xpGain(12+(p.danger>>3));
    const risk=clamp(8+p.danger*.45+m.risk+game.noise*.16+soundLevel*.40,0,92);
    log(`Fouille ${m.name.toLowerCase()} · ${p.name} : ${found.length?found.join(', '):'sac plein'}${mic.hasMic?` · bruit ${soundLevel}/100`:''}.`);
    if(Math.random()*100<risk){save();renderAll();startCombat(p)}
    else{game.threat=clamp(game.threat-4);commit(`Fouille réussie ! ${found.length?found.join(', '):'Sac à dos plein.'}`)}
    if(mic.denied)toast('Micro non disponible : fouille jouée normalement.');
  }
  function startCombat(p){
    const tier=p?.danger||35;
    const z={...ZOMBIES[tier>65?random(0,2):random(0,1)]};
    z.hp+=Math.floor(game.level*.9);z.maxHp=z.hp;
    combat={z,guard:false,round:0};window.dispatchEvent(new CustomEvent('de:action',{detail:{type:'hurt'}}));
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
    const rows=[['Niveau',game.level],['Expérience',`${game.xp} / ${game.level*100}`],['Satiété',`${game.food}%`],['Hydratation',`${game.water}%`],['Bruit accumulé',`${game.noise}%`],['Zombies éliminés',game.kills],['Fouilles terminées',game.totalSearches],['Mode',game.mode==='gps'?'GPS · hybride':'Démo · hybride']];
    $('survivorStats').innerHTML=rows.map(([name,value])=>`<div class="info-line"><span>${name}</span><strong>${safe(value)}</strong></div>`).join('');
    $('stealthValue').textContent=`${100-game.noise}%`;
    $('stealthBar').style.width=`${100-game.noise}%`;
    $('eatBtn').disabled=quantity('food')===0||game.food>=100;
    $('drinkBtn').disabled=quantity('water')===0||game.water>=100;
    $('healBtn').disabled=quantity('bandage')===0||game.hp>=100;
    $('restBtn').disabled=game.energy>=100;
  }
  function useItem(id,prop,points,msg){
    if(quantity(id)<1||game[prop]>=100)return;
    game.inventory[id]--;game[prop]=clamp(game[prop]+points);window.dispatchEvent(new CustomEvent('de:action',{detail:{type:id==='food'?'eat':id==='water'?'drink':'heal'}}));commit(msg);
  }
  function rest(){window.dispatchEvent(new CustomEvent('de:action',{detail:{type:'rest'}}));game.energy=clamp(game.energy+45);game.noise=clamp(game.noise-20);game.threat=clamp(game.threat-8);game.food=clamp(game.food-4);game.water=clamp(game.water-4);commit('Repos au refuge : +45 endurance.');}
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
    $('inventoryGrid').innerHTML=Object.entries(ITEMS).map(([id,item])=>`<div class="item-card ${quantity(id)===0?'empty':''}"><div class="item-symbol"><img alt="" src="assets/item-${id}.png"></div><b>${safe(item.label)}</b><small>× ${quantity(id)} · ${item.weight} kg/u.</small></div>`).join('');
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
  function renderAll(){renderHud();renderPois();renderSurvivor();renderBase();renderInventory();renderMissions();renderSafe();window.dispatchEvent(new CustomEvent('de:render',{detail:{hp:game.hp,energy:game.energy,water:game.water,food:game.food,level:game.level,xp:game.xp,noise:game.noise,inventory:{...game.inventory},mode:game.mode,dailyRemaining:remoteLeft(),capacity:inventoryWeight(),threat:danger(),drawing:safeDrawing}}));}
  function switchTab(tab){window.dispatchEvent(new CustomEvent('de:tab',{detail:{tab}}));currentTab=tab;document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===`page-${tab}`));if(tab==='map'&&map)setTimeout(()=>map.invalidateSize(),150);window.scrollTo({top:0,behavior:'instant'});}
  function createMap(){
    if(!window.DeadEarthFastMap){$('mapFallback').hidden=false;return}
    try{
      map=new window.DeadEarthFastMap($('map'),{center,onTap:addHomeVertex,onMarker:id=>{
        if(id.startsWith('zombie-')){if(!combat&&!scanBusy)startCombat({danger:40,name:'secteur infecté'});return;}
        if(!pois.some(p=>p.id===id))return;
        game.selected=id;save();renderPois();renderHud();refreshMarkers();window.dispatchEvent(new CustomEvent('de:poi',{detail:{id}}));
      }});
      window.DEAD_EARTH_MAP=map;refreshMarkers();
    }catch(e){$('mapFallback').hidden=false;console.warn('Carte Canvas indisponible',e)}
  }
  function refreshMarkers(){
    if(!map)return;
    const markers=[];
    if(game.mode==='gps'&&game.lat!==null){markers.push({id:'player',kind:'player',symbol:'◎',label:'SURVIVANT',lat:game.lat,lon:game.lon})}
    if(game.safeZone)markers.push({id:'safe',kind:'home',symbol:'⌂',label:'REFUGE',lat:game.safeZone.center[0],lon:game.safeZone.center[1]});
    else if(game.mode==='demo')markers.push({id:'base-demo',kind:'home',symbol:'⌂',label:'REFUGE DÉMO',lat:center[0],lon:center[1]});
    for(const p of pois)markers.push({id:p.id,kind:'poi',symbol:p.symbol,label:p.name,lat:p.lat,lon:p.lon,selected:p.id===game.selected});
    // Les infectés figurés sont de simples éléments fictionnels sur le terrain.
    for(let i=0;i<3;i++){const offsets=[[.002,-.003],[-.003,.006],[.004,.006]][i];markers.push({id:'zombie-'+i,kind:'zombie',symbol:'☣',lat:center[0]+offsets[0],lon:center[1]+offsets[1]})}
    map.setMarkers(markers);map.setSafeZone(game.safeZone);map.setDrawing(safeDrawing,safeDraft);
  }
  function setDemo(){
    if(gpsWatch!==null){navigator.geolocation?.clearWatch(gpsWatch);gpsWatch=null;}
    poiRequestSerial++;poiLoading=false;poiError='';game.mode='demo';game.lat=null;game.lon=null;gpsAccuracy=Infinity;
    center=game.safeZone?[...game.safeZone.center]:[...DEFAULT_CENTER];pois=getPoiList(...center);
    if(!pois.some(p=>p.id===game.selected))game.selected=pois[0].id;
    if(map){map.setView(center,15);refreshMarkers()};commit('Mode démo activé : deux fouilles à distance par jour.');
  }
  function setGPS(){
    if(!navigator.geolocation){toast('GPS indisponible dans ce navigateur.');return;}
    if(!window.isSecureContext){toast('GPS : utilise une connexion HTTPS.');return;}
    toast('Demande de localisation : le GPS n’est pas conservé dans la sauvegarde.');
    if(gpsWatch!==null)navigator.geolocation.clearWatch(gpsWatch);
    gpsWatch=navigator.geolocation.watchPosition(pos=>{
      const lat=pos.coords.latitude,lon=pos.coords.longitude;
      if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
      const previous=game.lat===null?0:distanceM(lat,lon,game.lat,game.lon);const moved=game.lat===null||previous>350;
      gpsAccuracy=Number.isFinite(pos.coords.accuracy)?pos.coords.accuracy:Infinity;
      if(previous>4 && previous<400)window.dispatchEvent(new CustomEvent('de:action',{detail:{type:pos.coords.speed>2.2?'run':'walk'}}));
      const first=game.mode!=='gps';game.mode='gps';game.lat=lat;game.lon=lon;center=[lat,lon];
      if(first&&map)map.setView(center,15);
      if(first||moved)loadPOIsNear(lat,lon);
      refreshMarkers();save();renderAll();
    },err=>{const msg=err.code===1?'Autorisation GPS refusée.':'Position GPS indisponible.';toast(`${msg} Mode démo conservé.`);setDemo();},
    {enableHighAccuracy:false,maximumAge:30000,timeout:12000});
  }
  function beep(freq,duration){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sawtooth';osc.frequency.value=freq;gain.gain.setValueAtTime(.05,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);osc.onended=()=>ctx.close();}catch{}}
  function init(){
    pois=getPoiList(...center);if(!pois.some(p=>p.id===game.selected))game.selected=pois[0].id;
    renderAll();createMap();
    document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
    $('demoMode').addEventListener('click',setDemo);$('gpsMode').addEventListener('click',setGPS);
    $('recenter').addEventListener('click',()=>{if(map)map.setView(game.safeZone && game.mode==='demo'?game.safeZone.center:center,15);else toast('Carte indisponible. La liste des lieux reste utilisable.')});
    $('editSafeZone').addEventListener('click',startDrawing);
    $('drawingDone').addEventListener('click',finishDrawing);
    $('drawingCancel').addEventListener('click',cancelDrawing);
    $('micToggle').addEventListener('click',()=>{game.micEnabled=!game.micEnabled;commit(game.micEnabled?'Micro autorisé pour les fouilles (demande iOS à la première utilisation).':'Micro désactivé.');});
    $('eatBtn').addEventListener('click',()=>useItem('food','food',30,'Conserve consommée. +30 satiété.'));
    $('drinkBtn').addEventListener('click',()=>useItem('water','water',30,'Eau consommée. +30 hydratation.'));
    $('healBtn').addEventListener('click',()=>useItem('bandage','hp',30,'Bandage utilisé. +30 santé.'));
    $('restBtn').addEventListener('click',rest);$('defendBtn').addEventListener('click',defendBase);
    // Journal radio supprimé de la carte : il reste dans Missions.
    $('soundToggle').addEventListener('click',()=>{sound=!sound;$('soundToggle').textContent=sound?'♫':'♪';$('soundToggle').setAttribute('aria-label',sound?'Désactiver le son':'Activer le son');toast(sound?'Son activé.':'Son désactivé.')});
    $('resetBtn').addEventListener('click',()=>modal({tag:'RÉINITIALISATION',title:'RECOMMENCER ?',text:'Cette action efface ta progression locale. Tu pourras continuer à jouer en mode démo.',actions:[{name:'ANNULER',fn:closeModal,alt:true},{name:'EFFACER LA PARTIE',fn:()=>{closeModal();game=fresh();selectedMethod='quiet';setDemo();switchTab('map');}}]}));
    $('modal').addEventListener('click',e=>{if(e.target===$('modal')&&!combat)closeModal()});
    window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!combat)closeModal()});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&scanToken)scanToken.stop?.();if(document.visibilityState==='visible')renderAll()});
    // La page peut rester ouverte pendant le changement de date.
    setInterval(()=>{if(document.visibilityState==='visible'&&!scanBusy){renderHud();renderSafe();}},60000);
    if('serviceWorker' in navigator && window.isSecureContext)navigator.serviceWorker.register('./sw.js').catch(()=>{});
    toast('Transmission ouverte. Prêt pour ta première expédition !');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
