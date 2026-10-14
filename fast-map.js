/* DEAD EARTH — cartographie Canvas légère. Inspirée de l'architecture Gpsmine :
   fond immédiat, tuiles vectorielles OpenFreeMap décodées une seule fois,
   images de tuiles pré-rendues et conservées en cache mémoire / cache HTTP. */
(() => {
  'use strict';
  const DEG=Math.PI/180, BASE=14, SIZE=512, WORLD=SIZE*2**BASE;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const xy=(lat,lon)=>({x:(lon+180)/360*WORLD,y:(1-Math.log(Math.tan(lat*DEG)+1/Math.cos(lat*DEG))/Math.PI)/2*WORLD});
  const ll=(x,y)=>({lat:Math.atan(Math.sinh(Math.PI*(1-2*y/WORLD)))/DEG,lon:x/WORLD*360-180});
  const tileColors={background:'#74695e',park:'#52644e',water:'#425f66',building:'#6f5148',road:'#a29583',path:'#8a7b69'};
  const point=(lat,lon)=>Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
  function readVar(bytes,idx){let v=0,shift=0;while(idx<bytes.length){const b=bytes[idx++];v+=(b&127)*2**shift;if(!(b&128))break;shift+=7;if(shift>56)throw new Error('Invalid protobuf varint')}return [v,idx]}
  function parse(bytes,start,end,cb){let i=start;while(i<end){let v;[v,i]=readVar(bytes,i);const id=Math.floor(v/8),wire=v%8;if(wire===0){[v,i]=readVar(bytes,i);cb(id,wire,v)}else if(wire===2){let l;[l,i]=readVar(bytes,i);const j=i+l;if(j>end)throw Error('Invalid vector tile');cb(id,wire,i,j);i=j}else if(wire===5){cb(id,wire,i,i+4);i+=4}else if(wire===1){cb(id,wire,i,i+8);i+=8}else throw Error('Unsupported wire type')}}
  function unpack(bytes,s,e){const out=[];while(s<e){let n;[n,s]=readVar(bytes,s);out.push(n)}return out}
  const decodeText=(bytes,s,e)=>new TextDecoder().decode(bytes.subarray(s,e));
  const signed=n=>(n%2)?-(n+1)/2:n/2;
  function drawVector(buffer){
    const bytes=new Uint8Array(buffer),c=document.createElement('canvas');c.width=c.height=SIZE;
    const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle=tileColors.background;ctx.fillRect(0,0,SIZE,SIZE);ctx.imageSmoothingEnabled=false;
    const layers=[];
    parse(bytes,0,bytes.length,(field,wire,s,e)=>{if(field===3&&wire===2)layers.push([s,e])});
    const geometries=[];
    for(const [s,e] of layers){
      let name='',extent=4096;const keys=[],values=[],features=[];
      parse(bytes,s,e,(f,w,a,b)=>{
        if(f===1&&w===2)name=decodeText(bytes,a,b);
        else if(f===5&&w===0)extent=a;
        else if(f===3&&w===2)keys.push(decodeText(bytes,a,b));
        else if(f===4&&w===2){let value=null;parse(bytes,a,b,(ff,ww,x,y)=>{if(ff===1&&ww===2)value=decodeText(bytes,x,y)});values.push(value)}
        else if(f===2&&w===2)features.push([a,b]);
      });
      if(!/^(park|water|waterway|building|transportation|place)$/.test(name))continue;
      for(const [a,b] of features){
        let type=0,geomS=0,geomE=0,tags=[];
        parse(bytes,a,b,(f,w,x,y)=>{if(f===3&&w===0)type=x;else if(f===2&&w===2)tags=unpack(bytes,x,y);else if(f===4&&w===2){geomS=x;geomE=y}});
        if(!geomE)continue;
        const props={};for(let i=0;i+1<tags.length;i+=2)props[keys[tags[i]]]=values[tags[i+1]];
        let kind=name;
        if(name==='transportation'){
          if(props.brunnel==='tunnel')continue;
          if(!/^(motorway|trunk|primary|secondary|tertiary|minor|service|residential|living_street|pedestrian|track|path|footway|cycleway)$/.test(props.class||''))continue;
          kind=/path|footway|track|cycleway|pedestrian/.test(props.class||'')?'path':'road';
        }
        if(name==='place'&&type!==1)continue;
        const geometryValues=unpack(bytes,geomS,geomE),paths=[];
        let x=0,y=0,index=0,cur=null;
        while(index<geometryValues.length){const cmd=geometryValues[index++],kindCmd=cmd&7,n=Math.floor(cmd/8);
          if(kindCmd===1||kindCmd===2){for(let j=0;j<n;j++){x+=signed(geometryValues[index++]);y+=signed(geometryValues[index++]);if(kindCmd===1){cur=[];paths.push(cur)}if(cur)cur.push([x*SIZE/extent,y*SIZE/extent])}}
          else if(kindCmd===7){if(cur&&cur.length>2)cur.push(cur[0]);}
          else break;
        }
        if(name==='place'){
          const label=props['name:fr']||props.name;
          if(label&&/^(city|town|village|hamlet)$/.test(props.class||'')&&paths[0]?.length) geometries.push({kind:'label',paths,name:label});
        }else geometries.push({kind,type,paths,props});
      }
    }
    const order={park:0,water:1,waterway:2,building:3,path:4,road:5,label:6};geometries.sort((a,b)=>order[a.kind]-order[b.kind]);
    for(const g of geometries){const ctxPath=new Path2D();for(const path of g.paths){if(!path.length)continue;ctxPath.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctxPath.lineTo(path[i][0],path[i][1]);if(g.type===3)ctxPath.closePath()}
      if(g.kind==='label'){const p=g.paths[0][0];ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.strokeStyle='#26211c';ctx.lineWidth=4;ctx.strokeText(g.name,p[0],p[1]);ctx.fillStyle='#f0ddb5';ctx.fillText(g.name,p[0],p[1]);continue}
      if(g.type===3){ctx.fillStyle=tileColors[g.kind];ctx.fill(ctxPath);if(g.kind==='building'){ctx.strokeStyle='#493b38';ctx.lineWidth=2;ctx.stroke(ctxPath)}}
      else if(g.type===2){ctx.strokeStyle=tileColors[g.kind];ctx.lineWidth=g.kind==='road'?g.props.class==='primary'?5:g.props.class==='secondary'?4:2.6:1.8;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke(ctxPath)}
    }
    return c;
  }
  class FastMap {
    constructor(node,config={}){
      this.node=node;this.canvas=document.createElement('canvas');this.canvas.className='fast-map-canvas';this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label','Carte tactique Canvas : rues, zones et points de ravitaillement');node.appendChild(this.canvas);
      this.ctx=this.canvas.getContext('2d',{alpha:false});this.center=xy(config.center?.[0]??48.8566,config.center?.[1]??2.3522);this.zoom=14;
      this.markers=[];this.safeZone=null;this.drawing=[];this.isDrawing=false;this.onTap=config.onTap||null;this.onMarker=config.onMarker||null;
      this.tiles=new Map();this.pending=[];this.active=0;this.maxLoads=3;this.tileTemplate=null;this.templatePending=false;
      this.ground=new Image();this.ground.onload=()=>{this.groundTexture=document.createElement('canvas');this.groundTexture.width=143;this.groundTexture.height=113;const tc=this.groundTexture.getContext('2d');tc.imageSmoothingEnabled=false;tc.drawImage(this.ground,0,0,143,113);this.queueDraw()};this.ground.src='assets/floor.jpg';
      this.ready=true;this.pointer=new Map();this.lastDistance=null;this.dragging=false;this.dirty=false;this.destroyed=false;
      this.resize=()=>{if(this.destroyed)return;const rect=this.node.getBoundingClientRect();this.w=Math.max(220,rect.width);this.h=Math.max(260,rect.height);const dpr=Math.min(window.devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.queueDraw()};
      if('ResizeObserver' in window){this.ro=new ResizeObserver(this.resize);this.ro.observe(this.node)}else window.addEventListener('resize',this.resize);
      this.canvas.addEventListener('pointerdown',e=>{this.pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});try{this.canvas.setPointerCapture(e.pointerId)}catch{};this.dragging=false});
      this.canvas.addEventListener('pointermove',e=>{
        const p=this.pointer.get(e.pointerId);if(!p)return;
        if(this.pointer.size===2){this.pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});const ps=[...this.pointer.values()];const d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);if(this.lastDistance&&Math.abs(d-this.lastDistance)>3){this.zoom=clamp(this.zoom+Math.log2(d/this.lastDistance),13.5,18);this.queueDraw()}this.lastDistance=d;this.dragging=true;return;}
        const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.abs(dx)+Math.abs(dy)>2){this.dragging=true;this.center.x-=dx/2**(this.zoom-BASE);this.center.y-=dy/2**(this.zoom-BASE);this.queueDraw()}
        this.pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});
      });
      const up=e=>{const p=this.pointer.get(e.pointerId);this.pointer.delete(e.pointerId);this.lastDistance=null;if(!p)return; if(!this.dragging){const rect=this.canvas.getBoundingClientRect();this.handleTap(e.clientX-rect.left,e.clientY-rect.top)}if(!this.pointer.size)this.dragging=false};
      this.canvas.addEventListener('pointerup',up);this.canvas.addEventListener('pointercancel',e=>{this.pointer.delete(e.pointerId);this.lastDistance=null});
      this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom+(e.deltaY<0?.5:-.5),13.5,18);this.queueDraw()},{passive:false});
      this.canvas.addEventListener('dblclick',e=>{e.preventDefault();this.zoom=clamp(this.zoom+1,13.5,18);this.queueDraw()});
      this.resize();this.animation=setInterval(()=>{if(document.visibilityState==='visible'&&this.node.getClientRects().length)this.queueDraw()},750);
    }
    position(lat,lon){const p=xy(lat,lon),s=2**(this.zoom-BASE);return{x:this.w/2+(p.x-this.center.x)*s,y:this.h/2+(p.y-this.center.y)*s}}
    latlon(x,y){const s=2**(this.zoom-BASE),p=ll(this.center.x+(x-this.w/2)/s,this.center.y+(y-this.h/2)/s);return p}
    handleTap(x,y){if(this.isDrawing){const p=this.latlon(x,y);this.onTap?.(p.lat,p.lon);return}for(const m of [...this.markers].reverse()){const p=this.position(m.lat,m.lon);if(Math.hypot(p.x-x,p.y-y)<24){this.onMarker?.(m.id);return}}}
    setView(latlon,zoom){if(point(latlon[0],latlon[1]))this.center=xy(latlon[0],latlon[1]);if(zoom!==undefined)this.zoom=clamp(zoom,13.5,18);this.queueDraw()}
    panTo(latlon){this.setView(latlon)}
    invalidateSize(){this.resize()}
    setMarkers(markers){this.markers=markers||[];this.queueDraw()}
    setSafeZone(zone){this.safeZone=zone;this.queueDraw()}
    setDrawing(yes,points=[]){this.isDrawing=!!yes;this.drawing=points||[];this.queueDraw()}
    queueDraw(){if(this.destroyed||this.dirty)return;this.dirty=true;requestAnimationFrame(()=>{this.dirty=false;if(!this.destroyed)this.draw()})}
    async template(){if(this.tileTemplate||this.templatePending)return;this.templatePending=true;try{const r=await fetch('https://tiles.openfreemap.org/planet',{cache:'force-cache'});if(!r.ok)throw Error('TileJSON HTTP '+r.status);const data=await r.json();if(typeof data.tiles?.[0]!=='string')throw Error('TileJSON absent');this.tileTemplate=data.tiles[0];this.pump();this.queueDraw()}catch(e){this.tileTemplate=null;setTimeout(()=>{this.templatePending=false;this.queueDraw()},30000);return}this.templatePending=false}
    enqueue(x,y){const k=x+','+y;if(this.tiles.has(k))return;this.tiles.set(k,{state:'queued'});this.pending.push({x,y,k});this.pump()}
    pump(){if(!this.tileTemplate){this.template();return}while(this.active<this.maxLoads&&this.pending.length){const q=this.pending.shift();if(!q||this.tiles.get(q.k)?.state!=='queued')continue;this.active++;this.tiles.set(q.k,{state:'loading'});this.loadTile(q).finally(()=>{this.active--;this.pump()})}}
    async loadTile({x,y,k}){try{
      const url=this.tileTemplate.replace('{z}',String(BASE)).replace('{x}',String(x)).replace('{y}',String(y));
      const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw Error('Tile HTTP '+r.status);
      let bytes=new Uint8Array(await r.arrayBuffer());if(bytes[0]===31&&bytes[1]===139){if(!window.DecompressionStream)throw Error('Gzip unsupported');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}
      const image=drawVector(bytes.buffer);this.tiles.set(k,{state:'ready',image,access:Date.now()});
      if(this.tiles.size>45){const old=[...this.tiles.entries()].filter(([,v])=>v.state==='ready').sort((a,b)=>a[1].access-b[1].access);old.slice(0,Math.max(0,this.tiles.size-35)).forEach(([key])=>this.tiles.delete(key))}
      this.queueDraw();
    }catch(e){this.tiles.set(k,{state:'failed',when:Date.now(),error:String(e)});this.queueDraw()}}
    draw(){if(!this.ctx||!this.w)return;const ctx=this.ctx,W=this.w,H=this.h;
      ctx.fillStyle='#6d6256';ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=false;
      const s=2**(this.zoom-BASE),sTile=SIZE*s;
      const x0=Math.floor((this.center.x-W/2/s)/SIZE),x1=Math.ceil((this.center.x+W/2/s)/SIZE),y0=Math.floor((this.center.y-H/2/s)/SIZE),y1=Math.ceil((this.center.y+H/2/s)/SIZE);
      const cx=this.w/2,cy=this.h/2;
      // Terrain immédiat ancré dans la projection GPS : pavés, routes, ruines, végétation.
      // Ne réclame aucun réseau et reste stable quand le joueur déplace la carte.
      const step=58*s,bi=Math.floor((this.center.x-W/2/s)/58)-1,bj=Math.floor((this.center.y-H/2/s)/58)-1;
      const noise=(i,j)=>{let x=((i*73856093)^(j*19349663))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967295};
      const colors=['#756a5b','#786b5b','#6e6357','#817262','#70675d'];
      for(let i=bi;i<bi+Math.ceil(W/step)+3;i++)for(let j=bj;j<bj+Math.ceil(H/step)+3;j++){
        const x=Math.floor(cx+(i*58-this.center.x)*s),y=Math.floor(cy+(j*58-this.center.y)*s),q=noise(i,j);
        ctx.fillStyle=colors[Math.floor(q*colors.length)];ctx.fillRect(x,y,Math.ceil(step),Math.ceil(step));
        ctx.strokeStyle='#433a3588';ctx.lineWidth=Math.max(1,s);ctx.strokeRect(x+.5,y+.5,Math.ceil(step),Math.ceil(step));
        if(q>.7){ctx.strokeStyle='#514e43a8';ctx.beginPath();ctx.moveTo(x+step*.2,y+step*.1);ctx.lineTo(x+step*.38,y+step*.43);ctx.lineTo(x+step*.25,y+step*.65);ctx.stroke()}
        if(q<.23){ctx.fillStyle='#56634a';ctx.fillRect(x+step*.65,y+step*.55,Math.max(2,step*.11),Math.max(2,step*.13));ctx.fillStyle='#47543e';ctx.fillRect(x+step*.73,y+step*.48,Math.max(2,step*.1),Math.max(2,step*.1))}
        if(q>.89){ctx.fillStyle='#514941';ctx.fillRect(x+step*.13,y+step*.16,step*.43,step*.35);ctx.fillStyle='#8e6e59';ctx.fillRect(x+step*.16,y+step*.19,step*.32,step*.08)}
      }
      // Axes de circulation schématiques, uniquement tant que les tuiles réelles n'ont pas chargé.
      ctx.globalAlpha=.28;ctx.fillStyle='#a3977e';
      for(let i=bi;i<bi+Math.ceil(W/step)+3;i++)if(i%8===0){const x=cx+(i*58-this.center.x)*s;ctx.fillRect(x,0,step*.7,H)}
      for(let j=bj;j<bj+Math.ceil(H/step)+3;j++)if(j%8===0){const y=cy+(j*58-this.center.y)*s;ctx.fillRect(0,y,W,step*.7)}
      ctx.globalAlpha=1;
      let requested=0;
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        if(y<0||y>=2**BASE)continue;const k=((x%(2**BASE))+(2**BASE))%(2**BASE)+','+y;
        const p={x:cx+(x*SIZE-this.center.x)*s,y:cy+(y*SIZE-this.center.y)*s};const t=this.tiles.get(k);
        if(t?.state==='ready'){ctx.drawImage(t.image,Math.round(p.x),Math.round(p.y),Math.ceil(sTile)+1,Math.ceil(sTile)+1);t.access=Date.now()}
        else if(!t&&requested<18){this.enqueue(((x%(2**BASE))+(2**BASE))%(2**BASE),y);requested++}
      }
      // Refuge : zone privée géométrique et visuelle, indépendante du GPS joueur.
      if(this.safeZone?.points?.length>=3)this.drawZone(this.safeZone.points,'#8acf9b','#357348',.21);
      if(this.drawing.length){this.drawZone(this.drawing,'#ffd28b','#d5ae76',.18,true)}
      const visible=[];
      for(const m of this.markers){const p=this.position(m.lat,m.lon);if(p.x<-35||p.x>W+35||p.y<-35||p.y>H+35)continue;visible.push({...m,...p})}
      for(const m of visible){
        const col=m.kind==='home'?'#9cd69a':m.kind==='player'?'#f5dfad':m.kind==='zombie'?'#dc6a57':m.selected?'#f5ce8d':'#bbc7ac';
        const wobble=m.kind==='zombie'?Math.sin(Date.now()/950+m.lat*531)*3:0;
        const px=Math.round(m.x+wobble),py=Math.round(m.y);
        ctx.fillStyle='#10191d';ctx.fillRect(px-18,py-17,36,35);
        ctx.fillStyle=m.kind==='zombie'?'#5b5149':'#334249';ctx.fillRect(px-15,py-14,30,29);
        ctx.lineWidth=2;ctx.strokeStyle=col;ctx.strokeRect(px-16,py-15,32,31);
        if(m.kind==='zombie'){
          ctx.fillStyle='#3f4a46';ctx.fillRect(px-8,py-9,16,15);ctx.fillStyle='#f66051';ctx.fillRect(px-7,py-6,5,5);ctx.fillRect(px+3,py-6,5,5);ctx.fillStyle='#a5a69a';ctx.fillRect(px-4,py+3,8,3);
          ctx.fillStyle='#a32825';ctx.fillRect(px-15,py-19,26,2);ctx.fillStyle='#d65d4e';ctx.fillRect(px-15,py-19,16,2);
        }else{
          ctx.fillStyle=col;ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(m.symbol||'◎',px,py+2);
        }
        if(m.kind==='home'||m.selected){ctx.font='bold 10px monospace';ctx.fillStyle='#151b1c';const label=(m.label||'').slice(0,18);ctx.fillRect(px-label.length*3.2-4,py+19,label.length*6.4+8,14);ctx.fillStyle='#fff0d0';ctx.fillText(label,px,py+26)}
      }
      ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#2e2e2a';ctx.globalAlpha=.7;ctx.font='9px monospace';ctx.fillText(this.tileTemplate?'DÉTAILS EN CHARGEMENT...':'CARTE EN MODE TERRAIN',9,14);ctx.globalAlpha=1;
    }
    drawZone(points,fill,stroke,alpha,open=false){const ctx=this.ctx;ctx.beginPath();points.forEach((p,i)=>{const t=this.position(p[0],p[1]);if(i===0)ctx.moveTo(t.x,t.y);else ctx.lineTo(t.x,t.y)});if(!open)ctx.closePath();ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=3;ctx.strokeStyle=stroke;ctx.stroke();if(open)for(const p of points){const t=this.position(p[0],p[1]);ctx.fillStyle='#ffe6ad';ctx.beginPath();ctx.arc(t.x,t.y,4,0,7);ctx.fill()}}
    destroy(){this.destroyed=true;clearInterval(this.animation);this.ro?.disconnect();window.removeEventListener('resize',this.resize)}
  }
  window.DeadEarthFastMap=FastMap;
})();
