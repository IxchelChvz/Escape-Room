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
const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
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
      if (remaining <= 600 && remaining > 0) {
        timerEl.style.color = '#e5603f';
      } else if (remaining <= 0) {
        timerEl.style.color = '#e5603f';
        timerEl.textContent = '00:00:00';
        handleTimeExpired();
      } else {
        timerEl.style.color = 'var(--gold-ink)';
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

/* ---------- Tipos de prueba ---------- */
function quiz(items){
  return ctx=>{
    let k=0;
    const show=()=>{
      const it=items[k];
      const box=h('div',{class:'quiz'});
      box.append(h('p',{class:'qlabel'},it.label||`Pregunta ${k+1} de ${items.length}`));
      box.append(h('p',{class:'q'},it.q));
      if(it.code)box.append(h('pre',{class:'code'},it.code));
      const opts=h('div',{class:'opts'});
      it.opts.forEach((o,j)=>{
        const b=h('button',{class:'opt',type:'button'},o);
        b.addEventListener('click',()=>{
          if(j===it.ans){
            b.classList.add('ok');
            opts.querySelectorAll('button').forEach(x=>{x.disabled=true});
            ctx.fb('Correcto.','ok');
            if(k+1>=items.length)ctx.later(ctx.win,700);
            else ctx.later(()=>{k++;ctx.fb('','');show()},700);
          }else{
            b.classList.add('bad');b.disabled=true;
            ctx.fb(it.hint||'No es esa. Prueba otra.','err');
          }
        });
        opts.append(b);
      });
      box.append(opts);
      ctx.body.replaceChildren(box);
    };
    show();
  };
}

function order(lines,hint){
  return ctx=>{
    let pos=0;
    let pool=shuffle(lines.map((t,i)=>({t,i})));
    let guard=0;
    while(pool.every((p,j)=>p.i===j)&&guard++<10)pool=shuffle(pool);
    const placed=h('pre',{class:'code placed'});
    const refresh=()=>{placed.textContent=pos?lines.slice(0,pos).join('\n'):'// el código aparecerá aquí'};
    refresh();
    const wrap=h('div',{class:'pool'});
    pool.forEach(p=>{
      const b=h('button',{class:'line',type:'button'},p.t);
      b.addEventListener('click',()=>{
        if(p.i===pos){
          pos++;b.disabled=true;b.classList.add('used');refresh();ctx.fb('','');
          if(pos===lines.length){ctx.fb('Hidra derrotada.','ok');ctx.later(ctx.win,800)}
        }else{
          b.classList.add('bad');ctx.fb(hint,'err');
          setTimeout(()=>b.classList.remove('bad'),400);
        }
      });
      wrap.append(b);
    });
    ctx.body.replaceChildren(h('p',{class:'q'},'Pulsa las líneas en el orden correcto.'),placed,wrap);
  };
}

const ANTLER='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22V10M12 14C8 12 6 8 5 3M12 14C16 12 18 8 19 3M8.5 10L4 8M15.5 10L20 8"/></svg>';
function deer(total){
  return ctx=>{
    let n=0,delay=1100,t=0;
    const count=h('p',{class:'meter'},`Capturas: 0/${total}`);
    const arena=h('div',{class:'arena'});
    const b=h('button',{class:'deer',type:'button','aria-label':'Cierva de Cerinea'});
    b.innerHTML=ANTLER;
    arena.append(b);
    const jump=()=>{
      const w=Math.max(arena.clientWidth-56,0),hh=Math.max(arena.clientHeight-56,0);
      b.style.left=Math.round(Math.random()*w)+'px';
      b.style.top=Math.round(Math.random()*hh)+'px';
    };
    const loop=()=>{jump();t=setTimeout(loop,delay)};
    b.addEventListener('click',()=>{
      n++;count.textContent=`Capturas: ${n}/${total}`;
      clearTimeout(t);
      if(n>=total){b.disabled=true;ctx.fb('Cierva atrapada.','ok');ctx.later(ctx.win,800);return}
      delay=Math.max(480,delay-110);loop();
    });
    ctx.body.replaceChildren(count,arena);
    ctx.fb('Haz clic en la cierva antes de que salte.','');
    loop();
    ctx.reg(()=>clearTimeout(t));
  };
}

function dirt(){
  return ctx=>{
    const JUNK=['TODO','console.log','// ???','var x','debugger',';;','FIXME','temp2','alert()','//old'];
    const total=24;let left=total;
    const meter=h('p',{class:'meter'},`Desecho restante: ${left}`);
    const grid=h('div',{class:'dirt'});
    const clean=b=>{
      if(b.disabled)return;
      b.disabled=true;b.classList.add('clean');left--;
      meter.textContent=left?`Desecho restante: ${left}`:'Todo limpio.';
      if(!left){ctx.fb('Establos limpios.','ok');ctx.later(ctx.win,800)}
    };
    for(let i=0;i<total;i++){
      const b=h('button',{class:'spot',type:'button','aria-label':'Mancha de código muerto'},JUNK[i%JUNK.length]);
      b.addEventListener('click',()=>clean(b));
      grid.append(b);
    }
    grid.addEventListener('pointermove',e=>{
      if(!(e.buttons&1))return;
      const el=document.elementFromPoint(e.clientX,e.clientY);
      if(el&&el.classList&&el.classList.contains('spot'))clean(el);
    });
    ctx.body.replaceChildren(meter,grid);
    ctx.fb('Haz clic o arrastra sobre las manchas.','');
  };
}

function typos(){
  return ctx=>{
    const items=shuffle([['fucntion',1],['consle.log',1],['retrun',1],['arr.lenght',1],['documnet',1],
      ['function',0],['console.log',0],['return',0],['arr.length',0],['document',0],['const',0],['addEventListener',0]]);
    let found=0;
    const meter=h('p',{class:'meter'},'Erratas derribadas: 0/5');
    const wrap=h('div',{class:'birds'});
    items.forEach(([t,bad],i)=>{
      const b=h('button',{class:'bird',type:'button',style:`--d:${(i%5)*.4}s`},t);
      b.addEventListener('click',()=>{
        if(bad){
          b.classList.add('caught');b.disabled=true;found++;
          meter.textContent=`Erratas derribadas: ${found}/5`;ctx.fb('','');
          if(found===5){ctx.fb('Bandada derribada.','ok');ctx.later(ctx.win,800)}
        }else{
          shakeEl(b);ctx.fb('Esa palabra está bien escrita.','err');
        }
      });
      wrap.append(b);
    });
    ctx.body.replaceChildren(meter,wrap);
  };
}

function simon(len){
  return ctx=>{
    const names=['Podargo','Lampón','Janto','Dinos'];
    const seq=Array.from({length:len},()=>Math.floor(Math.random()*4));
    let dead=false,lock=true,pos=0;
    ctx.reg(()=>{dead=true});
    const pads=names.map((nm,k)=>{
      const b=h('button',{class:`pad p${k}`,type:'button',disabled:'true'},nm);
      b.addEventListener('click',()=>press(k));
      return b;
    });
    const play=async()=>{
      lock=true;pos=0;pads.forEach(p=>{p.disabled=true});
      ctx.fb('Memoriza el orden…','');
      await sleep(500);
      for(const k of seq){
        if(dead)return;
        pads[k].classList.add('lit');await sleep(520);
        pads[k].classList.remove('lit');await sleep(240);
      }
      if(dead)return;
      pads.forEach(p=>{p.disabled=false});lock=false;ctx.fb('Tu turno.','');
    };
    const press=async k=>{
      if(lock)return;
      pads[k].classList.add('lit');setTimeout(()=>pads[k].classList.remove('lit'),180);
      if(k===seq[pos]){
        pos++;
        if(pos===len){lock=true;ctx.fb('Las yeguas se calman.','ok');ctx.later(ctx.win,800)}
      }else{
        lock=true;ctx.fb('Orden incorrecto. Mira otra vez.','err');
        await sleep(900);
        if(!dead)play();
      }
    };
    const start=h('button',{class:'btn',type:'button'},`Empezar (${len} pasos)`);
    start.addEventListener('click',()=>{start.hidden=true;play()});
    ctx.body.replaceChildren(h('div',{class:'pads'},...pads),start);
  };
}

function pairs(){
  return ctx=>{
    const P=[['<nav>','Menú de navegación'],['<footer>','Pie de página'],['<a>','Enlace a otra página'],['<img>','Imagen incrustada']];
    let sel=null,left=P.length;
    const L=h('div',{class:'col'}),R=h('div',{class:'col'});
    const lb=P.map(([t],i)=>{
      const b=h('button',{class:'pair',type:'button'},t);
      b.addEventListener('click',()=>{
        if(b.disabled)return;
        lb.forEach(x=>x.classList.remove('sel'));
        sel=i;b.classList.add('sel');ctx.fb('','');
      });
      L.append(b);
      return b;
    });
    shuffle(P.map(([,d],i)=>({d,i}))).forEach(o=>{
      const b=h('button',{class:'pair desc',type:'button'},o.d);
      b.addEventListener('click',()=>{
        if(b.disabled)return;
        if(sel===null){ctx.fb('Elige primero una etiqueta.','err');return}
        if(sel===o.i){
          lb[sel].disabled=true;lb[sel].classList.remove('sel');lb[sel].classList.add('ok');
          b.disabled=true;b.classList.add('ok');sel=null;left--;ctx.fb('','');
          if(!left){ctx.fb('Cinturón entregado.','ok');ctx.later(ctx.win,800)}
        }else{
          b.classList.add('bad');ctx.fb('Esa no es su función.','err');
          setTimeout(()=>b.classList.remove('bad'),400);
        }
      });
      R.append(b);
    });
    ctx.body.replaceChildren(h('p',{class:'q'},'Une cada etiqueta con su función.'),h('div',{class:'cols'},L,R));
  };
}

function cipher(text,answer){
  return ctx=>{
    const inp=h('input',{id:'cipherIn',class:'cin',type:'text',autocomplete:'off',autocapitalize:'characters',spellcheck:'false',maxlength:'16',placeholder:'Escribe el nombre','aria-label':'Texto descifrado'});
    const go=h('button',{class:'btn',type:'submit'},'Descifrar');
    const form=h('form',{class:'cform'},inp,go);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(inp.value.trim().toUpperCase()===answer){
        inp.disabled=true;go.disabled=true;ctx.fb('Las manzanas son tuyas.','ok');ctx.later(ctx.win,800);
      }else{
        shakeEl(form);ctx.fb('No coincide. Retrocede tres letras: la K pasa a ser H.','err');
      }
    });
    ctx.body.replaceChildren(
      h('p',{class:'q'},'Texto cifrado:'),
      h('p',{class:'cipher'},text),
      h('p',{class:'dim'},'Pista: cada letra avanzó 3 posiciones. Para descifrar, retrocede 3 (D vuelve a ser A).'),
      form
    );
  };
}

/* ---------- Los doce trabajos y su lugar en el mapa ---------- */
const T=[
  {gr:'Α',name:'El León de Nemea',tag:'CSS',pos:[1315,528],
   story:'Ninguna flecha atraviesa la piel del león, y ninguna regla de estilo lo mueve de su guarida. Céntralo en el friso para debilitarlo.',
   run:quiz([{q:'Falta la propiedad que centra al león en vertical dentro del contenedor flex.',
     code:'.guarida {\n  display: flex;\n  justify-content: center;\n  ___: center;\n}',
     opts:['align-items','text-align','vertical-align','float'],ans:0,hint:'En flexbox, el eje cruzado se alinea con otra propiedad.'}])},
  {gr:'Β',name:'La Hidra de Lerna',tag:'JavaScript · bucles',pos:[1480,672],
   story:'Por cada cabeza cortada nacen dos más, salvo que cada muñón se cauterice. Ordena el código para cortar las nueve cabezas.',
   run:order(['for (let i = 0; i < 9; i++) {','  cortarCabeza(i);','  quemarMuñon(i);','}'],'Esa línea no va ahora. Primero se corta la cabeza y luego se quema el muñón.')},
  {gr:'Γ',name:'La Cierva de Cerinea',tag:'JavaScript · eventos',pos:[735,372],
   story:'La cierva corre más rápido que cualquier flecha y cada vez salta antes. Atrápala con un clic seis veces.',
   run:deer(6)},
  {gr:'Δ',name:'El Jabalí de Erimanto',tag:'HTML · accesibilidad',pos:[445,392],
   story:'El jabalí arrasa el marcado y deja imágenes sin descripción. Repara la etiqueta para que un lector de pantalla pueda describirla.',
   run:quiz([{q:'¿Qué atributo falta en la imagen para que tenga texto alternativo?',
     code:'<img src="jabali.png" ___="Jabalí de Erimanto">',
     opts:['alt','href','name','rel'],ans:0,hint:'Es el atributo que describe la imagen cuando no se puede ver.'}])},
  {gr:'Ε',name:'Los Establos de Augías',tag:'Código limpio',pos:[212,502],
   story:'Los establos acumulan décadas de código muerto. Barre todo el desecho: haz clic o arrastra sobre las manchas.',
   run:dirt()},
  {gr:'Ζ',name:'Las Aves del Estínfalo',tag:'Depuración',pos:[545,500],
   story:'Una bandada de aves de bronce ha anidado en el código. Derriba solo las cinco palabras mal escritas.',
   run:typos()},
  {gr:'Η',name:'El Toro de Creta',tag:'Flask · HTTP',pos:[1090,925],
   story:'El toro se ha escapado del laberinto y nadie sabe dónde está. Averigua qué responde el servidor cuando la ruta no existe.',
   run:quiz([{q:'Un cliente pide /minotauro y esa ruta no está definida en la app Flask. ¿Qué código HTTP recibe?',
     code:'@app.route("/toro")\ndef toro():\n    return "Mu", 200',
     opts:['200 OK','301 Moved','404 Not Found','500 Server Error'],ans:2,hint:'La ruta no existe: el recurso no se encuentra.'}])},
  {gr:'Θ',name:'Las Yeguas de Diomedes',tag:'Memoria',pos:[1618,375],
   story:'Las yeguas devoran a quien se distrae. Memoriza el orden en que se encabritan y repítelo.',
   run:simon(5)},
  {gr:'Ι',name:'El Cinturón de Hipólita',tag:'HTML semántico',pos:[1750,525],
   story:'Hipólita entregará el cinturón si reconoces cada pieza del templo. Une cada etiqueta con su función.',
   run:pairs()},
  {gr:'Κ',name:'Los Bueyes de Gerión',tag:'JavaScript · tipos',pos:[560,740],
   story:'Gerión tiene tres cuerpos y todos parecen el mismo buey. Descubre qué devuelve la comparación estricta.',
   run:quiz([{q:'¿Qué muestra la consola?',code:"console.log('3' === 3);",
     opts:['true','false','undefined','TypeError'],ans:1,hint:'El operador === compara el valor y también el tipo.'}])},
  {gr:'Λ',name:'Las Manzanas de las Hespérides',tag:'Criptografía',pos:[325,690],
   story:'El dragón Ladón vigila el jardín con un cifrado César. Descifra el nombre del héroe para entrar.',
   run:cipher('KHUFXOHV','HERCULES')},
  {gr:'Μ',name:'Cerbero',tag:'Python · SQL · Linux',pos:[1810,770],
   story:'El guardián del inframundo tiene tres cabezas y cada una exige una respuesta distinta. Calma a las tres.',
   run:quiz([
     {label:'Cabeza 1 de 3 · Python',q:'¿Qué devuelve esta expresión?',code:'len(["a", "b", "c"])',opts:['2','3','4','Error'],ans:1,hint:'len cuenta los elementos de la lista.'},
     {label:'Cabeza 2 de 3 · SQL',q:'¿Qué palabra elimina las filas repetidas en un SELECT?',code:'SELECT ___ nombre FROM monstruos;',opts:['DISTINCT','UNIQUE','GROUP','DROP'],ans:0,hint:'Una de ellas se usa justo después de SELECT.'},
     {label:'Cabeza 3 de 3 · Linux',q:'¿Qué comando lista también los archivos ocultos?',opts:['ls -a','ls -h','cd -a','rm -a'],ans:0,hint:'La opción viene de «all».'}
   ])}
];


/* ---------- Configuracion de Candados: solo 3, 11 y 12 desbloqueadas ---------- */
const UNLOCKED_TRIALS = new Set([2, 10, 11]); // Trabajos 3 (Cierva), 11 (Hespérides), 12 (Cerbero)
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
function markDone(i){
  if(done.has(i))return;
  done.add(i);save();update();animFog(i);
  try {
    let currentTeam = 'Héroes del Código';
    try {
      const dk = JSON.parse(localStorage.getItem('dk') || '{}');
      if (dk && dk.team) currentTeam = dk.team;
    } catch(e){}
    fetch('/api/validate-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trial_id: i + 1, solution: 'SOLVED', team_name: currentTeam })
    }).catch(()=>{});
  } catch(e){}
}
function win(i){
  markDone(i);
  runCleanups();fb('','');
  reward(i,false);
}
function openTrial(i){
  const t=T[i];
  const isLocked = !UNLOCKED_TRIALS.has(i);

  if (isLocked) {
    $('#dGr').textContent = t.gr;
    $('#dTitle').textContent = t.name + ' [CANDADO]';
    $('#dTag').textContent = `Trabajo ${i+1} de 12 · Prueba bloqueada`;
    $('#dStory').textContent = 'Esta prueba está sellada bajo candado arcano por mandato divino. Solo las pruebas 3, 11 y 12 están disponibles.';
    runCleanups();fb('','');

    dBody.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem;">
        <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#e0a82e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1.25rem;display:block;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h3 style="color:var(--gold-ink);font-family:var(--f-display);font-size:1.35rem;margin:0 0 0.5rem 0;">Prueba Bloqueada</h3>
        <p style="color:var(--dim);font-family:var(--f-mono);font-size:0.9rem;max-width:44ch;margin:0 auto 1.5rem;line-height:1.5;">
          Este templo permanece custodiado bajo candado. Para continuar vuestra gesta, debéis resolver las pruebas desbloqueadas (3, 11 y 12).
        </p>
        <button class="btn" type="button" onclick="document.getElementById('dlg').close()">Entendido</button>
      </div>
    `;
    if(!dlg.open) dlg.showModal();
    return;
  }

  $('#dGr').textContent=t.gr;
  $('#dTitle').textContent=t.name;
  $('#dTag').textContent=`Trabajo ${i+1} de 12 · ${t.tag}`;
  $('#dStory').textContent=t.story;
  runCleanups();fb('','');
  if(!dlg.open)dlg.showModal();
  if(done.has(i)){reward(i,true);return}
  const ctx={
    body:dBody,fb,
    win:()=>win(i),
    reg:f=>cleanups.push(f),
    later:(f,ms)=>{
      if(f===ctx.win)markDone(i);
      const x=setTimeout(f,ms);cleanups.push(()=>clearTimeout(x));
    }
  };
  t.run(ctx);
}
dlg.addEventListener('close',()=>{runCleanups();dBody.replaceChildren();fb('','')});
$('#dClose').addEventListener('click',()=>dlg.close());

/* ---------- Restaurar y reiniciar ---------- */
const msgEl=$('#msg'),flash=$('#flash');
const msg=(t,k)=>{msgEl.textContent=t;msgEl.className='msg '+(k||'')};
function restore(){
  if(root.classList.contains('restored')){msg('El Olimpo ya está restaurado.','ok');return}
  const v=slots.map(x=>x.value.toUpperCase());
  const filled=v.filter(Boolean).length;
  if(filled<12){msg(`Faltan ${12-filled} caracteres. Supera más trabajos para revelarlos.`,'err');shakeEl(slotsEl);return}
  if(v.join('')!==PASS){msg('Esa contraseña no abre el templo. Revisa los caracteres escritos a mano.','err');shakeEl(slotsEl);return}
  if(done.size<12){msg('Aún te faltan trabajos por superar en el mapa.','err');shakeEl(slotsEl);return}
  
  msg('Contraseña correcta. Las doce hazañas se cumplen…','ok');
  flash.classList.add('go');
  
  // Calcular tiempo invertido y detener cuenta atras
  const endTime = getEndTime();
  const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  const elapsed = Math.max(1, COUNTDOWN_SECONDS - remaining);
  if (timerInterval) clearInterval(timerInterval);

  // Guardamos la bandera de victoria para la siguiente pantalla
  let activeTeam = "Héroes del Código";
  try {
    const dk = JSON.parse(localStorage.getItem("dk") || "{}");
    if (dk.team) activeTeam = dk.team;
    localStorage.setItem("dk", JSON.stringify(Object.assign({}, dk, {
      team: activeTeam,
      completed: true,
      elapsed: elapsed,
      timeString: formatCountdown(elapsed)
    })));
  } catch(e){}

  // Llamada al backend para validar y registrar la finalización
  try {
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: v.join(''), team: activeTeam, elapsed: elapsed })
    }).catch(()=>{});
  } catch(e){}

  setTimeout(()=>{
    root.classList.add('restored');
    applyState();
  }, 420);

  // REDIRECCIÓN AUTOMÁTICA A LA PÁGINA RESTAURADA
  setTimeout(()=>{
    // Si estás en Flask, usa la ruta correspondiente de tu servidor
    window.location.href = "/restaurada"; 
  }, 1500);
}
$('#restore').addEventListener('click',restore);
$('#reset').addEventListener('click', () => {
  // 1. Limpiar los conjuntos de datos en memoria
  done.clear();
  prog.clear();

  // 2. Borrar del almacenamiento local del navegador y reiniciar contador a 1.30h
  try {
    localStorage.removeItem(KEY); // Elimina 'heracles-mapa-done'
    localStorage.removeItem("dk"); // Elimina datos del equipo
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
    if (td) td.innerHTML = '<a href="/login" style="color:var(--gold-ink);text-decoration:none;">' + dk.team + '</a>';
  }
} catch (e) {}

})();