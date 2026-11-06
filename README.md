# HERACLES.EXE // Escape Room Digital - Los 12 Trabajos del Codigo

**JPIM - Grupo 4 (DAW - Desarrollo de Aplicaciones Web)**  
*Proyecto Intermodular: DIW, DWEC, DWES y Despliegue de Aplicaciones Web*

---

## 1. Descripcion del Proyecto

Este proyecto es una aplicacion web interactiva de Escape Room digital basada en los 12 Trabajos de Heracles adaptados a los retos tecnicos del ciclo formativo de DAW.

La aplicacion consta de cuatro vistas conectadas entre si y sincronizadas con el Backend:

1. **Pantalla 1 - Web Averiada (Landing Page) (`/`):**
   * Archivo: `templates/index.html` y estilos `static/css/webAveriada.css`.
   * El templo sagrado del Olimpo esta corrompido por la maldicion de Hera arrojando un error HTTP 500.
   * La lista de secciones (`<ul id="grid">`) es hidratada por `static/js/webAveriada.js`.
   * Intro de terminal (bootloader verde, inyeccion burdeos y quimera ASCII) que se puede saltar con [SALTAR INTRO] o Escape.
   * Cabecera con el logo y el cuadro de estado (Sistema, Grupo, Tiempo, HTTP) en la misma fila, y menu tachado (no disponible).

2. **Pantalla de Identificacion de Grupo (`/login`):**
   * Archivo: `templates/login.html`.
   * Permite registrar un grupo nuevo o seleccionar uno existente de la base de datos relacional.
   * Registro del nombre del grupo y PIN de acceso opcional de 4 digitos (se guarda con hash).
   * Persistencia en la tabla `teams` de SQLite (`heracles.db`) y sesion activa.

3. **Pantalla 2 - Mapa de la Helade (`/mapa`):**
   * Archivo: `templates/mapa.html` y estilos `static/css/styles.css`.
   * Cartografia de Grecia (`static/images/mapaGriego.webp`) con niebla de guerra dinamica renderizada sobre un lienzo `<canvas id="fog">`.
   * 12 pines interactivos (`<button class="pin">`) que abren el minijuego de cada prueba en `<dialog id="juego">` (`static/js/juegos.js`); la logica del mapa esta en `static/js/main.js`.
   * La prueba 11 aparece con candado: solo la administracion puede darla por superada.
   * El mapa y los pines se adaptan al ancho del movil sin scroll horizontal.
   * Muestra el nombre del grupo activo, el tiempo restante (calculado por el servidor), los trabajos superados y la contraseña parcial.
   * Cada 15 s recoge las pruebas que la administracion haya dado por superadas, sin recargar.
   * Zona de pedestales (`#slots`) para introducir la contraseña final:
     ```text
     HERACLES.EXE (12 caracteres)
     ```
   * Al validar la clave, se realiza una peticion `POST /api/verify` al servidor, vinculando la victoria al equipo en la base de datos.

4. **Pantalla 3 - Web Restaurada (`/restaurada`):**
   * Archivo: `templates/webRestaurada.html` y estilos `static/css/webRestaurada.css`.
   * El templo dorado refulge con estado HTTP 200 y sistema RESTAURADO.
   * Muestra el nombre del grupo victorioso y su tiempo en el mensaje de gloria.
   * Podio con los cuatro últimos grupos registrados, renderizado con Jinja2 desde la base de datos.
   * Buscador de secciones (`#q`) gestionado por `static/js/webRestaurada_2.js`.
   * «Oraculo · como se restauro»: cuatro pasos que resumen el recorrido (explorar el mapa, vencer contra el reloj, descifrar el oraculo y unir las piezas).
   * Menu: Inicio, Dioses, Clasificacion, Oraculo y «Cambiar Grupo» (el boton «Volver al Mapa» se quito).
   * Modo presentacion (`?presentacion=1`): solo con la sesion de administracion abierta.

---

## 2. Las 12 pruebas: fichas técnicas y soluciones

Cada prueba es un minijuego en un canvas emergente (`static/js/juegos.js`) que se abre desde su pin del mapa.
Al superarla se muestra **el carácter y la casilla (posición) que ocupa** en la contraseña final `HERACLES.EXE`.
Todas tienen tiempo límite; los errores y el tiempo agotado se castigan con una espera que se guarda en el
navegador (cerrar la ventana no la salta). La prueba 12 se comprueba en el servidor (`/api/validate-trial`
con las soluciones de `heracles/game_data.py`); el resto se resuelve jugando y el servidor registra la superación
en la base de datos, exigiendo al menos 5 s entre pruebas para frenar scripts. La prueba 11 está **bloqueada**:
el servidor rechaza su respuesta y solo la administración puede darla por superada.

| Pos. | Trabajo | Módulo | Prueba (mecánica) | Solución | Carácter | Tiempo / castigo |
|:---:|:---|:---:|:---|:---|:---:|:---|
| 1 | León de Nemea | DIW | Colores RGB: igualar la melena del león con tres deslizadores (dos tonos) | Ajustar cada canal hasta que las tres pistas digan «✓ Bien» (±8) y pulsar *Sellar* | **H** | 0:30 · sellar mal 6 s |
| 2 | Hidra de Lerna | DWEC | Escritura rápida de dos inscripciones; cada error hace brotar una cabeza (ilustraciones de 1 a 9 cabezas) | Escribir las dos frases sin llegar a 9 cabezas | **E** | 0:15 · error 2 s |
| 3 | Cierva de Cerinea | DWEC | Atrapar 8 veces a la cierva dorada (eventos de ratón); hay ciervas falsas | 8 clics sobre la cierva dorada, evitando las rojas | **R** | 0:35 · cierva falsa 3 s |
| 4 | Jabalí de Erimanto | DIW | Seguir un rastro de iconos en una cuadrícula hasta la guarida | Pulsar en orden solo las casillas con el icono indicado | **A** | 0:25 · fallo 4 s |
| 5 | Establos de Augías | DAW | Arrastrar a la papelera los archivos peligrosos (extensiones dobles) | Tirar solo los que **terminan** en `.exe`, `.bat` o `.scr` | **C** | 0:18 · archivo bueno 6 s |
| 6 | Aves del Estínfalo | DAW | Contar aves en una animación con lag simulado | Elegir el número exacto en las dos bandadas | **L** | 1:40 · fallo 8 s |
| 7 | Toro de Creta | DWEC | Laberinto a oscuras con teclado (flechas / WASD) o botones | Llevar al toro hasta la puerta dorada | **E** | 0:25 · tiempo agotado 20 s |
| 8 | Yeguas de Diomedes | DWEC | Simon dice: repetir secuencias (6 rondas) | Repetir cada secuencia en orden | **S** | 0:45 · fallo 5 s |
| 9 | Cinturón de Hipólita | DIW | Encontrar el píxel/gema mal puesto en 4 cinturones | Pulsar la gema distinta en cada cinturón | **.** | 0:18 · fallo 4 s |
| 10 | Bueyes de Gerión | DWEC | Unir atajos de teclado con su acción (arrastrar cables) | Ctrl+C Copiar, Ctrl+X Cortar, Ctrl+V Pegar, Ctrl+Z Deshacer, Ctrl+Y Rehacer, Ctrl+S Guardar, Ctrl+F Buscar, Ctrl+H Reemplazar, Ctrl+P Imprimir, Ctrl+A Seleccionar todo | **E** | 0:20 · fallo 5 s |
| 11 | Manzanas de las Hespérides | DWES | **Bloqueada con candado.** Prueba física conservada: el QR abre `/oraculo/<token>` (solo con sesión de admin) con `ODGRQ` y la pista «retrocede tantas letras como cabezas tiene Cerbero» (César −3) | La da por superada el admin (`LADON` si se reactiva) | **X** | sin límite |
| 12 | Cerbero | DWEC | Tres cabezas, tres sentidos: una letra en estrellas (vista), otra hablada con `speechSynthesis` (oído) y un acertijo (texto) | `RIO` (R, I, O) | **E** | sin límite · fallo 20 s |

Si un grupo se atasca, el panel `/admin` permite **dar una prueba por superada**; el mapa del grupo la recoge
sola en menos de 15 s. Así se concede también la prueba 11 a cada grupo. El QR de las Hespérides se sigue
generando en `/admin/qr` (abriendo el panel con la IP pública del servidor), pero la página que abre solo
funciona con la sesión de administración.

---

## 3. Puesta en Marcha del Backend

Backend Python con Flask, SQLAlchemy y Jinja2:

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Iniciar aplicacion Flask
python app.py

# Acceso en el navegador:
# http://localhost:5000/
# http://localhost:5000/mapa
# http://localhost:5000/restaurada
```

El servidor Flask inicializa automaticamente la base de datos SQLite `heracles.db` con los modelos ORM `Trial`, `Team`, `Submission` y `GameSession`. La base de datos es local y no se sube al repositorio.

---

## 4. Estructura de Carpetas

```text
Escape-Room/
├── app.py                     # Punto de entrada Flask (crea la app y registra los blueprints)
├── wsgi.py                    # Entrada WSGI para servidores de produccion
├── requirements.txt           # Dependencias Python
├── deploy/                    # Servicio systemd, Nginx y copias de seguridad (ver DESPLIEGUE.md)
├── heracles/                  # Paquete del backend
│   ├── config.py              # Configuracion (base de datos, claves, entorno)
│   ├── extensions.py          # Extensiones compartidas (SQLAlchemy, Flask-Login)
│   ├── models.py              # Modelos ORM: Trial, Team, Submission, GameSession
│   ├── services.py            # Consultas reutilizadas por vistas y API
│   ├── game_data.py           # Los doce trabajos y sus soluciones
│   └── blueprints/
│       ├── main.py            # Vistas publicas (portada, login, mapa, restaurada)
│       ├── api.py             # API REST
│       └── admin.py           # Panel de administracion
├── templates/                 # Plantillas Jinja2 (index, login, mapa, webRestaurada, admin, 404...)
└── static/
    ├── css/                   # Estilos de cada pantalla
    ├── js/                    # Logica de cada pantalla (main.js: retos, niebla y API)
    └── images/                # Mapa, podio e ilustraciones WebP de las pruebas (hidra-1..9, leon, cerbero, arbol...)
```

---

## 5. Rutas de la aplicación

**Vistas (Jinja2, `heracles/blueprints/main.py`)**
* `GET /` web averiada · `GET /login` identificación de grupo · `GET /mapa` mapa de pruebas (requiere grupo)
* `GET /restaurada` web restaurada (requiere haber ganado; `?presentacion=1` solo con sesión de admin)
* `GET /oraculo/<token>` página del QR de las Hespérides (prueba 11 bloqueada: solo con sesión de admin)

**API REST (`heracles/blueprints/api.py`)**
* `POST /api/login` / `POST /api/logout`: inicia o cierra la sesión del grupo (Flask-Login, PIN con hash).
* `GET /api/teams` · `GET /api/team/current`: grupos y progreso del grupo activo (incluye los segundos que le quedan, calculados por el servidor).
* `GET /api/trials`: los 12 trabajos (el carácter de cada uno solo se revela al grupo que la supera).
* `POST /api/validate-trial`: valida una prueba en el servidor y guarda el progreso del grupo (rechaza la 11, bloqueada).
* `POST /api/verify`: valida la contraseña final `HERACLES.EXE` y registra la victoria y el tiempo.
* `GET /api/leaderboard` · `GET /api/podio`: clasificación y podio.
* `POST /api/reset`: reinicia el progreso del grupo identificado (la administración reinicia desde `/admin`).

**Panel interno (`heracles/blueprints/admin.py`)**
* `/admin/login` · `/admin/`: grupos, tiempos, intentos y estado de cada prueba.
* Vistas previas en `/admin/`: página del oráculo, pantalla de tiempo agotado (sin tocar a ningún grupo) y web restaurada.
* `POST /admin/team/<id>/pass`: da por superada una prueba a un grupo atascado.
* `POST /admin/team/<id>/reset` · `POST /admin/team/<id>/delete` · `POST /admin/reset-all`.
* `/admin/qr`: QR imprimible de la prueba física.

---
