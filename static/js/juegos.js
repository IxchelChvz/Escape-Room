/* HERACLES.EXE · Minijuegos de los doce trabajos
   Cada prueba se juega en un canvas emergente (<dialog id="juego">) con la estética de pergamino
   del mapa. El canvas trabaja en coordenadas lógicas de 800x500 y se escala al tamaño real.
   Reglas comunes: cada juego tiene tiempo límite y los errores se castigan con una espera
   (el oráculo os retiene). Las esperas se guardan: cerrar la ventana no las salta.
   main.js abre una prueba con HeraclesJuegos.abrir(i, meta, host):
     host.onWin(solucion, yaValidada) -> se llama al superar la prueba
     host.validar(solucion)           -> Promise<{ok, msg}> (pruebas con respuesta escrita) */
(()=>{
'use strict';

const W=800,H=500,TAU=Math.PI*2;
// Paleta del pergamino (la misma que el diálogo de las pruebas en styles.css)
const P={papel:'#f3e8c8',papel2:'#ead9ae',papel3:'#e2cc96',linea:'#b79b62',tinta:'#2a1c0d',dim:'#6a5535',
  oro:'#b9821a',oroT:'#7a4f00',alerta:'#9b2f1f',acento:'#1f4a6b',oliva:'#5d6b2f'};
const F_TIT='Cinzel,Georgia,serif';
const F_UI='"Alegreya Sans","Segoe UI",system-ui,sans-serif';
const F_MONO='"JetBrains Mono",Consolas,monospace';

const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[ri(0,a.length-1)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=ri(0,i);[b[i],b[j]]=[b[j],b[i]]}return b};
const lerp=(a,b,t)=>a+(b-a)*t;
const dentro=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
const mmss=s=>{s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Sonido (Web Audio, sin archivos) ---------- */
const Sfx=(()=>{
  let ac=null;
  const ctx=()=>{
    if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
    if(ac.state==='suspended')ac.resume();
    return ac;
  };
  const tone=(f,d=.12,type='sine',vol=.14,slide=0,delay=0)=>{
    const a=ctx();if(!a)return;
    const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.03);
  };
  return {
    unlock:ctx,
    tick:()=>tone(880,.03,'square',.035),
    pop:()=>tone(520,.07,'triangle',.09,240),
    ok:()=>{tone(660,.09,'triangle');tone(990,.13,'triangle',.13,0,.08)},
    bad:()=>tone(170,.3,'sawtooth',.09,-80),
    win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.15,0,i*.11)),
    note:k=>tone([330,392,494,587][k],.3,'triangle',.18),
    gong:()=>{tone(110,.9,'sine',.2,-20);tone(220,.6,'triangle',.06)}
  };
})();

/* ---------- Iconos de trazo (24x24, como la cornamenta de la cierva original) ---------- */
const ICO={
  asta:'M12 22V10M12 14C8 12 6 8 5 3M12 14C16 12 18 8 19 3M8.5 10L4 8M15.5 10L20 8',
  carpeta:'M3 7h6l2 2h10v10H3z',
  disquete:'M4 4h13l3 3v13H4zM8 4v5h8V4M8 20v-6h8v6',
  nota:'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0M20 16a3 3 0 1 1-6 0a3 3 0 1 1 6 0',
  campana:'M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',
  estrella:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  candado:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  toro:'M3 5c0 4 3 5 5 5M21 5c0 4-3 5-5 5M8 9h8l-1 9h-6zM10 13h.01M14 13h.01M10 18l2 2 2-2',
  arco:'M5 21V10a7 7 0 0 1 14 0v11M3 21h18M9 21v-8a3 3 0 0 1 6 0v8',
  reloj:'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  ojo:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6',
  oreja:'M7 9a5 5 0 0 1 10 0c0 4-4 5-4 8a3 3 0 0 1-6 0M10 10a2 2 0 0 1 4 0',
  pergamino:'M6 4h11a2 2 0 0 1 0 4H8v12a2 2 0 0 1-2 2 2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM11 12h6M11 16h6',
  papelera:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
  copiar:'M8 8h12v12H8zM4 16V4h12',
  pegar:'M8 3h8v3H8zM6 5H4v16h16V5h-2M8 12h8M8 16h8',
  cortar:'M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM8.5 7.5L20 18M8.5 16.5L20 6',
  deshacer:'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  rehacer:'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
  buscar:'M10 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM15 15l6 6',
  reemplazar:'M4 7h13l-3-3M20 17H7l3 3',
  imprimir:'M6 9V3h12v6M6 18H4V9h16v9h-2M6 14h12v7H6z',
  seleccionar:'M4 4h3M10 4h4M17 4h3v3M20 10v4M20 17v3h-3M14 20h-4M7 20H4v-3M4 14v-4M4 7V4',
  caballo:'M8 21l1-6-4-3 2-5 5-3 5 1 3 5-2 2-3-1-1 3 3 7M11 8h.01',
  gema:'M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l3 18M15 3l-3 18'
};
const cacheIco={};
function icono(c,nombre,x,y,tam,col=P.tinta,grosor=2){
  const p=cacheIco[nombre]||(cacheIco[nombre]=new Path2D(ICO[nombre]));
  c.save();c.translate(x-tam/2,y-tam/2);c.scale(tam/24,tam/24);
  c.lineWidth=grosor*24/tam;c.lineCap='round';c.lineJoin='round';c.strokeStyle=col;c.stroke(p);c.restore();
}

/* ---------- Ayudas de dibujo en estilo pergamino ---------- */
function txt(c,s,x,y,o={}){
  c.font=`${o.weight||700} ${o.size||18}px ${o.font||F_UI}`;
  c.textAlign=o.align||'center';c.textBaseline=o.base||'middle';
  c.fillStyle=o.color||P.tinta;c.fillText(s,x,y);
}
function caja(c,x,y,w,h,o={}){
  if(o.fondo!==null){c.fillStyle=o.fondo||P.papel;c.fillRect(x,y,w,h)}
  c.lineWidth=o.grosor||1;c.strokeStyle=o.borde||P.linea;
  if(o.discontinua)c.setLineDash([5,4]);
  c.strokeRect(x+.5,y+.5,w-1,h-1);c.setLineDash([]);
}
function boton(c,b,label,hover,col=P.oroT){
  c.fillStyle=hover?col:P.papel;c.fillRect(b.x,b.y,b.w,b.h);
  c.lineWidth=2;c.strokeStyle=col;c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);
  txt(c,label,b.x+b.w/2,b.y+b.h/2+1,{size:b.size||17,font:F_TIT,color:hover?P.papel:col});
}
function envolver(c,texto,maxW){
  const out=[];let linea='';
  texto.split(' ').forEach(p=>{const prueba=linea?linea+' '+p:p;if(c.measureText(prueba).width>maxW&&linea){out.push(linea);linea=p}else linea=prueba});
  if(linea)out.push(linea);
  return out;
}
// Fondo de pergamino con fibras (se pinta una vez y se reutiliza)
const papelCv=document.createElement('canvas');papelCv.width=W;papelCv.height=H;
(()=>{
  const k=papelCv.getContext('2d');
  k.fillStyle=P.papel;k.fillRect(0,0,W,H);
  for(let n=0;n<900;n++){
    k.strokeStyle=`rgba(${pick(['122,79,0','90,60,25','183,155,98'])},${rnd(.03,.08)})`;
    k.lineWidth=rnd(.5,1.4);const x=rnd(0,W),y=rnd(0,H),a=rnd(0,TAU),l=rnd(4,18);
    k.beginPath();k.moveTo(x,y);k.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);k.stroke();
  }
  const g=k.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(122,79,0,.16)');k.fillStyle=g;k.fillRect(0,0,W,H);
})();
function papel(c){c.drawImage(papelCv,0,0,W,H)}
function marco(c){
  c.lineWidth=1;c.strokeStyle=P.linea;c.strokeRect(6.5,6.5,W-13,H-13);
  c.lineWidth=2;c.strokeStyle=P.oro;c.strokeRect(10,10,W-20,H-20);
}
function rayado(c,x,y,w,h,paso=24){
  c.strokeStyle='rgba(183,155,98,.45)';c.lineWidth=1;c.beginPath();
  for(let k=x+paso;k<x+w;k+=paso){c.moveTo(k+.5,y);c.lineTo(k+.5,y+h)}
  c.stroke();
}

/* ---------- Esperas guardadas: cerrar la ventana no las salta ---------- */
const KEY_ESPERA='heracles-esperas';
const leerEsperas=()=>{try{return JSON.parse(localStorage.getItem(KEY_ESPERA)||'{}')||{}}catch(e){return {}}};
const guardarEspera=(i,hasta,motivo)=>{try{const e=leerEsperas();if(hasta)e[i]={hasta,motivo};else delete e[i];localStorage.setItem(KEY_ESPERA,JSON.stringify(e))}catch(err){}};

/* ---------- Motor: una sesión por partida ---------- */
const dlg=document.getElementById('juego');
const cv=document.getElementById('jCanvas');
const hudEl=document.getElementById('jHud');
const form=document.getElementById('jForm');
const input=document.getElementById('jInput');
const jGr=document.getElementById('jGr'),jTag=document.getElementById('jTag'),jTitle=document.getElementById('jTitle');
if(!dlg||!cv)return;
const c=cv.getContext('2d');

function ajustar(){
  const r=cv.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);
  if(cw&&ch&&(cv.width!==cw||cv.height!==ch)){cv.width=cw;cv.height=ch}
}
if(window.ResizeObserver)new ResizeObserver(ajustar).observe(cv);

let S=null; // sesión activa

function crearSesion(idx,def,meta,host){
  const s={idx,def,meta,host,estado:'intro',juego:null,t:0,parts:[],sacudida:0,fin:null,timers:[],raf:0,ultimo:0,
    raton:{x:-99,y:-99},enviar:null,vivo:true,resto:0,marcador:'',espera:null,aviso:null};
  const BTN={x:300,y:400,w:200,h:48};
  const g={
    W,H,c,sfx:Sfx,host,P,
    get t(){return s.t},
    get bloqueado(){return !!(s.espera||s.fin)},
    hud:t=>{hudEl.textContent=t||''},
    marcador:t=>{s.marcador=t||''},
    cursor:k=>{cv.style.cursor=k||'default'},
    luego:(ms,fn)=>{const id=setTimeout(()=>{if(s.vivo)fn()},ms);s.timers.push(id);return id},
    sacudir:(n=8)=>{if(!rm)s.sacudida=n},
    chispas:(x,y,n=18,cols=[P.oro,P.oroT,P.papel3])=>{
      for(let k=0;k<n;k++){const a=rnd(0,TAU),v=rnd(60,240);s.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,vida:rnd(.4,.9),max:.9,col:pick(cols),r:rnd(2,4)})}
    },
    pedir:(placeholder,fn)=>{
      s.enviar=fn;form.hidden=false;input.value='';input.placeholder=placeholder;input.disabled=false;
      setTimeout(()=>{if(s.vivo&&!s.espera)input.focus()},60);
    },
    ocultarForm:()=>{form.hidden=true;s.enviar=null},
    aviso:(t,seg=1.6)=>{s.aviso={t,hasta:s.t+seg}},
    // Error: el juego queda congelado unos segundos y luego sigue donde estaba
    error:(seg,motivo)=>{
      Sfx.bad();g.sacudir(9);
      if(seg<=3){s.espera={hasta:Date.now()+seg*1000,motivo,modo:'seguir',corta:true};return}
      s.espera={hasta:Date.now()+seg*1000,motivo,modo:'seguir'};
      guardarEspera(idx,s.espera.hasta,motivo);
      input.disabled=true;
    },
    // Derrota: espera de castigo y después una partida nueva
    fallar:(motivo,seg)=>{
      if(s.fin||s.espera&&s.espera.modo==='reiniciar')return;
      Sfx.gong();g.sacudir(14);g.ocultarForm();
      s.espera={hasta:Date.now()+seg*1000,motivo,modo:'reiniciar'};
      guardarEspera(idx,s.espera.hasta,motivo);
      g.hud(`${motivo} Penalización: ${seg} s de espera.`);
    },
    ganar:(sol,validada)=>{
      if(s.fin)return;
      s.fin={t:0};Sfx.win();g.ocultarForm();guardarEspera(idx,0);
      for(let k=0;k<3;k++)g.chispas(rnd(200,600),rnd(150,320),26);
      g.hud('¡Trabajo superado!');
      g.luego(1700,()=>host.onWin(sol,!!validada));
    }
  };
  s.g=g;

  const empezar=()=>{
    s.timers.forEach(clearTimeout);s.timers=[];
    s.parts=[];s.fin=null;s.espera=null;s.aviso=null;s.t=0;s.marcador='';g.ocultarForm();g.cursor('default');
    s.estado='juego';s.resto=def.limite||0;
    g.hud(def.hud||'');
    s.juego=def.start(g);
    cv.focus({preventScroll:true});
  };

  const loc=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}};
  s.down=e=>{
    Sfx.unlock();
    const p=loc(e);s.raton=p;
    try{cv.setPointerCapture(e.pointerId)}catch(err){}
    if(s.espera||s.fin)return;
    if(s.estado==='intro'){if(dentro(p,BTN))empezar();return}
    s.juego&&s.juego.down&&s.juego.down(p);
  };
  s.move=e=>{
    const p=loc(e);s.raton=p;
    if(s.espera||s.fin){cv.style.cursor='default';return}
    if(s.estado==='intro'){cv.style.cursor=dentro(p,BTN)?'pointer':'default';return}
    s.juego&&s.juego.move&&s.juego.move(p);
  };
  s.up=e=>{if(s.espera||s.fin||s.estado!=='juego')return;s.juego&&s.juego.up&&s.juego.up(loc(e))};
  s.key=e=>{
    if(document.activeElement===input)return;
    if(s.espera||s.fin){if(e.key===' '||e.key.startsWith('Arrow'))e.preventDefault();return}
    if(s.estado==='intro'){if(e.key==='Enter'||e.key===' '){e.preventDefault();Sfx.unlock();empezar()}return}
    if(s.juego&&s.juego.key&&s.juego.key(e))e.preventDefault();
  };

  const paso=now=>{
    if(!s.vivo)return;
    const dt=Math.min(.05,(now-(s.ultimo||now))/1000);s.ultimo=now;s.t+=dt;
    // fin de una espera
    if(s.espera&&Date.now()>=s.espera.hasta){
      const modo=s.espera.modo;s.espera=null;guardarEspera(idx,0);input.disabled=false;
      if(modo==='reiniciar')empezar();
      else if(modo==='intro'){s.estado='intro';g.hud('Lee las instrucciones y pulsa «Comenzar» (o la tecla Intro).')}
      else if(!form.hidden)input.focus();
    }
    c.setTransform(cv.width/W,0,0,cv.height/H,0,0);
    c.save();
    if(s.sacudida>.2){c.translate(rnd(-1,1)*s.sacudida,rnd(-1,1)*s.sacudida);s.sacudida*=.85}
    if(s.estado==='intro'){
      papel(c);
      if(!s.espera)dibujarIntro();
    }else{
      const activo=!s.espera&&!s.fin;
      if(activo){
        s.juego.update&&s.juego.update(dt);
        if(def.limite&&s.estado==='juego'){s.resto-=dt;if(s.resto<=0){s.resto=0;g.fallar('¡Se acabó el tiempo!',def.castigo||15)}}
      }
      s.juego.draw(c);
      dibujarCabecera();
      s.parts=s.parts.filter(q=>(q.vida-=dt)>0);
      s.parts.forEach(q=>{q.vy+=380*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;c.globalAlpha=clamp(q.vida/q.max,0,1);c.fillStyle=q.col;c.fillRect(q.x-q.r/2,q.y-q.r/2,q.r,q.r)});
      c.globalAlpha=1;
      if(s.aviso&&s.t<s.aviso.hasta&&!s.espera)dibujarAviso(s.aviso.t,P.oroT);
      if(s.fin)dibujarVictoria(dt);
    }
    if(s.espera)dibujarEspera();
    marco(c);
    c.restore();
    s.raf=requestAnimationFrame(paso);
  };

  function dibujarCabecera(){
    c.fillStyle='rgba(243,232,200,.94)';c.fillRect(14,14,W-28,34);
    c.strokeStyle=P.linea;c.lineWidth=1;c.beginPath();c.moveTo(14,48.5);c.lineTo(W-14,48.5);c.stroke();
    txt(c,s.marcador,28,31,{size:15,font:F_MONO,weight:600,align:'left',color:P.dim});
    if(def.limite){
      const urg=s.resto<=10;
      icono(c,'reloj',W-150,31,18,urg?P.alerta:P.oroT);
      txt(c,mmss(s.resto),W-126,31,{size:17,font:F_MONO,align:'left',color:urg?P.alerta:P.tinta});
      c.fillStyle='rgba(183,155,98,.35)';c.fillRect(W-78,26,56,8);
      c.fillStyle=urg?P.alerta:P.oro;c.fillRect(W-78,26,56*clamp(s.resto/def.limite,0,1),8);
    }
  }
  function dibujarIntro(){
    caja(c,120,58,560,402,{fondo:'rgba(243,232,200,.97)',borde:P.oro,grosor:2});
    caja(c,128,66,544,386,{fondo:null,borde:P.linea});
    c.lineWidth=2;c.strokeStyle=P.oro;c.strokeRect(W/2-26,80,52,52);
    txt(c,meta.gr,W/2,107,{size:30,font:F_TIT,weight:900,color:P.oroT});
    txt(c,meta.name.toUpperCase(),W/2,160,{size:22,font:F_TIT,weight:900});
    c.font=`500 18px ${F_UI}`;
    let y=198;
    (def.how||[]).forEach(par=>{envolver(c,par,480).forEach(l=>{txt(c,l,W/2,y,{size:18,weight:500,color:P.dim});y+=25});y+=6});
    const reglas=[];
    if(def.limite)reglas.push(`Tiempo: ${mmss(def.limite)}`);
    if(def.penal)reglas.push(def.penal);
    if(reglas.length){
      c.strokeStyle=P.linea;c.beginPath();c.moveTo(200,y+2.5);c.lineTo(600,y+2.5);c.stroke();
      txt(c,reglas.join('   ·   '),W/2,y+22,{size:14,font:F_MONO,weight:600,color:P.alerta});
    }
    boton(c,BTN,'COMENZAR',dentro(s.raton,BTN));
  }
  function dibujarAviso(t,col){
    // def.aviso permite colocarlo donde no tape los controles del juego
    const ax=def.aviso?def.aviso.x:W/2,ay=def.aviso?def.aviso.y:440,maxW=def.aviso?def.aviso.w:620;
    c.font=`700 17px ${F_UI}`;const w=Math.min(maxW,c.measureText(t).width+44);
    caja(c,ax-w/2,ay,w,36,{fondo:P.papel,borde:col,grosor:2});
    txt(c,t,ax,ay+19,{size:17,color:col});
  }
  function dibujarEspera(){
    const e=s.espera,resto=(e.hasta-Date.now())/1000;
    if(e.corta){dibujarAviso(`${e.motivo}  (${resto.toFixed(1)} s)`,P.alerta);return}
    c.fillStyle='rgba(243,232,200,.9)';c.fillRect(0,0,W,H);
    caja(c,170,110,460,280,{fondo:P.papel,borde:P.alerta,grosor:2});
    caja(c,178,118,444,264,{fondo:null,borde:P.linea});
    const giro=rm?0:Math.sin(s.t*2)*.15;
    c.save();c.translate(W/2,168);c.rotate(giro);icono(c,'reloj',0,0,46,P.alerta,2.2);c.restore();
    txt(c,'EL ORÁCULO OS RETIENE',W/2,222,{size:20,font:F_TIT,weight:900,color:P.alerta});
    c.font=`500 18px ${F_UI}`;
    envolver(c,e.motivo,400).slice(0,2).forEach((l,k)=>txt(c,l,W/2,256+k*24,{size:18,weight:500,color:P.dim}));
    txt(c,mmss(resto),W/2,330,{size:40,font:F_MONO,color:P.tinta});
    txt(c,e.modo==='reiniciar'?'Después empezará una partida nueva':'Después podréis seguir',W/2,366,{size:14,font:F_MONO,weight:600,color:P.dim});
  }
  function dibujarVictoria(dt){
    s.fin.t+=dt;const k=Math.min(1,s.fin.t*2.5);
    c.fillStyle=`rgba(243,232,200,${.85*k})`;c.fillRect(0,0,W,H);
    c.save();c.translate(W/2,H/2);c.scale(.7+.3*k,.7+.3*k);
    caja(c,-220,-70,440,140,{fondo:P.papel,borde:P.oro,grosor:2});
    txt(c,'TRABAJO SUPERADO',0,-18,{size:30,font:F_TIT,weight:900,color:P.oroT});
    txt(c,'La niebla se disipa sobre el mapa…',0,26,{size:18,weight:500,color:P.dim});
    c.restore();
  }

  s.iniciar=()=>{
    const pend=leerEsperas()[idx];
    if(pend&&pend.hasta>Date.now()){
      s.espera={hasta:pend.hasta,motivo:pend.motivo||'Todavía estáis penalizados en esta prueba.',modo:'intro'};
      g.hud('Esta prueba sigue penalizada: esperad a que termine la cuenta atrás.');
    }else g.hud('Lee las instrucciones y pulsa «Comenzar» (o la tecla Intro).');
    s.raf=requestAnimationFrame(paso);
  };
  s.cerrar=()=>{
    s.vivo=false;cancelAnimationFrame(s.raf);s.timers.forEach(clearTimeout);
    s.juego&&s.juego.cerrar&&s.juego.cerrar();
    form.hidden=true;s.enviar=null;input.disabled=false;cv.style.cursor='default';
    try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}
  };
  return s;
}

cv.addEventListener('pointerdown',e=>{if(S){e.preventDefault();S.down(e)}});
cv.addEventListener('pointermove',e=>{if(S)S.move(e)});
cv.addEventListener('pointerup',e=>{if(S)S.up(e)});
cv.addEventListener('pointercancel',e=>{if(S)S.up(e)});
window.addEventListener('keydown',e=>{if(S&&dlg.open)S.key(e)});
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!S||!S.enviar||S.espera)return;
  const v=input.value.trim();
  if(!v){hudEl.textContent='Escribe la respuesta antes de comprobar.';input.focus();return}
  S.enviar(v);
});
// El evento close llega con retraso: si para entonces ya se ha abierto otra partida, no se toca.
dlg.addEventListener('close',()=>{if(S&&!dlg.open){S.cerrar();S=null}});
document.getElementById('jClose').addEventListener('click',()=>dlg.close());

function abrir(i,meta,host){
  if(S){S.cerrar();S=null}
  const def=JUEGOS[i];
  if(def.precarga)def.precarga(); // las imágenes de cada juego solo se descargan al abrirlo
  jGr.textContent=meta.gr;jTitle.textContent=meta.name;jTag.textContent=`Trabajo ${i+1} de 12 · ${meta.tag}`;
  cv.setAttribute('aria-label',`Minijuego: ${meta.name}. ${(def.how||[]).join(' ')}`);
  if(!dlg.open)dlg.showModal();
  ajustar();
  S=crearSesion(i,def,meta,host);
  S.iniciar();
  cv.focus({preventScroll:true});
}
function cerrar(){if(dlg.open)dlg.close()}

/* =====================================================================
   LOS DOCE JUEGOS · el contenido se dibuja entre y=52 y y=488
   ===================================================================== */

/* 1 · León de Nemea · Colores RGB */
function dibujarLeon(c,x,y,s,col,feliz){
  const [r,g,b]=col.map(v=>Math.round(v));
  c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle=`rgb(${r},${g},${b})`;c.strokeStyle=P.tinta;c.lineWidth=2;
  c.beginPath();
  for(let k=0;k<=32;k++){const a=k/32*TAU,rad=k%2?60:72;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;k?c.lineTo(px,py):c.moveTo(px,py)}
  c.closePath();c.fill();c.stroke();
  c.fillStyle=P.papel;
  [-1,1].forEach(d=>{c.beginPath();c.arc(d*28,-34,11,0,TAU);c.fill();c.stroke()});
  c.beginPath();c.ellipse(0,6,40,44,0,0,TAU);c.fill();c.stroke();
  c.beginPath();c.ellipse(0,26,20,14,0,0,TAU);c.stroke();
  c.fillStyle=P.tinta;
  [-1,1].forEach(d=>{c.beginPath();if(feliz){c.arc(d*15,-2,6,Math.PI,0);c.stroke()}else{c.arc(d*15,-2,4.5,0,TAU);c.fill()}});
  c.beginPath();c.moveTo(-8,15);c.lineTo(8,15);c.lineTo(0,23);c.closePath();c.fill();
  c.beginPath();c.moveTo(0,23);c.quadraticCurveTo(-7,32,-13,28);c.moveTo(0,23);c.quadraticCurveTo(7,32,13,28);c.stroke();
  c.restore();
}
// León de Nemea: imagen original sin fondo (static/images/leon-nemea.webp). En la imagen la melena es azul:
// se detectan esos píxeles y se repintan con el color elegido, conservando sus luces, sombras y
// trazos de tinta. La cara, los ojos y el fondo no cambian.
const MELENA_LUZ=103; // luminosidad media del azul de la melena original
let LEON=null,leonPedido=false;
function cargarLeon(){
  if(leonPedido)return;leonPedido=true;
  const im=new Image();
  im.onload=()=>{
    const w=im.naturalWidth,h=im.naturalHeight,lz=document.createElement('canvas');lz.width=w;lz.height=h;
    const k=lz.getContext('2d',{willReadFrequently:true});k.drawImage(im,0,0);
    const base=k.getImageData(0,0,w,h),s=base.data,n=w*h;
    const mascara=new Float32Array(n),luz=new Float32Array(n);
    for(let i=0,j=0;i<n;i++,j+=4){
      const r=s[j],g=s[j+1],b=s[j+2];
      // azul: más azul que rojo y que verde (la cara y el pergamino son ocres; la tinta, casi negra)
      mascara[i]=clamp((b-r)/18,0,1)*clamp((b-g+6)/12,0,1);
      luz[i]=(.299*r+.587*g+.114*b)/MELENA_LUZ;
    }
    LEON={w,h,base,mascara,luz};
  };
  im.src='/static/images/leon-nemea.webp';
}
// Cada color de melena se pinta una vez y se reutiliza mientras no cambie
const cacheLeon=new Map();
function lienzoLeon(col){
  const clave=col.map(Math.round).join(',');
  if(cacheLeon.has(clave))return cacheLeon.get(clave);
  const {w,h,base,mascara,luz}=LEON,lz=document.createElement('canvas');lz.width=w;lz.height=h;
  const k=lz.getContext('2d'),out=k.createImageData(w,h),s=base.data,d=out.data;
  for(let i=0,j=0;i<w*h;i++,j+=4){
    const m=mascara[i],l=luz[i];
    d[j]=m?lerp(s[j],Math.min(255,col[0]*l),m):s[j];
    d[j+1]=m?lerp(s[j+1],Math.min(255,col[1]*l),m):s[j+1];
    d[j+2]=m?lerp(s[j+2],Math.min(255,col[2]*l),m):s[j+2];
    d[j+3]=s[j+3]; // se conserva la transparencia del fondo
  }
  k.putImageData(out,0,0);
  if(cacheLeon.size>8)cacheLeon.delete(cacheLeon.keys().next().value);
  cacheLeon.set(clave,lz);
  return lz;
}
function dibujarLeonImg(c,x,y,alto,col){
  if(!LEON){dibujarLeon(c,x,y,.95,col,false);return} // mientras carga la imagen, el león sencillo
  const ancho=alto*LEON.w/LEON.h;
  c.imageSmoothingQuality='high';
  c.drawImage(lienzoLeon(col),x-ancho/2,y-alto/2,ancho,alto);
}
const leon={
  precarga:cargarLeon, // carga diferida: la imagen se pide al abrir la prueba
  how:['Pinta la melena de tu león del mismo color que la del león de Nemea con los deslizadores Rojo, Verde y Azul.','Bajo cada deslizador veréis si ese color ya está bien. Cuando los tres lo estén, pulsad «Sellar». Son dos tonos distintos.'],
  limite:20,castigo:20,penal:'Sellar mal: 6 s de espera',
  aviso:{x:235,y:426,w:390}, // dentro del panel de los leones: así no tapa el botón Sellar
  hud:'Arrastra los deslizadores (o usa ↑ ↓ para elegir y ← → para mover; Mayús va más rápido).',
  start(g){
    // Cinco dorados bien distintos entre sí: oro claro, oro, ámbar, bronce y miel
    const TONOS=[[240,205,100],[222,168,40],[205,118,32],[160,104,56],[238,150,95]];
    const TOL=8; // margen de acierto por canal: hay que dejarlo casi exacto
    const variar=t=>t.map(v=>clamp(v+ri(-5,5),0,255));
    const separados=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    let ronda=1,objetivo=variar(pick(TONOS));
    // El segundo tono tiene que verse claramente distinto del primero (si no, se sellaría sin tocar nada)
    const segundo=()=>{
      let mejor=null;
      for(let n=0;n<200;n++){const t=variar(pick(TONOS));if(!mejor||separados(t,objetivo)>separados(mejor,objetivo))mejor=t;if(separados(t,objetivo)>=70)return t}
      return mejor;
    };
    const cur=[ri(20,90),ri(60,140),ri(150,230)];
    const sl=[0,1,2].map(k=>({k,x:470,y:160+k*84,w:270}));
    const NOM=['ROJO','VERDE','AZUL'];
    const SELLO={x:520,y:410,w:170,h:46};
    let act=-1,sel=0,hoverS=false;
    const exacto=()=>cur.every((v,k)=>Math.abs(v-objetivo[k])<=TOL);
    // La pista solo dice «Ya está» cuando el sello se va a aceptar, para no castigar a quien se fía de ella
    const pista=()=>{
      if(exacto())return ['¡Ya está! Sellad',P.oliva];
      const d=separados(cur,objetivo);
      return d>130?['Muy lejos',P.alerta]:d>80?['Lejos',P.alerta]:d>30?['Cerca',P.oroT]:['Casi…',P.oroT];
    };
    // Pista de cada deslizador: solo dice si ese canal ya está bien (no hacia dónde moverlo)
    const consejo=k=>Math.abs(objetivo[k]-cur[k])<=TOL?['✓ Bien',P.oliva]:['✗ Sin ajustar',P.dim];
    const fijar=(k,x)=>{cur[k]=Math.round(clamp((x-sl[k].x)/sl[k].w,0,1)*255)};
    const sobre=p=>sl.find(s=>Math.abs(p.y-s.y)<24&&p.x>s.x-16&&p.x<s.x+s.w+16);
    const sellar=()=>{
      if(exacto()){
        g.chispas(335,230,30);g.sfx.ok();
        if(ronda===2){g.ganar();return}
        ronda++;objetivo=segundo();g.aviso('¡Primer tono sellado! Ahora el segundo.');
      }else g.error(6,'Ese color no es el del león. Seguid ajustando.');
    };
    return {
      down(p){
        if(dentro(p,SELLO)){sellar();return}
        const s=sobre(p);if(s){act=sel=s.k;fijar(act,p.x);g.sfx.tick();g.cursor('grabbing')}
      },
      move(p){hoverS=dentro(p,SELLO);if(act>=0){fijar(act,p.x);return}g.cursor(sobre(p)||hoverS?'pointer':'default')},
      up(){act=-1;g.cursor('default')},
      key(e){
        if(e.key==='ArrowUp'){sel=(sel+2)%3;return true}
        if(e.key==='ArrowDown'){sel=(sel+1)%3;return true}
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){cur[sel]=clamp(cur[sel]+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?12:2),0,255);return true}
        if(e.key==='Enter'){sellar();return true}
      },
      update(){g.marcador(`TONO ${ronda}/2`)},
      draw(c){
        papel(c);
        caja(c,30,64,410,410,{fondo:'rgba(234,217,174,.45)'});
        txt(c,'LEÓN DE NEMEA',135,92,{size:15,font:F_TIT});txt(c,'TU LEÓN',335,92,{size:15,font:F_TIT});
        c.strokeStyle=P.linea;c.beginPath();c.moveTo(235.5,80);c.lineTo(235.5,320);c.stroke();
        dibujarLeonImg(c,135,212,212,objetivo);
        dibujarLeonImg(c,335,212,212,cur);
        const [pt,pc]=pista();
        txt(c,'¿Se parecen?',235,350,{size:15,font:F_MONO,weight:600,color:P.dim});
        txt(c,pt.toUpperCase(),235,380,{size:22,font:F_TIT,color:pc});
        txt(c,'Dos tonos: este es el '+(ronda===1?'primero':'segundo'),235,408,{size:15,weight:500,color:P.dim});
        caja(c,455,100,315,370,{fondo:'rgba(234,217,174,.45)'});
        sl.forEach(s=>{
          const gr=c.createLinearGradient(s.x,0,s.x+s.w,0);
          const a=cur.slice(),b=cur.slice();a[s.k]=0;b[s.k]=255;
          gr.addColorStop(0,`rgb(${a})`);gr.addColorStop(1,`rgb(${b})`);
          c.fillStyle=gr;c.fillRect(s.x,s.y-9,s.w,18);
          c.lineWidth=sel===s.k?2:1;c.strokeStyle=sel===s.k?P.tinta:P.linea;c.strokeRect(s.x+.5,s.y-8.5,s.w-1,17);
          txt(c,NOM[s.k],s.x,s.y-26,{size:13,font:F_MONO,align:'left',color:sel===s.k?P.tinta:P.dim});
          txt(c,String(cur[s.k]),s.x+s.w,s.y-26,{size:13,font:F_MONO,align:'right',color:P.dim});
          const [ct,cc]=consejo(s.k);
          txt(c,ct,s.x,s.y+30,{size:13,font:F_MONO,align:'left',color:cc});
          const kx=s.x+cur[s.k]/255*s.w;
          c.fillStyle=P.papel;c.fillRect(kx-7,s.y-16,14,32);c.lineWidth=2;c.strokeStyle=P.tinta;c.strokeRect(kx-7,s.y-16,14,32);
        });
        boton(c,SELLO,'SELLAR',hoverS);
      }
    };
  }
};

/* 2 · Hidra de Lerna · Escritura rápida */
// Hidra dibujada en el canvas, al estilo grabado: cabezas de dragón con cuernos y fauces abiertas,
// cuellos de escamas con el vientre ocre y púas en el lomo, y el cuerpo enroscado en el pantano.
const HID={piel:'#4f6274',sombra:'#36444f',vientre:'#cdb183',boca:'#4a1712',lengua:'#b0473a',ojo:'#e2b03c',diente:'#f3ead2'};
const HID_ROJA={...HID,piel:'#8c3a2e',sombra:'#6a2a22'}; // al equivocarse, la hidra enrojece un instante
const bezier=(p0,p1,p2,p3,t)=>{const u=1-t;return {x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y}};
// tramo grueso de escamas (cuellos y cuerpo): tinta, piel, escamas y franja del vientre
function trazoHidra(c,camino,ancho,col,vientre){
  c.lineCap='round';c.lineJoin='round';
  camino();c.strokeStyle=P.tinta;c.lineWidth=ancho+6;c.stroke();
  camino();c.strokeStyle=col.piel;c.lineWidth=ancho;c.stroke();
  camino();c.strokeStyle='rgba(20,28,36,.35)';c.lineWidth=ancho*.62;c.setLineDash([3,5]);c.stroke();c.setLineDash([]);
  if(vientre){
    c.save();c.translate(vientre.x,vientre.y);
    camino();c.strokeStyle=col===HID?HID.vientre:'#d9a48a';c.lineWidth=ancho*.3;c.stroke();
    camino();c.strokeStyle='rgba(42,28,13,.5)';c.lineWidth=ancho*.3;c.setLineDash([1.4,4.5]);c.stroke();c.setLineDash([]);
    c.restore();
  }
}
function cuelloHidra(c,a,e,dir,col){
  const p0=a,p1={x:a.x+dir*8,y:a.y-95},p2={x:e.x-dir*75,y:e.y+55},p3=e;
  trazoHidra(c,()=>{c.beginPath();c.moveTo(p0.x,p0.y);c.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y)},22,col,{x:dir*6,y:3});
  // púas del lomo, en el lado contrario al vientre
  for(let t=.18;t<.92;t+=.11){
    const p=bezier(p0,p1,p2,p3,t),q=bezier(p0,p1,p2,p3,t+.02);
    let tx=q.x-p.x,ty=q.y-p.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;
    let nx=-ty,ny=tx;if(nx*dir>0){nx=-nx;ny=-ny}
    const bx=p.x+nx*13,by=p.y+ny*13;
    c.beginPath();c.moveTo(bx-tx*6,by-ty*6);c.lineTo(bx+nx*11+tx*4,by+ny*11+ty*4);c.lineTo(bx+tx*6,by+ty*6);c.closePath();
    c.fillStyle=HID.vientre;c.fill();c.lineWidth=1.6;c.strokeStyle=P.tinta;c.stroke();
  }
}
// cabeza de dragón mirando a la derecha; el origen es donde se une el cuello
function cabezaHidra(c,x,y,dir,s,col,abre){
  c.save();c.translate(x,y);c.scale(dir*s,s);c.rotate(-.1);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=P.tinta;
  const forma=(d,fill,lw=2.2)=>{const p=new Path2D(d);c.fillStyle=fill;c.fill(p);c.lineWidth=lw;c.strokeStyle=P.tinta;c.stroke(p)};
  // cuernos y crestas (detrás de la cabeza)
  forma('M18 -26 Q-4 -44 -24 -64 Q2 -48 30 -32 Z',HID.vientre);
  forma('M30 -32 Q22 -54 8 -74 Q32 -56 42 -34 Z',HID.vientre);
  forma('M-2 -6 L-26 -6 L-8 -14 L-30 -22 L-6 -24 L-22 -36 L8 -26 Z',HID.vientre,1.8);
  // fauces: interior, lengua bífida y mandíbula inferior (se abre y se cierra)
  c.save();c.translate(28,8);c.rotate(abre*.22);c.translate(-28,-8);
  forma('M28 6 L94 -4 L90 26 L46 24 Z',HID.boca,1.6);
  c.strokeStyle=HID.lengua;c.lineWidth=4.5;c.beginPath();c.moveTo(46,12);c.quadraticCurveTo(84,10,106,22);c.stroke();
  c.lineWidth=3;c.beginPath();c.moveTo(106,22);c.lineTo(116,15);c.moveTo(106,22);c.lineTo(113,31);c.stroke();
  forma('M4 14 Q28 16 50 20 L88 22 Q94 28 86 32 L44 34 Q16 34 0 22 Z',HID.vientre);
  c.fillStyle=HID.diente;c.lineWidth=1.2;c.strokeStyle=P.tinta;
  for(let k=0;k<6;k++){const tx=52+k*6.5;c.beginPath();c.moveTo(tx-2.6,22);c.lineTo(tx,14-(k===4?5:0));c.lineTo(tx+2.6,22);c.closePath();c.fill();c.stroke()}
  c.restore();
  // cabeza superior
  forma('M-6 -14 C10 -36 46 -42 70 -30 L96 -20 Q104 -15 99 -6 L93 -3 L60 2 Q40 4 28 10 L2 16 Z',col.piel,2.4);
  forma('M-4 4 Q14 -2 30 10 L4 16 Z',col.sombra,1.4);
  c.fillStyle=HID.diente;c.lineWidth=1.2;c.strokeStyle=P.tinta;
  for(let k=0;k<6;k++){const tx=62+k*5.6,ty=1.4-k*.8;c.beginPath();c.moveTo(tx-2.4,ty);c.lineTo(tx,ty+8+(k===1||k===5?6:0));c.lineTo(tx+2.4,ty-.6);c.closePath();c.fill();c.stroke()}
  // escamas de la frente
  c.lineWidth=1;c.strokeStyle='rgba(20,28,36,.7)';
  for(let k=0;k<5;k++){c.beginPath();c.arc(14+k*11,-24+Math.abs(k-2)*1.5,5,Math.PI,0);c.stroke()}
  // ojo con pupila rasgada, ceño y fosa nasal
  c.strokeStyle=P.tinta;
  c.save();c.translate(58,-20);c.rotate(-.25);
  c.beginPath();c.ellipse(0,0,8.5,5,0,0,TAU);c.fillStyle=HID.ojo;c.fill();c.lineWidth=1.6;c.stroke();
  c.beginPath();c.ellipse(1,0,1.6,4.6,0,0,TAU);c.fillStyle=P.tinta;c.fill();c.restore();
  c.lineWidth=3.6;c.beginPath();c.moveTo(44,-32);c.quadraticCurveTo(58,-34,72,-24);c.stroke();
  c.lineWidth=1.8;c.beginPath();c.moveTo(90,-15);c.quadraticCurveTo(94,-18,97,-14);c.stroke();
  c.restore();
}
// Ilustraciones de la hidra con 1 a 9 cabezas (static/images/hidra-N.webp), con carga diferida.
// Si aún no han cargado, se usa la hidra dibujada por código.
const IMG_HIDRA=Array.from({length:10},()=>new Image());
const HIDRA_CAJA={y0:140,y1:478,ancho:620}; // zona del canvas donde va la ilustración
const hidra={
  precarga:()=>{if(!IMG_HIDRA[1].src)for(let n=1;n<=9;n++)IMG_HIDRA[n].src=`/static/images/hidra-${n}.webp`},
  how:['Escribe con el teclado las dos inscripciones de la hidra, letra a letra.','Cada palabra completa corta una cabeza. Cada error hace brotar otra y os aturde un momento. Con nueve cabezas, la hidra gana.'],
  limite:15,castigo:20,penal:'Error: +1 cabeza y 2 s',
  hud:'Escribe con el teclado. Las tildes no hacen falta.',
  start(g){
    const FRASES=shuffle(['EL FUEGO CIERRA CADA HERIDA','NUEVE CABEZAS Y UN SOLO HEROE','QUIEN TECLEA RAPIDO VENCE','LA HIDRA DUERME EN EL PANTANO','CORTA Y QUEMA SIN DUDAR','EL PANTANO DE LERNA NO PERDONA']);
    let ronda=0,frase=FRASES[0],idx=0,cabezas=4,error=0;
    // dónde se une el cuello a la cabeza k: un arco por encima del cuerpo
    // (con muchas cabezas, una de cada dos va en una fila interior más baja)
    const cuello=k=>{
      const n=cabezas,a=lerp(-2.72,-.42,n===1?.5:k/(n-1)),fila=n>5&&k%2?1:0;
      return {x:400+Math.cos(a)*262*(fila?.78:1),y:322+Math.sin(a)*112*(fila?.55:1)+(fila?30:0),dir:Math.cos(a)>=0?1:-1};
    };
    return {
      key(e){
        if(e.ctrlKey||e.metaKey||e.altKey||e.key.length!==1)return false;
        const ch=e.key.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
        if(ch===frase[idx]){
          idx++;g.sfx.tick();
          if(idx===frase.length||frase[idx]===' '){if(cabezas>1){const p=cuello(cabezas-1);cabezas--;g.chispas(p.x+p.dir*55,p.y-20,22,[P.alerta,P.oro,HID.piel]);g.sfx.ok()}}
          if(idx===frase.length){
            if(ronda===1){g.ganar();return true}
            ronda=1;frase=FRASES[1];idx=0;g.aviso('Primera inscripción completa. ¡Otra!');
          }
        }else{
          cabezas++;error=.4;
          if(cabezas>=9)g.fallar('¡La hidra tiene nueve cabezas y os ha rodeado!',20);
          else g.error(2,'¡Error! Brota otra cabeza');
        }
        return true;
      },
      update(dt){error=Math.max(0,error-dt);g.marcador(`INSCRIPCIÓN ${ronda+1}/2   ·   CABEZAS ${cabezas}/9`)},
      draw(c){
        papel(c);
        const col=error>0?HID_ROJA:HID,esc=cabezas>5?.86:1;
        const ilus=IMG_HIDRA[Math.max(1,Math.min(9,cabezas))];
        const conImagen=ilus.complete&&ilus.naturalWidth>0;
        const pos=conImagen?[]:Array.from({length:cabezas},(_,k)=>{const p=cuello(k),b=Math.sin(g.t*1.8+k*1.3);return {...p,x:p.x+b*2,y:p.y+b*4,k,abre:.5+.5*Math.sin(g.t*2.4+k)}});
        if(conImagen){
          // ilustración con tantas cabezas como tenga la hidra; respira despacio y enrojece al fallar
          const h0=HIDRA_CAJA.y1-HIDRA_CAJA.y0,s=Math.min(h0/ilus.naturalHeight,HIDRA_CAJA.ancho/ilus.naturalWidth);
          const w=ilus.naturalWidth*s,h=ilus.naturalHeight*s,resp=Math.sin(g.t*1.6)*3;
          c.save();
          if(error>0)c.filter='sepia(1) saturate(5) hue-rotate(-35deg)';
          c.drawImage(ilus,400-w/2,HIDRA_CAJA.y1-h+resp,w,h);
          c.restore();
        }else{
          // cuellos: salen del lomo del cuerpo
          pos.forEach((p,i)=>cuelloHidra(c,{x:lerp(338,462,cabezas===1?.5:i/(cabezas-1)),y:420},{x:p.x,y:p.y},p.dir,col));
          // cuerpo enroscado (tapa el arranque de los cuellos)
          const anillo=(rx,ry,y,a0,a1)=>()=>{c.beginPath();c.ellipse(400,y,rx,ry,0,a0,a1)};
          trazoHidra(c,anillo(150,26,452,Math.PI*.98,Math.PI*2.02),30,col,{x:0,y:6});
          trazoHidra(c,anillo(108,22,428,Math.PI*1.02,Math.PI*1.98),28,col,{x:0,y:5});
          trazoHidra(c,anillo(150,26,452,Math.PI*.02,Math.PI*.98),30,col,{x:0,y:6});
        }
        // pantano por delante del cuerpo
        c.fillStyle='rgba(243,232,200,.78)';c.fillRect(14,462,W-28,26);
        c.strokeStyle='rgba(93,107,47,.55)';c.lineWidth=1.5;
        for(let k=0;k<4;k++){c.beginPath();for(let x=20;x<=780;x+=20){const y=448+k*10+Math.sin(x/30+g.t+k)*3;x===20?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
        // cabezas: de los lados hacia el centro, para que las centrales queden delante
        [...pos].sort((a,b)=>Math.abs(b.x-400)-Math.abs(a.x-400)).forEach(p=>cabezaHidra(c,p.x,p.y,p.dir,esc,col,p.abre));
        // inscripción
        c.font=`700 24px ${F_MONO}`;
        const cw=c.measureText('M').width+4,x0=W/2-frase.length*cw/2;
        caja(c,x0-14,64,frase.length*cw+28,64,{fondo:'rgba(243,232,200,.95)',borde:P.oro,grosor:2});
        [...frase].forEach((ch,k)=>{
          const x=x0+k*cw+cw/2;
          if(k===idx){c.fillStyle=error>0?'rgba(155,47,31,.25)':'rgba(185,130,26,.25)';c.fillRect(x-cw/2+1,76,cw-2,40)}
          if(ch!==' '){c.strokeStyle=k<idx?P.oro:P.linea;c.lineWidth=1;c.beginPath();c.moveTo(x-cw/2+3,112.5);c.lineTo(x+cw/2-3,112.5);c.stroke()}
          txt(c,ch,x,96,{size:24,font:F_MONO,color:k<idx?P.oroT:k===idx?P.tinta:'rgba(42,28,13,.45)'});
        });
      }
    };
  }
};

/* 3 · Cierva de Cerinea · como la original, con ciervas falsas */
const cierva={
  how:['La cierva de los cuernos de oro salta sin parar por el bosque. Atrápala 8 veces.','Desde la tercera captura aparecen ciervas de bronce falsas (en rojo). Si atrapas una falsa, perderás tiempo.'],
  limite:35,castigo:15,penal:'Cierva falsa: 3 s de espera',
  hud:'Haz clic sobre la cierva dorada.',
  start(g){
    const TOTAL=8,A={x:34,y:62,w:732,h:418};
    const nueva=(falsa)=>{const x=rnd(A.x+40,A.x+A.w-40),y=rnd(A.y+40,A.y+A.h-40);return {x,y,tx:x,ty:y,falsa,reloj:rnd(0,.5)}};
    const ciervas=[nueva(false)];
    let n=0,espera=1.05;
    const saltar=d=>{d.tx=rnd(A.x+40,A.x+A.w-40);d.ty=rnd(A.y+40,A.y+A.h-40);d.reloj=0};
    const bajo=p=>ciervas.find(d=>Math.hypot(p.x-d.x,p.y-d.y)<32);
    return {
      down(p){
        const d=bajo(p);if(!d)return;
        if(d.falsa){saltar(d);g.error(3,'¡Era una cierva de bronce!');return}
        n++;g.chispas(d.x,d.y,16);g.sfx.ok();
        if(n>=TOTAL){g.ganar();return}
        espera=Math.max(.45,1.05-n*.08);saltar(d);
        if(n===3||n===5)ciervas.push(nueva(true));
      },
      move(p){g.cursor(bajo(p)?'pointer':'crosshair')},
      update(dt){
        g.marcador(`CAPTURAS ${n}/${TOTAL}`);
        ciervas.forEach(d=>{
          d.x=lerp(d.x,d.tx,.22);d.y=lerp(d.y,d.ty,.22);
          d.reloj+=dt;if(d.reloj>(d.falsa?espera*1.2:espera))saltar(d);
        });
      },
      draw(c){
        papel(c);
        caja(c,A.x,A.y,A.w,A.h,{fondo:'rgba(243,232,200,.6)',borde:P.linea,discontinua:true});
        rayado(c,A.x,A.y,A.w,A.h);
        ciervas.forEach(d=>{
          const col=d.falsa?P.alerta:P.oro,ink=d.falsa?P.alerta:P.oroT;
          c.fillStyle=P.papel;c.beginPath();c.arc(d.x,d.y,28,0,TAU);c.fill();
          c.lineWidth=2.5;c.strokeStyle=col;c.stroke();
          icono(c,'asta',d.x,d.y,36,ink,2);
        });
      }
    };
  }
};

/* 4 · Jabalí de Erimanto · Huellas */
const HUELLAS=['carpeta','disquete','nota','campana','estrella','candado'];
const NOM_HUELLA={carpeta:'carpeta',disquete:'disquete',nota:'nota musical',campana:'campana',estrella:'estrella',candado:'candado'};
function rastro(cols,rows){
  for(let intento=0;intento<400;intento++){
    let c0=0,r0=ri(0,rows-1);
    const p=[[c0,r0]],vis=new Set([`${c0},${r0}`]);
    let vert=0,ultimo=0,ok=true;
    while(c0<cols-1){
      const op=[[1,0]];
      // en la primera columna solo se avanza a la derecha: así el inicio del rastro es único
      if(c0>0&&vert<3){if(r0>0&&ultimo!==1)op.push([0,-1],[0,-1]);if(r0<rows-1&&ultimo!==-1)op.push([0,1],[0,1])}
      let hecho=false;
      for(const [dc,dr] of shuffle(op)){
        const nc=c0+dc,nr=r0+dr;
        if(vis.has(`${nc},${nr}`))continue;
        const vecinos=[[nc+1,nr],[nc-1,nr],[nc,nr+1],[nc,nr-1]].filter(([a,b])=>!(a===c0&&b===r0));
        if(vecinos.some(([a,b])=>vis.has(`${a},${b}`)))continue;
        c0=nc;r0=nr;p.push([c0,r0]);vis.add(`${c0},${r0}`);
        if(dr){vert++;ultimo=dr}else{vert=0;ultimo=0}
        hecho=true;break;
      }
      if(!hecho){ok=false;break}
    }
    if(ok&&p.length>=cols+6)return p;
  }
  return Array.from({length:11},(_,k)=>[k,3]);
}
const jabali={
  how:['El jabalí ha dejado huellas entre muchas otras parecidas.','Sigue solo las huellas del símbolo indicado, casilla a casilla (arriba, abajo o a la derecha), desde la columna de la izquierda hasta su guarida.'],
  limite:25,castigo:15,penal:'Huella equivocada: 4 s de espera',
  start(g){
    const COLS=11,ROWS=7,CS=54,OX=30,OY=62;
    const obj=pick(HUELLAS),otros=HUELLAS.filter(x=>x!==obj);
    const camino=rastro(COLS,ROWS);
    const enCamino=new Map(camino.map(([a,b],k)=>[`${a},${b}`,k]));
    const celdas=[];
    for(let r=0;r<ROWS;r++)for(let col=0;col<COLS;col++)celdas.push({col,r,e:enCamino.has(`${col},${r}`)?obj:pick(otros)});
    let paso=0,mal=null,hover=null,trote=-1;
    g.hud(`Sigue solo las huellas del símbolo «${NOM_HUELLA[obj]}» hasta la guarida.`);
    const celdaEn=p=>{const col=Math.floor((p.x-OX)/CS),r=Math.floor((p.y-OY)/CS);return col>=0&&col<COLS&&r>=0&&r<ROWS?{col,r}:null};
    const centro=([col,r])=>({x:OX+col*CS+CS/2,y:OY+r*CS+CS/2});
    return {
      down(p){
        if(trote>=0)return;
        const k=celdaEn(p);if(!k)return;
        const [ec,er]=camino[paso],kk=`${k.col},${k.r}`;
        if(k.col===ec&&k.r===er){
          paso++;g.sfx.pop();const q=centro([ec,er]);g.chispas(q.x,q.y,8);
          if(paso===camino.length){trote=0;g.sfx.ok();g.luego(1300,()=>g.ganar())}
        }else{
          if(enCamino.has(kk)&&enCamino.get(kk)<paso)return;
          mal={...k,t:.6};
          g.error(4,enCamino.has(kk)?'Seguid el rastro en orden, sin saltaros huellas.':'Esa huella no es la del jabalí.');
        }
      },
      move(p){hover=celdaEn(p);g.cursor(hover?'pointer':'default')},
      update(dt){if(mal)mal.t-=dt;if(trote>=0)trote+=dt*9;g.marcador(`HUELLAS ${paso}/${camino.length}`)},
      draw(c){
        papel(c);
        // guarida
        c.fillStyle=P.papel2;c.strokeStyle=P.tinta;c.lineWidth=2;
        c.beginPath();c.moveTo(650,440);c.quadraticCurveTo(720,180,790,440);c.closePath();c.fill();c.stroke();
        c.fillStyle='#3b2a18';c.beginPath();c.moveTo(682,440);c.quadraticCurveTo(720,300,758,440);c.closePath();c.fill();
        txt(c,'GUARIDA',720,460,{size:14,font:F_TIT});
        celdas.forEach(k=>{
          const x=OX+k.col*CS,y=OY+k.r*CS,i=enCamino.get(`${k.col},${k.r}`),pisada=i!==undefined&&i<paso;
          caja(c,x+2,y+2,CS-4,CS-4,{fondo:pisada?'#f1dca3':P.papel,borde:pisada?P.oro:P.linea,grosor:pisada?2:1});
          if(mal&&mal.t>0&&mal.col===k.col&&mal.r===k.r){c.fillStyle='rgba(155,47,31,.25)';c.fillRect(x+3,y+3,CS-6,CS-6)}
          if(hover&&hover.col===k.col&&hover.r===k.r){c.lineWidth=2;c.strokeStyle=P.tinta;c.strokeRect(x+3,y+3,CS-6,CS-6)}
          icono(c,k.e,x+CS/2,y+CS/2,26,pisada?P.oroT:P.tinta,1.8);
        });
        if(paso===0){c.lineWidth=2;c.strokeStyle=P.alerta;c.setLineDash([4,3]);c.strokeRect(OX+.5,OY+.5,CS-1,ROWS*CS-1);c.setLineDash([])}
        caja(c,OX,OY+ROWS*CS+8,250,36,{fondo:P.papel,borde:P.oro,grosor:2});
        txt(c,'RASTRO DEL JABALÍ:',OX+12,OY+ROWS*CS+26,{size:14,font:F_TIT,align:'left'});
        icono(c,obj,OX+222,OY+ROWS*CS+26,24,P.oroT,2);
        if(paso===0)txt(c,'Empieza en la primera columna',OX+270,OY+ROWS*CS+26,{size:14,font:F_MONO,weight:600,align:'left',color:P.alerta});
        if(trote>=0){const k=Math.min(camino.length-1,Math.floor(trote)),q=trote>=camino.length?{x:720,y:410}:centro(camino[k]);c.fillStyle=P.alerta;c.beginPath();c.arc(q.x,q.y,9,0,TAU);c.fill()}
      }
    };
  }
};

/* 5 · Establos de Augías · Arrastra al virus */
const PELIGROSOS=['foto.jpg.exe','premio.scr','juego_gratis.bat','tarea.docx.exe','factura.pdf.exe','fondo.png.exe','video.mp4.scr','notas.txt.bat'];
const TRAMPAS=['manual.exe.pdf','instalar.bat.txt','informe.scr.docx'];
const SEGUROS=['foto.jpg','tarea.docx','musica.mp3','notas.txt','mapa.png','video.mp4','factura.pdf'];
const SELLO_TIPO={jpg:'IMG',png:'IMG',docx:'DOC',pdf:'PDF',mp3:'MP3',txt:'TXT',mp4:'VID',exe:'EXE',bat:'BAT',scr:'SCR'};
const augias={
  how:['Los establos están llenos de archivos y algunos son virus disfrazados.','Arrastra a la papelera solo los archivos peligrosos. Fijaos bien en sus extensiones.'],
  limite:18,castigo:15,penal:'Archivo bueno a la papelera: 6 s',
  start(g){
    const lista=shuffle([...shuffle(PELIGROSOS).slice(0,6).map(n=>({n,mal:true})),...shuffle(TRAMPAS).slice(0,2).map(n=>({n,mal:false})),...shuffle(SEGUROS).slice(0,4).map(n=>({n,mal:false}))]);
    const items=lista.map((o,k)=>({...o,x:30+(k%6)*100+rnd(-4,4),y:70+Math.floor(k/6)*196+rnd(-4,4),w:86,h:118,vivo:true,ox:0,oy:0,bx:0,by:0}));
    items.forEach(i=>{i.bx=i.x;i.by=i.y});
    const PAP={x:650,y:220,w:120,h:230};
    let arr=null,abierta=false,hover=null;
    const quedan=()=>items.filter(i=>i.vivo&&i.mal).length;
    const bajo=p=>[...items].reverse().find(i=>i.vivo&&dentro(p,i));
    return {
      down(p){const i=bajo(p);if(i){arr=i;i.ox=p.x-i.x;i.oy=p.y-i.y;items.push(items.splice(items.indexOf(i),1)[0]);g.cursor('grabbing');g.sfx.tick()}},
      move(p){
        if(arr){arr.x=clamp(p.x-arr.ox,14,W-14-arr.w);arr.y=clamp(p.y-arr.oy,52,H-14-arr.h);abierta=dentro(p,PAP);return}
        hover=bajo(p);g.cursor(hover?'grab':'default');
      },
      up(p){
        if(!arr)return;
        const i=arr;arr=null;abierta=false;g.cursor('default');
        if(!dentro(p,PAP))return;
        if(i.mal){
          i.vivo=false;g.chispas(PAP.x+60,PAP.y+40,18);g.sfx.ok();
          if(!quedan())g.ganar();
        }else{i.x=i.bx;i.y=i.by;g.error(6,`«${i.n}» era un archivo bueno.`)}
      },
      update(){g.marcador(`PELIGROSOS RESTANTES ${quedan()}`)},
      draw(c){
        papel(c);
        c.strokeStyle='rgba(183,155,98,.4)';c.lineWidth=1;for(let y=70;y<H-20;y+=28){c.beginPath();c.moveTo(20,y+.5);c.lineTo(630,y+.5);c.stroke()}
        caja(c,PAP.x,PAP.y,PAP.w,PAP.h,{fondo:abierta?'#f1dca3':P.papel,borde:abierta?P.alerta:P.tinta,grosor:2});
        c.save();c.translate(PAP.x+PAP.w/2,PAP.y+100);if(abierta)c.rotate(-.12);icono(c,'papelera',0,0,84,abierta?P.alerta:P.tinta,1.6);c.restore();
        txt(c,'PAPELERA',PAP.x+PAP.w/2,PAP.y+PAP.h-26,{size:14,font:F_TIT});
        items.forEach(i=>{
          if(!i.vivo)return;
          const partes=i.n.split('.'),sello=SELLO_TIPO[partes[1]]||'?';
          c.save();c.translate(i.x,i.y);
          if(i===arr){c.fillStyle='rgba(42,28,13,.15)';c.fillRect(6,6,i.w,i.h)}
          c.fillStyle=P.papel;c.strokeStyle=i===hover||i===arr?P.tinta:P.dim;c.lineWidth=i===arr?2:1.5;
          c.beginPath();c.moveTo(14,0);c.lineTo(58,0);c.lineTo(72,14);c.lineTo(72,76);c.lineTo(14,76);c.closePath();c.fill();c.stroke();
          c.beginPath();c.moveTo(58,0);c.lineTo(58,14);c.lineTo(72,14);c.stroke();
          c.strokeStyle=P.oroT;c.lineWidth=1.5;c.strokeRect(22,32,42,20);
          txt(c,sello,43,42.5,{size:12,font:F_MONO,color:P.oroT});
          const ult=partes.length-1;
          const lin=i.n.length>11?[partes.slice(0,ult).join('.'),'.'+partes[ult]]:[i.n];
          lin.forEach((l,k)=>txt(c,l,43,90+k*15,{size:12,font:F_MONO,weight:600}));
          c.restore();
        });
      }
    };
  }
};

/* 6 · Aves del Estínfalo · Lag del Olimpo */
// Ave de bronce (static/images/ave-bronce.webp, fondo transparente). Si no carga, se dibuja la sencilla.
const imgAve=new Image(); // se pide al abrir la prueba (carga diferida)
function dibujarAve(c,x,y,ala,s=1){
  if(imgAve.complete&&imgAve.naturalWidth){
    const w=86*s,h=w*imgAve.naturalHeight/imgAve.naturalWidth;
    c.save();c.translate(x,y+(ala-.5)*5*s);c.rotate((ala-.5)*.08); // vaivén al batir las alas
    c.drawImage(imgAve,-w/2,-h/2,w,h);c.restore();
    return;
  }
  c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='#b98a4e';c.strokeStyle=P.tinta;c.lineWidth=1.6;
  c.beginPath();c.ellipse(0,0,20,9,0,0,TAU);c.fill();c.stroke();
  c.beginPath();c.moveTo(-6,-2);c.lineTo(8,-2);c.lineTo(0,-6-ala*20);c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(18,-4,7,0,TAU);c.fill();c.stroke();
  c.beginPath();c.moveTo(24,-5);c.lineTo(34,-2);c.lineTo(24,0);c.stroke();
  c.fillStyle=P.tinta;c.beginPath();c.arc(20,-6,1.6,0,TAU);c.fill();
  c.fillStyle='#b98a4e';c.beginPath();c.moveTo(-18,-2);c.lineTo(-31,-9);c.lineTo(-31,6);c.closePath();c.fill();c.stroke();
  c.restore();
}
const aves={
  precarga:()=>{if(!imgAve.src)imgAve.src='/static/images/ave-bronce.webp'},
  how:['Una bandada de aves de bronce cruza el lago, pero la conexión del Olimpo va a trompicones.','Cuenta las aves de cada bandada y elige el número exacto. Son dos bandadas y la segunda es más grande.'],
  limite:100,castigo:15,penal:'Número incorrecto: 8 s y otra bandada',
  start(g){
    let ronda=1,fase,lista,N,dur,tReal,tVisto,lag,congelado,opciones,hov={x:-1,y:-1};
    const BOT=[0,1,2,3].map(k=>({x:120+k*150,y:330,w:110,h:72,size:30}));
    const nueva=()=>{
      N=ronda===1?ri(6,9):ri(10,14);lista=[];let t=.6,carril=-1;
      const sep=ronda===1?rnd(.75,1):rnd(.5,.75);
      for(let k=0;k<N;k++){let cr;do{cr=ri(0,5)}while(cr===carril);carril=cr;lista.push({t0:t,y:90+cr*50+rnd(-8,8),v:rnd(230,300),s:rnd(.85,1.15)});t+=sep+rnd(0,.25)}
      dur=t+W/230+.6;tReal=0;tVisto=0;lag=.1;congelado=0;fase='ver';
      const set=new Set([N]);while(set.size<4)set.add(clamp(N+ri(-3,3),1,18));
      opciones=shuffle([...set]);
      g.hud(`Bandada ${ronda}/2: contad las aves…`);
    };
    nueva();
    return {
      down(p){
        if(fase!=='responder')return;
        const k=BOT.findIndex(b=>dentro(p,b));if(k<0)return;
        if(opciones[k]===N){
          g.chispas(BOT[k].x+55,BOT[k].y+36,20);g.sfx.ok();
          if(ronda===2){fase='hecho';g.ganar();return}
          ronda++;fase='pausa';g.aviso('¡Correcto! Llega la segunda bandada…');g.luego(1400,nueva);
        }else{fase='pausa';g.error(8,'No eran esas aves. Vendrá otra bandada.');g.luego(300,nueva)}
      },
      move(p){hov=p;g.cursor(fase==='responder'&&BOT.some(b=>dentro(p,b))?'pointer':'default')},
      update(dt){
        g.marcador(`BANDADA ${ronda}/2`);
        if(fase!=='ver')return;
        tReal+=dt;
        if(congelado>0)congelado-=dt;
        else{lag-=dt;if(lag<=0){tVisto=tReal;lag=rnd(.07,ronda===1?.2:.28);if(Math.random()<(ronda===1?.1:.18))congelado=rnd(.35,.6)}}
        if(tReal>=dur){fase='responder';g.hud('¿Cuántas aves han cruzado? Elegid un número.')}
      },
      draw(c){
        papel(c);
        c.strokeStyle='rgba(31,74,107,.35)';c.lineWidth=1.5;
        for(let k=0;k<5;k++){c.beginPath();for(let x=20;x<=780;x+=18){const y=420+k*14+Math.sin(x/26+k)*3;x===20?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
        if(fase==='ver'||fase==='pausa'){
          lista.forEach(a=>{const x=-50+(tVisto-a.t0)*a.v;if(x>-60&&x<W+60)dibujarAve(c,x,a.y,(Math.sin(tVisto*14+a.t0)+1)/2,a.s)});
          if(congelado>0||lag<.04){for(let k=0;k<4;k++){const y=rnd(52,H-20),h=rnd(3,12);c.fillStyle='rgba(234,217,174,.85)';c.fillRect(14,y,W-28,h);c.fillStyle='rgba(155,47,31,.35)';c.fillRect(14,y,W-28,1)}}
          c.globalAlpha=.55+.45*Math.abs(Math.sin(g.t*5));
          txt(c,'⚠ CONEXIÓN INESTABLE',W-30,66,{size:13,font:F_MONO,align:'right',color:P.alerta});c.globalAlpha=1;
          c.fillStyle='rgba(183,155,98,.35)';c.fillRect(30,474,740,6);c.fillStyle=P.oro;c.fillRect(30,474,740*clamp(tReal/dur,0,1),6);
        }else{
          txt(c,'¿CUÁNTAS AVES HAN CRUZADO?',W/2,230,{size:26,font:F_TIT,weight:900});
          BOT.forEach((b,k)=>boton(c,b,String(opciones[k]),dentro(hov,b)));
        }
      }
    };
  }
};

/* 7 · Toro de Creta · Laberinto a oscuras */
function laberinto(cols,rows){
  const m=Array.from({length:rows},()=>Array.from({length:cols},()=>({n:1,e:1,s:1,o:1,v:0})));
  const pila=[[0,0]];m[0][0].v=1;
  while(pila.length){
    const [x,y]=pila[pila.length-1];
    const op=[[0,-1,'n','s'],[1,0,'e','o'],[0,1,'s','n'],[-1,0,'o','e']].filter(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&ny>=0&&nx<cols&&ny<rows&&!m[ny][nx].v});
    if(!op.length){pila.pop();continue}
    const [dx,dy,a,b]=pick(op);m[y][x][a]=0;m[y+dy][x+dx][b]=0;m[y+dy][x+dx].v=1;pila.push([x+dx,y+dy]);
  }
  return m;
}
const toro={
  how:['El toro de Creta se ha perdido en un laberinto a oscuras: solo veis lo que alumbra su antorcha.','Llevadlo hasta la puerta dorada con las flechas del teclado (o W A S D), o con los botones de la derecha.'],
  limite:20,castigo:20,penal:'Si se acaba el tiempo: 20 s',
  hud:'Flechas del teclado, W A S D o los botones de la derecha.',
  start(g){
    const COLS=19,ROWS=11,CS=32,OX=24,OY=64,RAD=3.2*CS;
    const m=laberinto(COLS,ROWS);
    const t={c:0,r:0,x:OX+CS/2,y:OY+CS/2,golpe:0};
    const visto=new Set();
    const PAD={arr:{x:678,y:200,w:52,h:52,d:[0,-1,'n']},aba:{x:678,y:316,w:52,h:52,d:[0,1,'s']},izq:{x:620,y:258,w:52,h:52,d:[-1,0,'o']},der:{x:736,y:258,w:52,h:52,d:[1,0,'e']}};
    let fin=false,repite=null,pulsado=null,pasos=0;
    const marcar=()=>{for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(Math.hypot(OX+x*CS+CS/2-(OX+t.c*CS+CS/2),OY+y*CS+CS/2-(OY+t.r*CS+CS/2))<=RAD)visto.add(`${x},${y}`)}};
    marcar();
    const mover=([dx,dy,lado])=>{
      if(fin||g.bloqueado)return;
      if(m[t.r][t.c][lado]){t.golpe=.25;g.sfx.tick();return}
      t.c+=dx;t.r+=dy;pasos++;marcar();g.sfx.pop();
      if(t.c===COLS-1&&t.r===ROWS-1){fin=true;g.luego(300,()=>g.ganar())}
    };
    const TECLAS={ArrowUp:PAD.arr.d,KeyW:PAD.arr.d,ArrowDown:PAD.aba.d,KeyS:PAD.aba.d,ArrowLeft:PAD.izq.d,KeyA:PAD.izq.d,ArrowRight:PAD.der.d,KeyD:PAD.der.d};
    const botonEn=p=>Object.values(PAD).find(b=>dentro(p,b));
    return {
      key(e){const d=TECLAS[e.code];if(d){mover(d);return true}return false},
      down(p){const b=botonEn(p);if(b){pulsado=b;mover(b.d);clearInterval(repite);repite=setInterval(()=>mover(b.d),170)}},
      up(){pulsado=null;clearInterval(repite)},
      move(p){g.cursor(botonEn(p)?'pointer':'default')},
      cerrar(){clearInterval(repite)},
      update(dt){
        g.marcador(`PASOS ${pasos}`);
        const tx=OX+t.c*CS+CS/2,ty=OY+t.r*CS+CS/2;t.x=lerp(t.x,tx,.35);t.y=lerp(t.y,ty,.35);t.golpe=Math.max(0,t.golpe-dt);
      },
      draw(c){
        papel(c);
        caja(c,OX-6,OY-6,COLS*CS+12,ROWS*CS+12,{fondo:P.papel,borde:P.tinta,grosor:2});
        const sx=OX+(COLS-1)*CS,sy=OY+(ROWS-1)*CS;
        c.strokeStyle=P.tinta;c.lineWidth=3;c.lineCap='square';
        c.beginPath();
        for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
          const k=m[y][x],X=OX+x*CS,Y=OY+y*CS;
          if(k.n){c.moveTo(X,Y);c.lineTo(X+CS,Y)}
          if(k.o){c.moveTo(X,Y);c.lineTo(X,Y+CS)}
          if(y===ROWS-1&&k.s){c.moveTo(X,Y+CS);c.lineTo(X+CS,Y+CS)}
          if(x===COLS-1&&k.e){c.moveTo(X+CS,Y);c.lineTo(X+CS,Y+CS)}
        }
        c.stroke();
        // oscuridad en una sola capa (sin costuras): lo visitado queda en penumbra
        // y alrededor del toro se abre un círculo de luz con el borde suave
        c.save();
        c.beginPath();c.rect(OX-4,OY-4,COLS*CS+8,ROWS*CS+8);c.arc(t.x,t.y,RAD,0,TAU,true);c.clip('evenodd');
        const capa=(cond,a)=>{c.beginPath();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(cond(`${x},${y}`))c.rect(OX+x*CS-(x?0:4),OY+y*CS-(y?0:4),CS+(x===COLS-1||!x?4:0),CS+(y===ROWS-1||!y?4:0));c.fillStyle=`rgba(42,28,13,${a})`;c.fill()};
        capa(k=>!visto.has(k),1);capa(k=>visto.has(k),.6);
        c.restore();
        const halo=c.createRadialGradient(t.x,t.y,RAD*.6,t.x,t.y,RAD);
        halo.addColorStop(0,'rgba(42,28,13,0)');halo.addColorStop(1,'rgba(42,28,13,.55)');
        c.save();c.beginPath();c.rect(OX-4,OY-4,COLS*CS+8,ROWS*CS+8);c.clip();
        c.fillStyle=halo;c.beginPath();c.arc(t.x,t.y,RAD,0,TAU);c.fill();c.restore();
        c.fillStyle='rgba(185,130,26,.35)';c.fillRect(sx+3,sy+3,CS-6,CS-6);
        icono(c,'arco',sx+CS/2,sy+CS/2,24,'#f1c45c',2);
        const gx=t.golpe>0?rnd(-3,3):0;
        c.fillStyle=P.papel;c.beginPath();c.arc(t.x+gx,t.y,12,0,TAU);c.fill();
        icono(c,'toro',t.x+gx,t.y,22,P.alerta,2);
        Object.entries(PAD).forEach(([k,b])=>{
          boton(c,b,{arr:'▲',aba:'▼',izq:'◀',der:'▶'}[k],pulsado===b);
        });
        txt(c,'SALIDA:',704,420,{size:13,font:F_TIT});txt(c,'abajo a la derecha',704,440,{size:13,font:F_MONO,weight:600,color:P.dim});
      }
    };
  }
};

/* 8 · Yeguas de Diomedes · Simon dice (como el original) */
const yeguas={
  how:['Las yeguas de Diomedes relinchan en un orden secreto.','Mirad qué yegua se ilumina y repetid la secuencia pulsándolas (o con las teclas 1, 2, 3 y 4). Son 6 rondas, cada una más larga y más rápida.'],
  limite:35,castigo:15,penal:'Fallo: 5 s y se repite la ronda',
  hud:'Mirad la secuencia y repetidla.',
  start(g){
    const NOM=['Podargo','Lampón','Janto','Dinos'],COL=[P.oroT,P.acento,P.alerta,P.tinta];
    const B=[{x:160,y:96,w:230,h:150},{x:410,y:96,w:230,h:150},{x:160,y:266,w:230,h:150},{x:410,y:266,w:230,h:150}];
    const RONDAS=6,sec=Array.from({length:RONDAS+1},()=>ri(0,3));
    let ronda=1,pos=0,fase='mostrar',luz=-1,cola=[],reloj=0,hov=-1;
    const ritmo=()=>Math.max(.32,.7-ronda*.06);
    const mostrar=()=>{fase='mostrar';pos=0;cola=[];reloj=0;let t=.6;for(let k=0;k<ronda+1;k++){cola.push({t,k:sec[k]});t+=ritmo()}cola.push({t,k:-2});g.hud(`Ronda ${ronda}/${RONDAS}: mirad…`)};
    mostrar();
    const pulsar=k=>{
      if(fase!=='jugar')return;
      luz=k;g.sfx.note(k);g.luego(200,()=>{if(luz===k)luz=-1});
      if(k===sec[pos]){
        pos++;
        if(pos===ronda+1){
          if(ronda===RONDAS){fase='fin';g.luego(350,()=>g.ganar());return}
          ronda++;g.sfx.ok();fase='pausa';g.luego(700,mostrar);
        }
      }else{fase='pausa';g.error(5,'¡Las yeguas se encabritan! Repetid la ronda.');g.luego(400,mostrar)}
    };
    return {
      down(p){const k=B.findIndex(b=>dentro(p,b));if(k>=0)pulsar(k)},
      move(p){hov=B.findIndex(b=>dentro(p,b));g.cursor(fase==='jugar'&&hov>=0?'pointer':'default')},
      key(e){const k='1234'.indexOf(e.key);if(k>=0){pulsar(k);return true}return false},
      update(dt){
        g.marcador(`RONDA ${ronda}/${RONDAS}   ·   ${fase==='jugar'?'VUESTRO TURNO':'MIRAD'}`);
        if(fase!=='mostrar')return;
        reloj+=dt;
        while(cola.length&&reloj>=cola[0].t){
          const ev=cola.shift();
          if(ev.k===-2){fase='jugar';luz=-1;g.hud(`Ronda ${ronda}/${RONDAS}: ¡vuestro turno!`)}
          else{luz=ev.k;g.sfx.note(ev.k);g.luego(ritmo()*650,()=>{if(fase==='mostrar')luz=-1})}
        }
      },
      draw(c){
        papel(c);
        B.forEach((b,k)=>{
          const on=luz===k;
          if(on){c.save();c.shadowColor=COL[k];c.shadowBlur=24;c.fillStyle=COL[k];c.fillRect(b.x,b.y,b.w,b.h);c.restore()}
          else{c.fillStyle=hov===k&&fase==='jugar'?P.papel2:P.papel;c.fillRect(b.x,b.y,b.w,b.h)}
          c.lineWidth=2;c.strokeStyle=COL[k];c.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);
          icono(c,'caballo',b.x+b.w/2,b.y+58,58,on?P.papel:COL[k],2);
          txt(c,`${k+1} · ${NOM[k].toUpperCase()}`,b.x+b.w/2,b.y+b.h-24,{size:15,font:F_TIT,color:on?P.papel:COL[k]});
        });
        for(let k=0;k<RONDAS;k++){c.fillStyle=k<ronda-1||fase==='fin'?P.oro:'rgba(183,155,98,.4)';c.fillRect(W/2-66+k*24,440,14,14)}
      }
    };
  }
};

/* 9 · Cinturón de Hipólita · Bit roto */
const hipolita={
  how:['El cinturón de Hipólita está tejido con píxeles y gemas.','En cada cinturón hay UNA gema mal puesta: encontradla y pulsadla. Son 4 cinturones, cada uno más difícil.'],
  limite:18,castigo:15,penal:'Gema equivocada: 4 s de espera',
  hud:'Buscad la gema que no encaja y pulsadla.',
  start(g){
    const COLS=26,ROWS=7,CS=26,OX=(W-COLS*CS)/2,OY=200;
    const GEMAS=['#9b2f1f','#1f4a6b','#5d6b2f'];
    let ronda=1,roto=null,mal=null,hover=null;
    const motivo=col=>{const m=Math.round((col-2)/4);return {m,cx:2+m*4}};
    const base=(col,r)=>{
      if(r===0||r===ROWS-1)return col%2?'#c99a3a':'#a37a25';
      const {m,cx}=motivo(col),d=Math.abs(col-cx)+Math.abs(r-3);
      if(cx>=0&&cx<COLS&&d<=1)return GEMAS[((m%3)+3)%3];
      if(cx>=0&&cx<COLS&&d===2)return '#c99a3a';
      return (col+r)%2?'#7a5534':'#6f4b2c';
    };
    const aclarar=(hex,t)=>{const n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,n>>8&255,n&255].map(v=>Math.round(lerp(v,255,t)))})`};
    const nuevo=()=>{
      const cands=[];for(let col=0;col<COLS;col++)for(let r=1;r<ROWS-1;r++){const {m,cx}=motivo(col);if(cx>=0&&cx<COLS&&Math.abs(col-cx)+Math.abs(r-3)<=1)cands.push({col,r,m:((m%3)+3)%3})}
      const k=pick(cands),orig=GEMAS[k.m];
      const color=ronda===1?'#8a4fa8':ronda===2?GEMAS[(k.m+1)%3]:ronda===3?aclarar(orig,.3):aclarar(orig,.16);
      roto={col:k.col,r:k.r,color};
    };
    nuevo();
    const celda=p=>{const col=Math.floor((p.x-OX)/CS),r=Math.floor((p.y-OY)/CS);return col>=0&&col<COLS&&r>=0&&r<ROWS?{col,r}:null};
    return {
      down(p){
        const k=celda(p);if(!k)return;
        if(k.col===roto.col&&k.r===roto.r){
          g.sfx.ok();g.chispas(OX+k.col*CS+13,OY+k.r*CS+13,22);
          if(ronda===4){roto=null;g.ganar();return}
          ronda++;nuevo();g.aviso(`¡Bien! Cinturón ${ronda} de 4.`);
        }else{mal={...k,t:.5};g.error(4,'Esa gema está en su sitio.')}
      },
      move(p){hover=celda(p);g.cursor(hover?'pointer':'default')},
      update(dt){if(mal)mal.t-=dt;g.marcador(`CINTURÓN ${ronda}/4`)},
      draw(c){
        papel(c);
        txt(c,`CINTURÓN ${ronda} DE 4`,W/2,100,{size:24,font:F_TIT,weight:900});
        txt(c,['Una gema de un color extraño','Una gema del color de otra','Un tono algo más claro','Un tono apenas distinto'][ronda-1],W/2,134,{size:17,weight:500,color:P.dim});
        caja(c,OX-12,OY-12,COLS*CS+24,ROWS*CS+24,{fondo:'#4a3220',borde:P.tinta,grosor:2});
        for(let r=0;r<ROWS;r++)for(let col=0;col<COLS;col++){
          c.fillStyle=roto&&roto.col===col&&roto.r===r?roto.color:base(col,r);c.fillRect(OX+col*CS,OY+r*CS,CS,CS);
        }
        c.strokeStyle='rgba(42,28,13,.35)';c.lineWidth=1;c.beginPath();
        for(let col=0;col<=COLS;col++){c.moveTo(OX+col*CS+.5,OY);c.lineTo(OX+col*CS+.5,OY+ROWS*CS)}
        for(let r=0;r<=ROWS;r++){c.moveTo(OX,OY+r*CS+.5);c.lineTo(OX+COLS*CS,OY+r*CS+.5)}
        c.stroke();
        if(hover){c.lineWidth=2;c.strokeStyle=P.papel;c.strokeRect(OX+hover.col*CS+1,OY+hover.r*CS+1,CS-2,CS-2)}
        if(mal&&mal.t>0){c.lineWidth=3;c.strokeStyle=P.alerta;c.strokeRect(OX+mal.col*CS,OY+mal.r*CS,CS,CS)}
        [OX-46,OX+COLS*CS+10].forEach(x=>{caja(c,x,OY+26,36,ROWS*CS-52,{fondo:'#c99a3a',borde:P.tinta,grosor:2})});
        icono(c,'gema',W/2,OY+ROWS*CS+56,30,P.oroT,1.8);
      }
    };
  }
};

/* 10 · Bueyes de Gerión · Atajos de teclado */
const ATAJOS=[['C','Copiar','copiar'],['X','Cortar','cortar'],['V','Pegar','pegar'],['Z','Deshacer','deshacer'],['Y','Rehacer','rehacer'],['S','Guardar','disquete'],['F','Buscar','buscar'],['H','Reemplazar','reemplazar'],['P','Imprimir','imprimir'],['A','Seleccionar todo','seleccionar']];
const gerion={
  how:['Gerión tiene tres cuerpos y su rebaño se ha mezclado: cada atajo tiene que volver con su acción.','Arrastrad desde la tecla hasta la acción (o pulsad la tecla y luego la acción). Hay acciones que se parecen mucho.'],
  limite:20,castigo:15,penal:'Pareja equivocada: 5 s de espera',
  hud:'Arrastrad desde cada atajo hasta su acción.',
  start(g){
    const sel=shuffle(ATAJOS).slice(0,6);
    const izq=sel.map((a,k)=>({k,letra:a[0],x:60,y:62+k*68,w:220,h:54,hecho:false}));
    const der=shuffle(sel.map((a,k)=>({k,nom:a[1],ico:a[2]}))).map((o,j)=>({...o,x:500,y:62+j*68,w:250,h:54,hecho:false}));
    let arr=null,elegida=null,mal=null,hover=null;
    const nodoI=b=>({x:b.x+b.w+10,y:b.y+b.h/2}),nodoD=b=>({x:b.x-10,y:b.y+b.h/2});
    const unir=(a,b)=>{
      if(a.k===b.k){a.hecho=b.hecho=true;g.sfx.ok();const q=nodoD(b);g.chispas(q.x,q.y,12);if(izq.every(x=>x.hecho))g.luego(300,()=>g.ganar())}
      else{mal={a,b,t:.8};g.error(5,`Ctrl + ${a.letra} no sirve para «${b.nom}».`)}
    };
    return {
      down(p){
        const a=izq.find(b=>!b.hecho&&dentro(p,b));
        if(a){arr={a,x:p.x,y:p.y};elegida=a;g.sfx.tick();return}
        const d=der.find(b=>!b.hecho&&dentro(p,b));
        if(d&&elegida){unir(elegida,d);elegida=null}
      },
      move(p){if(arr){arr.x=p.x;arr.y=p.y;return}hover=[...izq,...der].find(b=>!b.hecho&&dentro(p,b));g.cursor(hover?'pointer':'default')},
      up(p){if(!arr)return;const d=der.find(b=>!b.hecho&&dentro(p,b));if(d){unir(arr.a,d);elegida=null}arr=null},
      update(dt){if(mal)mal.t-=dt;g.marcador(`PAREJAS ${izq.filter(x=>x.hecho).length}/6`)},
      draw(c){
        papel(c);
        const cable=(a,b,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x+90,a.y,b.x-90,b.y,b.x,b.y);c.stroke()};
        izq.forEach(a=>{if(a.hecho){const b=der.find(d=>d.k===a.k);cable(nodoI(a),nodoD(b),P.oro,3)}});
        if(mal&&mal.t>0)cable(nodoI(mal.a),nodoD(mal.b),P.alerta,3);
        if(arr)cable(nodoI(arr.a),{x:arr.x,y:arr.y},P.tinta,2);
        izq.forEach(a=>{
          caja(c,a.x,a.y,a.w,a.h,{fondo:a.hecho?'#f1dca3':hover===a||elegida===a?P.papel2:P.papel,borde:a.hecho?P.oro:elegida===a?P.tinta:P.linea,grosor:elegida===a?2:1});
          [['Ctrl',a.x+18,70],[a.letra,a.x+128,46]].forEach(([t,x,w])=>{c.fillStyle=P.papel;c.fillRect(x,a.y+10,w,34);c.lineWidth=1.5;c.strokeStyle=P.tinta;c.strokeRect(x+.5,a.y+10.5,w-1,33);c.fillStyle='rgba(42,28,13,.15)';c.fillRect(x+1,a.y+38,w-2,5);txt(c,t,x+w/2,a.y+26,{size:17,font:F_MONO})});
          txt(c,'+',a.x+109,a.y+27,{size:18,color:P.dim});
          c.fillStyle=a.hecho?P.oro:P.papel;c.strokeStyle=P.tinta;c.lineWidth=1.5;c.beginPath();c.arc(nodoI(a).x,nodoI(a).y,6,0,TAU);c.fill();c.stroke();
        });
        der.forEach(d=>{
          caja(c,d.x,d.y,d.w,d.h,{fondo:d.hecho?'#f1dca3':hover===d?P.papel2:P.papel,borde:d.hecho?P.oro:P.linea});
          icono(c,d.ico,d.x+30,d.y+d.h/2,24,d.hecho?P.oroT:P.tinta,1.8);
          txt(c,d.nom.toUpperCase(),d.x+56,d.y+d.h/2+1,{size:14,font:F_TIT,align:'left',color:d.hecho?P.oroT:P.tinta});
          c.fillStyle=d.hecho?P.oro:P.papel;c.strokeStyle=P.tinta;c.lineWidth=1.5;c.beginPath();c.arc(nodoD(d).x,nodoD(d).y,6,0,TAU);c.fill();c.stroke();
        });
      }
    };
  }
};

/* 11 · Manzanas de las Hespérides · QR y cifrado (prueba física) */
// Ilustraciones sin fondo (carga diferida): el árbol con Ladón y una manzana de oro que se repite sobre la copa
const imgArbolHesp=new Image(),imgManzana=new Image();
const HESP_ARBOL={x:266,y:138,h:340};   // dónde va el árbol en el canvas (la imagen mide 619x640)
const HESP_MANZANAS=[[150,105],[305,60],[455,95],[85,225],[255,185],[400,200],[535,245],[175,300],[470,320]]; // sobre la copa, en px de la imagen
const listaImg=im=>im.complete&&im.naturalWidth>0;
const hesperides={
  precarga:()=>{if(!imgArbolHesp.src){imgArbolHesp.src='/static/images/hesperides-arbol.webp';imgManzana.src='/static/images/manzana-oro.webp'}},
  how:['Las manzanas de oro no están en esta pantalla: el dragón Ladón las esconde.','Buscad por la sala el código QR del jardín y escaneadlo con el móvil. Descifrad el mensaje y escribid aquí la palabra.'],
  penal:'Respuesta incorrecta: 20 s de espera',
  hud:'Escribid abajo la palabra descifrada y pulsad «Comprobar».',
  start(g){
    let caen=-1,parpadeo=0,ocupado=false;
    const manz=[[330,190],[400,160],[470,195],[360,240],[440,232],[405,275]];
    g.marcador('PRUEBA FÍSICA · QR');
    g.pedir('Palabra descifrada',v=>{
      if(ocupado)return;ocupado=true;g.hud('Comprobando con el oráculo…');
      g.host.validar(v).then(r=>{
        ocupado=false;
        if(r.ok){caen=0;g.sfx.ok();g.luego(1200,()=>g.ganar(v,true))}
        else{g.hud('Escribid abajo la palabra descifrada y pulsad «Comprobar».');g.error(20,r.msg||'Ladón no se mueve: esa no es la palabra.')}
      });
    });
    return {
      update(dt){parpadeo=(parpadeo+dt)%4;if(caen>=0)caen+=dt},
      draw(c){
        papel(c);
        c.strokeStyle=P.tinta;c.lineWidth=2;c.fillStyle=P.papel2;
        c.beginPath();c.moveTo(14,470);c.quadraticCurveTo(400,400,786,470);c.lineTo(786,486);c.lineTo(14,486);c.closePath();c.fill();c.stroke();
        if(listaImg(imgArbolHesp)){
          // Árbol con Ladón (imagen) y manzanas de oro encima de la copa
          const esc=HESP_ARBOL.h/imgArbolHesp.naturalHeight;
          c.drawImage(imgArbolHesp,HESP_ARBOL.x,HESP_ARBOL.y,imgArbolHesp.naturalWidth*esc,HESP_ARBOL.h);
          const mw=24,mh=listaImg(imgManzana)?mw*imgManzana.naturalHeight/imgManzana.naturalWidth:mw;
          HESP_MANZANAS.forEach(([px,py],k)=>{
            const x=HESP_ARBOL.x+px*esc,y=HESP_ARBOL.y+py*esc;
            const yy=caen>=0?Math.min(462-mh/2,y+caen*caen*300*(1+k*.15)):y+Math.sin(g.t*2+k)*1.5;
            if(listaImg(imgManzana))c.drawImage(imgManzana,x-mw/2,yy-mh/2,mw,mh);
            else{c.fillStyle=P.oro;c.strokeStyle=P.tinta;c.lineWidth=2;c.beginPath();c.arc(x,yy,10,0,TAU);c.fill();c.stroke()}
          });
        }else{
          // Respaldo mientras carga la imagen: árbol y Ladón dibujados
          c.fillStyle='#8a6a44';c.fillRect(388,270,24,170);c.strokeRect(388,270,24,170);
          c.fillStyle='#c9c58a';[[400,215,115],[345,200,70],[455,205,70]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.stroke()});
          manz.forEach(([x,y],k)=>{
            const yy=caen>=0?Math.min(450,y+caen*caen*300*(1+k*.15)):y+Math.sin(g.t*2+k)*2;
            c.fillStyle=P.oro;c.beginPath();c.arc(x,yy,12,0,TAU);c.fill();c.stroke();
          });
          c.lineCap='round';c.strokeStyle=P.tinta;c.lineWidth=18;
          c.beginPath();c.moveTo(230,455);c.bezierCurveTo(320,395,470,445,420,365);c.bezierCurveTo(380,315,470,305,520,335);c.stroke();
          c.strokeStyle='#7d8f4a';c.lineWidth=14;c.stroke();
          c.fillStyle='#7d8f4a';c.strokeStyle=P.tinta;c.lineWidth=2;c.beginPath();c.ellipse(540,333,26,17,.3,0,TAU);c.fill();c.stroke();
          c.fillStyle=parpadeo>3.85?'#7d8f4a':P.alerta;c.beginPath();c.arc(547,326,4,0,TAU);c.fill();
        }
        c.strokeStyle=P.tinta;c.lineWidth=2;
        // pista del QR
        caja(c,40,70,240,150,{fondo:P.papel,borde:P.oro,grosor:2});
        const Q=[[1,1,1,0,1,0,1,1,1],[1,0,1,0,0,1,1,0,1],[1,1,1,0,1,1,1,1,1],[0,0,0,1,0,1,0,0,0],[1,0,1,1,1,0,1,1,0],[0,1,0,0,1,1,0,1,1],[1,1,1,0,0,1,1,0,1],[1,0,1,1,0,0,0,1,0],[1,1,1,0,1,1,1,0,1]];
        c.fillStyle=P.tinta;Q.forEach((f,y)=>f.forEach((v,x)=>{if(v)c.fillRect(58+x*11,98+y*11,10,10)}));
        txt(c,'BUSCAD',212,118,{size:15,font:F_TIT,color:P.oroT});txt(c,'este código',212,144,{size:15,weight:500,color:P.dim});txt(c,'en la sala',212,166,{size:15,weight:500,color:P.dim});
        caja(c,604,410,182,52,{fondo:P.papel,borde:P.linea});
        txt(c,'Escribid la palabra',695,428,{size:14,weight:500,color:P.dim});txt(c,'en la casilla de abajo ↓',695,446,{size:13,weight:500,color:P.dim});
      }
    };
  }
};

/* 12 · Cerbero · Tres cabezas, tres sentidos */
const LETRA_R=[[0,0],[0,1.5],[0,3],[0,4.5],[0,6],[1.5,0],[3,0],[4,1],[4,2],[3,3],[1.5,3],[2.6,4.4],[3.6,5.6]];
const ESTRELLAS_FALSAS=[[-2,1],[6,0],[7,4],[-1,5],[2,7],[6,6],[1,-.4],[5,-.4]];
// Ilustración de Cerbero sin fondo (static/images/cerbero.webp, 752x600). Si no carga, se dibujan las cabezas sencillas.
const imgCerbero=new Image(); // se pide al abrir la prueba (carga diferida)
const CERB_IMG={x:218,y:92,h:290};            // dónde va la ilustración en el canvas
const CERB_CABEZAS=[[130,250],[376,270],[622,250]]; // centro de cada cabeza dentro de la imagen
const cerbero={
  precarga:()=>{if(!imgCerbero.src)imgCerbero.src='/static/images/cerbero.webp'},
  how:['Cerbero tiene tres cabezas y cada una guarda una letra: una se ve, otra se oye (subid el volumen) y otra se lee.','Pulsad las tres cabezas y escribid las tres letras en orden, de izquierda a derecha.'],
  penal:'Respuesta incorrecta: 20 s de espera',
  hud:'Pulsad las tres cabezas de Cerbero.',
  start(g){
    const conImagen=imgCerbero.complete&&imgCerbero.naturalWidth>0;
    const esc=CERB_IMG.h/(conImagen?imgCerbero.naturalHeight:600);
    const CAB=[{x:240,y:205,ico:'ojo',nom:'VISTA'},{x:400,y:178,ico:'oreja',nom:'OÍDO'},{x:560,y:205,ico:'pergamino',nom:'TEXTO'}];
    // las posiciones de las cabezas están medidas sobre una imagen de 600 px de alto
    const ref=CERB_IMG.h/600;
    if(conImagen)CAB.forEach((h,k)=>{h.x=CERB_IMG.x+CERB_CABEZAS[k][0]*ref;h.y=CERB_IMG.y+CERB_CABEZAS[k][1]*ref});
    const visto=[false,false,false];
    let act=-1,dormidos=false,ocupado=false,anim=0,sinVoz=false,hov=-1;
    const hablar=()=>{
      try{
        if(!window.speechSynthesis)return false;
        speechSynthesis.cancel();
        const u=new SpeechSynthesisUtterance('La segunda letra es la i. I, de Inframundo.');
        u.lang='es-ES';u.rate=.85;speechSynthesis.speak(u);return true;
      }catch(e){return false}
    };
    const listo=()=>{
      g.hud('Escribid las tres letras en orden (izquierda, centro, derecha).');
      g.pedir('Las tres letras',v=>{
        if(ocupado)return;ocupado=true;g.hud('Cerbero escucha…');
        g.host.validar(v).then(r=>{
          ocupado=false;
          if(r.ok){dormidos=true;g.sfx.ok();g.luego(1300,()=>g.ganar(v,true))}
          else{g.hud('Escribid las tres letras en orden (izquierda, centro, derecha).');g.error(20,r.msg||'Cerbero gruñe: esas no son las letras.')}
        });
      });
    };
    // la cabeza más cercana al clic (en la ilustración las cabezas se tocan)
    const bajo=p=>{let k=-1,m=conImagen?66:56;CAB.forEach((h,i)=>{const d=Math.hypot(p.x-h.x,p.y-h.y);if(d<m){m=d;k=i}});return k};
    return {
      down(p){
        if(dormidos)return;
        const k=bajo(p);if(k<0)return;
        const nuevo=!visto.every(Boolean);
        act=k;visto[k]=true;anim=0;g.sfx.pop();
        if(k===1)sinVoz=!hablar();
        if(nuevo&&visto.every(Boolean))listo();
      },
      move(p){hov=bajo(p);g.cursor(hov>=0?'pointer':'default')},
      update(dt){anim+=dt;g.marcador(`CABEZAS CALMADAS ${visto.filter(Boolean).length}/3`)},
      cerrar(){try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}},
      draw(c){
        papel(c);
        if(conImagen){
          const w=imgCerbero.naturalWidth*esc;
          c.imageSmoothingQuality='high';
          c.drawImage(imgCerbero,CERB_IMG.x,CERB_IMG.y,w,CERB_IMG.h);
          CAB.forEach((h,k)=>{
            if(hov===k&&!dormidos&&act!==k){c.lineWidth=2;c.strokeStyle='rgba(243,232,200,.9)';c.beginPath();c.ellipse(h.x,h.y,60,56,0,0,TAU);c.stroke()}
            if(act===k){c.lineWidth=3;c.strokeStyle=P.oro;c.setLineDash([6,4]);c.beginPath();c.ellipse(h.x,h.y,60,56,0,0,TAU);c.stroke();c.setLineDash([])}
            // rótulo de cada cabeza, encima de la ilustración
            caja(c,h.x-46,54,92,32,{fondo:P.papel,borde:visto[k]?P.oro:P.linea,grosor:visto[k]?2:1});
            icono(c,h.ico,h.x-26,70,18,visto[k]?P.oroT:P.tinta,1.8);
            txt(c,h.nom,h.x+10,71,{size:12,font:F_TIT,color:visto[k]?P.oroT:P.tinta});
            if(dormidos)txt(c,'z z z',h.x+36,h.y-50-(g.t*20%20),{size:18,color:P.papel});
          });
        }else{
        c.fillStyle=P.papel2;c.strokeStyle=P.tinta;c.lineWidth=2;
        c.beginPath();c.ellipse(400,345,220,70,0,0,TAU);c.fill();c.stroke();
        CAB.forEach((h,k)=>{
          const bal=dormidos?0:Math.sin(g.t*2+k)*3;
          c.fillStyle=hov===k&&!dormidos?'#d9c08c':P.papel3;c.strokeStyle=P.tinta;c.lineWidth=2;
          c.beginPath();c.moveTo(h.x-28,h.y+16);c.lineTo(h.x-42,h.y-48+bal);c.lineTo(h.x-10,h.y-30);c.closePath();c.fill();c.stroke();
          c.beginPath();c.moveTo(h.x+28,h.y+16);c.lineTo(h.x+42,h.y-48+bal);c.lineTo(h.x+10,h.y-30);c.closePath();c.fill();c.stroke();
          c.beginPath();c.ellipse(h.x,h.y+bal,46,42,0,0,TAU);c.fill();c.stroke();
          c.fillStyle=P.papel;c.beginPath();c.ellipse(h.x,h.y+26+bal,22,15,0,0,TAU);c.fill();c.stroke();
          c.fillStyle=P.tinta;c.beginPath();c.ellipse(h.x,h.y+17+bal,7,5,0,0,TAU);c.fill();
          [-1,1].forEach(d=>{
            if(dormidos||visto[k]){c.lineWidth=2;c.beginPath();c.arc(h.x+d*16,h.y-8+bal,6,.15*Math.PI,.85*Math.PI);c.stroke()}
            else{c.fillStyle=P.alerta;c.beginPath();c.arc(h.x+d*16,h.y-8+bal,5,0,TAU);c.fill()}
          });
          if(act===k){c.lineWidth=2;c.strokeStyle=P.oro;c.setLineDash([5,4]);c.beginPath();c.ellipse(h.x,h.y+bal,56,52,0,0,TAU);c.stroke();c.setLineDash([])}
          caja(c,h.x-50,h.y-108,100,34,{fondo:P.papel,borde:visto[k]?P.oro:P.linea,grosor:visto[k]?2:1});
          icono(c,h.ico,h.x-28,h.y-91,20,visto[k]?P.oroT:P.tinta,1.8);
          txt(c,h.nom,h.x+12,h.y-90,{size:13,font:F_TIT,color:visto[k]?P.oroT:P.tinta});
          if(dormidos)txt(c,'z z z',h.x+42,h.y-56-(g.t*20%20),{size:16,color:P.dim});
        });
        }
        caja(c,150,384,500,92,{fondo:P.papel,borde:P.oro,grosor:2});
        if(act===-1)txt(c,'Pulsad una cabeza para que os dé su letra',400,430,{size:17,weight:500,color:P.dim});
        if(act===0){
          txt(c,'La primera letra',290,418,{size:16,weight:500,color:P.dim});txt(c,'está en las estrellas',290,442,{size:16,weight:500,color:P.dim});
          const visible=Math.min(1,anim/1.2);
          [...LETRA_R,...ESTRELLAS_FALSAS].forEach(([x,y],k)=>{
            const falsa=k>=LETRA_R.length,X=488+x*16,Y=400+y*10,r=falsa?2.2:3.4;
            c.globalAlpha=visible*(falsa?.6:1);c.fillStyle=P.tinta;
            c.save();c.translate(X,Y);c.rotate(Math.PI/4);c.fillRect(-r,-r,r*2,r*2);c.restore();
          });
          c.globalAlpha=1;
        }
        if(act===1){
          if(sinVoz)txt(c,'Vuestro navegador no habla. La cabeza susurra: «i»',400,430,{size:16,weight:500,color:P.dim});
          else{
            txt(c,'Escuchad (subid el volumen). Pulsad otra vez para repetir.',400,410,{size:15,weight:500,color:P.dim});
            for(let k=0;k<16;k++){const hh=4+Math.abs(Math.sin(g.t*8+k))*20;c.fillStyle=P.oroT;c.fillRect(320+k*10,452-hh/2,5,hh)}
          }
        }
        if(act===2){txt(c,'«Soy la letra con la que empieza',400,418,{size:18,font:F_TIT,color:P.oroT});txt(c,'y termina OLIMPO»',400,444,{size:18,font:F_TIT,color:P.oroT})}
      }
    };
  }
};

const JUEGOS=[leon,hidra,cierva,jabali,augias,aves,toro,yeguas,hipolita,gerion,hesperides,cerbero];
window.HeraclesJuegos={abrir,cerrar};
})();
