(()=>{
'use strict';

// Obligatorio tener grupo registrado para acceder al mapa
try {
  const dk = JSON.parse(localStorage.getItem('dk') || '{}');
  if (!dk || !dk.team || typeof dk.team !== 'string' || !dk.team.trim()) {
    window.location.replace('/login?msg=requerido');
    return;
  }
} catch (e) {
  window.location.replace('/login?msg=requerido');
  return;
}

const PASS='HERACLES.EXE';

const root=document.documentElement;
const $=s=>document.querySelector(s);
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;

function h(tag,attrs,...kids){
  const e=document.createElement(tag);
  for(const k in (attrs||{})){
    if(k==='class')e.className=attrs[k];
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);
    else e.setAttribute(k,attrs[k]);
  }
  for(const x of kids.flat())e.append(x);
  return e;
}
const shakeEl=el=>{el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),400)};

/* ---------- Progreso ---------- */
const KEY='heracles-mapa-done';
const done=new Set();
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'[]');
  if(Array.isArray(saved))saved.forEach(v=>{if(Number.isInteger(v)&&v>=0&&v<12)done.add(v)});
}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify([...done]))}catch(e){}};

/* ---------- Cronometro de Cuenta Atras (1h 30m = 5400s) ---------- */
const COUNTDOWN_SECONDS = 90 * 60; // 5400 segundos (1 hora y 30 minutos)
const TIMER_KEY = 'heracles-timer-end';
let timerInterval = null;

function getEndTime() {
  let end = localStorage.getItem(TIMER_KEY);
  if (!end || isNaN(parseInt(end, 10))) {
    end = Date.now() + COUNTDOWN_SECONDS * 1000;
    localStorage.setItem(TIMER_KEY, end.toString());
  } else {
    end = parseInt(end, 10);
  }
  return end;
}

function formatCountdown(sec) {
  if (sec <= 0) return '00:00:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function initCountdown() {
  const timerEl = document.getElementById('timerVal');
  let endTime = getEndTime();

  function tick() {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    
    if (timerEl) {
      timerEl.textContent = formatCountdown(remaining);
      timerEl.classList.toggle('timer-danger', remaining <= 600);
      if (remaining <= 0) {
        timerEl.textContent = '00:00:00';
        handleTimeExpired();
      }
    }
  }

  tick();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

function handleTimeExpired() {
  if (root.classList.contains('restored')) return;
  const msgEl = document.getElementById('msg');
  if (msgEl) {
    msgEl.textContent = '[TIEMPO AGOTADO] La maldición de Hera ha sellado el Olimpo (1h 30m consumidas).';
    msgEl.className = 'msg err';
  }
  if (typeof window.showGameOverScreen === 'function') {
    window.showGameOverScreen();
  }
}

/* ---------- Los doce trabajos y su lugar en el mapa ---------- */
// Cada trabajo se juega en el canvas emergente de juegos.js (mismo orden que aqui).
const T=[
  {gr:'Α',name:'El León de Nemea',tag:'Colores RGB',pos:[1310,510]},
  {gr:'Β',name:'La Hidra de Lerna',tag:'Escritura rápida',pos:[1500,665]},
  {gr:'Γ',name:'La Cierva de Cerinea',tag:'Reflejos',pos:[720,345]},
  {gr:'Δ',name:'El Jabalí de Erimanto',tag:'Huellas en la nieve',pos:[430,345]},
  {gr:'Ε',name:'Los Establos de Augías',tag:'Arrastra al virus',pos:[190,485]},
  {gr:'Ζ',name:'Las Aves del Estínfalo',tag:'Lag del Olimpo',pos:[545,495]},
  {gr:'Η',name:'El Toro de Creta',tag:'Laberinto',pos:[1080,920]},
  {gr:'Θ',name:'Las Yeguas de Diomedes',tag:'Simon dice',pos:[1618,365]},
  {gr:'Ι',name:'El Cinturón de Hipólita',tag:'Bit roto',pos:[1760,520]},
  {gr:'Κ',name:'Los Bueyes de Gerión',tag:'Atajos de teclado',pos:[580,735]},
  {gr:'Λ',name:'Las Manzanas de las Hespérides',tag:'QR y cifrado · prueba física',pos:[310,690]},
  {gr:'Μ',name:'Cerbero',tag:'Tres sentidos',pos:[1815,760]}
];


/* ---------- Configuracion de Candados: solo 3, 11 y 12 desbloqueadas ---------- */
const UNLOCKED_TRIALS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]); // Los 12 trabajos desbloqueados
const LOCK_SVG = '<svg class="lock-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

/* ---------- Mapa: pines y niebla ---------- */
const IW=1998,IH=1115;
const map=$('#map');
const pins=T.map((t,i)=>{
  const isLocked = !UNLOCKED_TRIALS.has(i);
  const px=t.pos[0]/IW*100,py=t.pos[1]/IH*100;
  let cls='pin'+(px<22?' l':px>78?' r':'')+(py<26?' below':'');
  if(isLocked) cls += ' locked';

  const badgeKids = isLocked ? [
    h('span',{class:'pin-lock-badge','aria-label':'Candado activo',title:'Prueba bloqueada con candado'},
      h('svg',{viewBox:'0 0 24 24',width:'10',height:'10',fill:'none',stroke:'currentColor','stroke-width':'2.5','stroke-linecap':'round','stroke-linejoin':'round'},
        h('rect',{x:'3',y:'11',width:'18',height:'11',rx:'2',ry:'2'}),
        h('path',{d:'M7 11V7a5 5 0 0 1 10 0v4'})
      )
    )
  ] : [];

  const b=h('button',{class:cls,type:'button',style:`left:${px.toFixed(2)}%;top:${py.toFixed(2)}%;--d:${(i*.37).toFixed(2)}s`},
    h('span',{class:'pg','aria-hidden':'true'},t.gr),
    ...badgeKids,
    h('span',{class:'tip','aria-hidden':'true'},
      h('b',{},t.name + (isLocked ? ' [CANDADO]' : '')),
      h('i',{},t.tag + (isLocked ? ' · Bloqueado con candado' : ' · Disponible'))
    )
  );
  b.addEventListener('click',()=>openTrial(i));
  map.append(b);
  return b;
});

const cv=$('#fog'),cx=cv.getContext('2d');
const prog=new Map();
let raf=0;
function drawFog(){
  const w=map.clientWidth,hh=map.clientHeight;
  if(!w||!hh)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const cw=Math.round(w*dpr),ch=Math.round(hh*dpr);
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}
  cx.setTransform(dpr,0,0,dpr,0,0);
  cx.globalCompositeOperation='source-over';
  cx.clearRect(0,0,w,hh);
  cx.fillStyle='rgba(20,10,34,.68)';
  cx.fillRect(0,0,w,hh);
  cx.globalCompositeOperation='destination-out';
  done.forEach(i=>{
    const p=prog.has(i)?prog.get(i):1;
    const e=1-Math.pow(1-p,3);
    const r=w*.105*e;
    if(r<1)return;
    const x=T[i].pos[0]/IW*w,y=T[i].pos[1]/IH*hh;
    const g=cx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,'rgba(0,0,0,1)');
    g.addColorStop(.6,'rgba(0,0,0,1)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=g;
    cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.fill();
  });
}
function animFog(i){
  if(rm){drawFog();return}
  prog.set(i,0);
  let last=performance.now();
  cancelAnimationFrame(raf);
  const step=t=>{
    const dt=t-last;last=t;
    let more=false;
    prog.forEach((v,k)=>{
      if(v<1){const nv=Math.min(1,v+dt/900);prog.set(k,nv);if(nv<1)more=true}
    });
    drawFog();
    if(more)raf=requestAnimationFrame(step);
  };
  raf=requestAnimationFrame(step);
}
if(window.ResizeObserver)new ResizeObserver(drawFog).observe(map);
else addEventListener('resize',drawFog);

/* ---------- Lista ---------- */
const list=$('#list');
const tiles=[];
T.forEach((t,i)=>{
  const isLocked = !UNLOCKED_TRIALS.has(i);
  const st=h('span',{class:'tst'});
  const b=h('button',{class:'tile' + (isLocked ? ' locked' : ''),type:'button'},
    h('span',{class:'tgr'},t.gr),
    h('span',{class:'tbody'},
      h('span',{class:'tname'},t.name + (isLocked ? ' [Candado]' : '')),
      h('span',{class:'ttag'},t.tag + (isLocked ? ' · Bloqueada con candado' : ' · Desbloqueada'))
    ),
    st
  );
  b.addEventListener('click',()=>openTrial(i));
  tiles.push({b,st});
  list.append(h('li',{},b));
});

/* ---------- Casillas de contraseña ---------- */
const slotsEl=$('#slots');
const slots=[];
function focusNext(i,d){
  let j=i+d;
  while(j>=0&&j<12&&slots[j].readOnly)j+=d;
  if(j>=0&&j<12)slots[j].focus();
}
for(let i=0;i<12;i++){
  const inp=h('input',{class:'sin',id:'slot'+i,type:'text',maxlength:'2',autocomplete:'off',autocapitalize:'characters',spellcheck:'false','aria-label':`Carácter ${i+1} de 12`});
  inp.addEventListener('input',()=>{
    inp.value=inp.value.slice(-1).toUpperCase();
    if(inp.value)focusNext(i,1);
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Backspace'&&!inp.value)focusNext(i,-1);
    else if(e.key==='ArrowLeft')focusNext(i,-1);
    else if(e.key==='ArrowRight')focusNext(i,1);
    else if(e.key==='Enter')restore();
  });
  inp.addEventListener('paste',e=>{
    const txt=((e.clipboardData&&e.clipboardData.getData('text'))||'').replace(/\s/g,'').toUpperCase();
    if(!txt)return;
    e.preventDefault();
    [...txt].slice(0,12-i).forEach((c,k)=>{const sl=slots[i+k];if(!sl.readOnly)sl.value=c});
  });
  slots.push(inp);
  slotsEl.append(h('label',{class:'slot'},inp,h('span',{class:'sgr'},T[i].gr)));
}

/* ---------- Estado ---------- */
const stEl=$('#status'),countEl=$('#count'),passEl=$('#passMini');
const cursed='MALDECIDO / CORRUPTO';
const ERR=[['ERR','0x48 · hoja de estilos del templo no encontrada'],['WARN','fuente Σ desalineada en el friso principal'],['ERR','stack overflow en hidra.js:9'],['FATAL','el Olimpo Digital no responde'],['WARN','12 monstruos bloquean 12 lugares del mapa']];
const OKS=[['OK','12/12 hazañas completadas'],['OK','niebla disipada'],['OK','mapa restaurado'],['OK','el Olimpo Digital responde']];
function ticker(){
  const L=root.classList.contains('restored')?OKS:ERR;
  const mk=()=>L.map(([k,t])=>h('span',{},h('b',{},k+' '),t));
  const tr=$('#track');
  if(tr)tr.replaceChildren(...mk(),...mk());
}
function applyState(){
  stEl.textContent=root.classList.contains('restored')?'PURIFICADO':cursed;
  ticker();
}
function update(){
  const n=done.size;
  countEl.textContent=`${n}/12`;
  passEl.textContent=[...PASS].map((c,i)=>done.has(i)?c:'_').join(' ');
  pins.forEach((b,i)=>{
    b.classList.toggle('done',done.has(i));
    b.setAttribute('aria-label',`Trabajo ${i+1}: ${T[i].name}. ${done.has(i)?'Superado':'Pendiente'}`);
  });
  tiles.forEach(({b,st},i)=>{
    const isLocked = !UNLOCKED_TRIALS.has(i);
    b.classList.toggle('done',done.has(i));
    if(done.has(i)){
      st.textContent=`PURIFICADO · ${PASS[i]}`;
    } else if(isLocked){
      st.innerHTML=`${LOCK_SVG} CANDADO`;
    } else {
      st.textContent='DISPONIBLE';
    }
  });
  slots.forEach((sl,i)=>{
    if(done.has(i)){sl.value=PASS[i];sl.readOnly=true;sl.classList.add('locked')}
    else if(sl.classList.contains('locked')){sl.value='';sl.readOnly=false;sl.classList.remove('locked')}
  });
}

/* ---------- Diálogo ---------- */
const dlg=$('#dlg'),dBody=$('#dBody'),dFb=$('#dFb');
let cleanups=[];
const runCleanups=()=>{cleanups.forEach(f=>{try{f()}catch(e){}});cleanups=[]};
const fb=(t,k)=>{dFb.textContent=t||'';dFb.className='fb '+(k||'')};
function reward(i,again){
  const c=PASS[i];
  dBody.replaceChildren(h('div',{class:'reward'},
    h('div',{class:'glyph','aria-hidden':'true'},c),
    h('div',{},
      h('p',{class:'rt'},again?'Trabajo ya superado':'Trabajo superado'),
      h('p',{},`Has obtenido ${c==='.'?'el punto':'la letra'} «${c}» para la casilla ${i+1} de la contraseña.`),
      h('p',{class:'dim'},done.size===12?'Tienes los doce caracteres. Baja a la zona de desbloqueo y restaura el Olimpo.':`Llevas ${done.size} de 12 trabajos.`)),
    h('button',{class:'btn',type:'button',onclick:()=>dlg.close()},'Volver al mapa')));
}
function markDone(i,solution,validada){
  if(done.has(i))return;
  done.add(i);save();update();animFog(i);
  if(validada)return; // el servidor ya la ha comprobado (pruebas con respuesta escrita)
  // El servidor comprueba la solucion y guarda el progreso del grupo.
  fetch('/api/validate-trial',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({trial_id:i+1,solution:solution||'SOLVED'})
  }).then(r=>{
    if(r.status===401){window.location.replace('/login?msg=requerido');return null}
    return r.json();
  }).then(d=>{
    if(d&&d.success===false){
      // El servidor no lo da por bueno: se deshace el progreso local.
      done.delete(i);save();update();drawFog();
      msg(d.message||'El servidor no ha aceptado la solución.','err');
    }
  }).catch(()=>{});
}
// Comprueba una respuesta escrita en el servidor antes de dar la prueba por superada.
function validar(i,solution){
  return fetch('/api/validate-trial',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({trial_id:i+1,solution})
  }).then(r=>{
    if(r.status===401){window.location.replace('/login?msg=requerido');return {ok:false}}
    return r.json().then(d=>({ok:!!(d&&d.success),msg:d&&!d.success?'Esa no es la respuesta. Revisadlo y volved a intentarlo.':''}));
  }).catch(()=>({ok:false,msg:'No se pudo contactar con el servidor. Inténtalo de nuevo.'}));
}
function cabecera(i,story){
  const t=T[i];
  $('#dGr').textContent=t.gr;
  $('#dTitle').textContent=t.name;
  $('#dTag').textContent=`Trabajo ${i+1} de 12 · ${t.tag}`;
  $('#dStory').textContent=story||'';
}
function win(i,sol,validada){
  markDone(i,sol,validada);
  window.HeraclesJuegos.cerrar();
  runCleanups();fb('','');
  cabecera(i,'');
  if(!dlg.open)dlg.showModal();
  reward(i,false);
}
function openTrial(i){
  const t=T[i];
  const isLocked = !UNLOCKED_TRIALS.has(i);

  if (isLocked) {
    cabecera(i,'Esta prueba está sellada bajo candado arcano por mandato divino.');
    $('#dTitle').textContent = t.name + ' [CANDADO]';
    $('#dTag').textContent = `Trabajo ${i+1} de 12 · Prueba bloqueada`;
    runCleanups();fb('','');

    dBody.innerHTML = `
      <div class="lock-box">
        <svg class="lock-icon" viewBox="0 0 24 24" width="46" height="46" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h3 class="lock-title">Prueba Bloqueada</h3>
        <p class="lock-text">
          Este templo permanece custodiado bajo candado. Para continuar vuestra gesta, resolved antes las pruebas disponibles.
        </p>
        <button class="btn" type="button" id="lockOk">Entendido</button>
      </div>
    `;
    $('#lockOk').addEventListener('click',()=>dlg.close());
    if(!dlg.open) dlg.showModal();
    return;
  }

  if(done.has(i)){
    runCleanups();fb('','');
    cabecera(i,'');
    if(!dlg.open)dlg.showModal();
    reward(i,true);
    return;
  }
  if(dlg.open)dlg.close();
  window.HeraclesJuegos.abrir(i,{gr:t.gr,name:t.name,tag:t.tag},{
    onWin:(sol,validada)=>win(i,sol,validada),
    validar:sol=>validar(i,sol)
  });
}
dlg.addEventListener('close',()=>{runCleanups();dBody.replaceChildren();fb('','')});
$('#dClose').addEventListener('click',()=>dlg.close());

/* ---------- Restaurar y reiniciar ---------- */
const msgEl=$('#msg'),flash=$('#flash');
const msg=(t,k)=>{msgEl.textContent=t;msgEl.className='msg '+(k||'')};
let restoring=false;
function restore(){
  if(restoring)return;
  if(root.classList.contains('restored')){msg('El Olimpo ya está restaurado.','ok');return}
  const v=slots.map(x=>x.value.toUpperCase());
  const filled=v.filter(Boolean).length;
  if(filled<12){msg(`Faltan ${12-filled} caracteres. Supera más trabajos para revelarlos.`,'err');shakeEl(slotsEl);return}
  if(v.join('')!==PASS){msg('Esa contraseña no abre el templo. Revisa los caracteres escritos a mano.','err');shakeEl(slotsEl);return}
  if(done.size<12){msg('Aún te faltan trabajos por superar en el mapa.','err');shakeEl(slotsEl);return}
  
  msg('Comprobando la contraseña con el servidor…','ok');
  restoring=true;
  fetch('/api/verify',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({password:v.join('')})
  }).then(r=>{
    if(r.status===401){window.location.replace('/login?msg=requerido');return null}
    return r.json();
  }).then(d=>{
    restoring=false;
    if(!d)return;
    if(!d.success){msg(d.message||'El servidor no ha aceptado la contraseña.','err');shakeEl(slotsEl);return}

    msg('Contraseña correcta. Las doce hazañas se cumplen…','ok');
    flash.classList.add('go');
    if(timerInterval)clearInterval(timerInterval);

    // Tiempo calculado por el servidor, para la pantalla de victoria
    try{
      const dk=JSON.parse(localStorage.getItem('dk')||'{}');
      localStorage.setItem('dk',JSON.stringify(Object.assign({},dk,{
        completed:true,elapsed:d.elapsed,timeString:d.time
      })));
    }catch(e){}

    setTimeout(()=>{root.classList.add('restored');applyState()},420);
    setTimeout(()=>{window.location.href='/restaurada'},1500);
  }).catch(()=>{
    restoring=false;
    msg('No se pudo contactar con el servidor. Inténtalo de nuevo.','err');
  });
}
$('#restore').addEventListener('click',restore);
$('#reset').addEventListener('click', () => {
  // 1. Limpiar los conjuntos de datos en memoria
  done.clear();
  prog.clear();

  // 2. Borrar del almacenamiento local del navegador y reiniciar contador a 1.30h
  try {
    localStorage.removeItem(KEY); // Elimina 'heracles-mapa-done'
    try{const dk0=JSON.parse(localStorage.getItem("dk")||'{}');localStorage.setItem("dk",JSON.stringify({team:dk0.team,loggedAt:dk0.loggedAt}))}catch(e){} // conserva el grupo, quita la victoria
    localStorage.setItem(TIMER_KEY, (Date.now() + COUNTDOWN_SECONDS * 1000).toString());
  } catch (e) {}
  initCountdown();

  // 3. Resetear las casillas de entrada de la contraseña
  slots.forEach(sl => {
    sl.value = '';
    sl.readOnly = false;
    sl.classList.remove('locked');
  });

  // 4. Quitar la clase de estado restaurado global
  root.classList.remove('restored');
  msg('Demo reiniciada. La maldición ha vuelto.', '');

  // Notificar al backend
  try {
    fetch('/api/reset', { method: 'POST' }).catch(()=>{});
  } catch(e){}

  // 5. Forzar la actualización visual de pines, lista y niebla
  applyState();
  update();   // Al estar 'done' vacío, quita la clase .done de los pines y tiles
  drawFog();  // Vuelve a dibujar la niebla completa
});
/* ---------- Sincronizar con el servidor (fuente de verdad del progreso) ---------- */
fetch('/api/team/current').then(r=>r.json()).then(d=>{
  if(!d||!d.authenticated){window.location.replace('/login?msg=requerido');return}
  done.clear();
  (d.team.solved_trial_ids||[]).forEach(n=>{if(Number.isInteger(n)&&n>=1&&n<=12)done.add(n-1)});
  save();update();drawFog();
}).catch(()=>{});
// Cada 15 s se recogen las pruebas que la administración haya dado por superadas
// (si un grupo se atasca), sin tener que recargar el mapa.
setInterval(()=>{
  if(document.hidden)return;
  fetch('/api/team/current').then(r=>r.json()).then(d=>{
    if(!d||!d.authenticated)return;
    const nuevas=(d.team.solved_trial_ids||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=12&&!done.has(n-1));
    if(!nuevas.length)return;
    nuevas.forEach(n=>{done.add(n-1);animFog(n-1)});
    save();update();
    msg(`La administración os ha concedido: ${nuevas.map(n=>T[n-1].name).join(', ')}. Ya podéis seguir con otras pruebas.`,'ok');
  }).catch(()=>{});
},15000);

/* ---------- Texto corrupto ---------- */
function scramble(){
  if(rm||root.classList.contains('restored'))return;
  const g='ΣΞΨΩΔΛΘ#%';
  let f=0;
  const iv=setInterval(()=>{
    f++;
    if(f>5){clearInterval(iv);stEl.textContent=root.classList.contains('restored')?'PURIFICADO':cursed;return}
    stEl.textContent=[...cursed].map(c=>c===' '||c==='/'?c:Math.random()<.35?g[Math.floor(Math.random()*g.length)]:c).join('');
  },70);
}
setInterval(scramble,4200);

initCountdown();
applyState();
update();
drawFog();

try {
  const dk = JSON.parse(localStorage.getItem("dk") || "{}");
  if (dk.team) {
    const td = document.getElementById("teamDisplay");
    if (td) {
      const a = document.createElement('a');
      a.href = '/login';
      a.className = 'link-gold';
      a.textContent = dk.team;
      td.replaceChildren(a);
    }
  }
} catch (e) {}

})();