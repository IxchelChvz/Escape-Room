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
   * Botones de navegacion hacia el Mapa de la Helade y la Eleccion de Escuadra.

2. **Pantalla de Identificacion - Eleccion de Escuadra (`/login`):**
   * Archivo: `templates/login.html`.
   * Permite registrar una nueva escuadra o seleccionar una existente de la base de datos relacional.
   * Registro del nombre de la escuadra y PIN de acceso opcional.
   * Persistencia en la tabla `teams` de SQLite (`heracles.db`) y sesion activa.

3. **Pantalla 2 - Mapa de la Helade (`/mapa`):**
   * Archivo: `templates/mapa.html` y estilos `static/css/styles.css`.
   * Cartografia de Grecia (`static/images/mapaGriego.webp`) con niebla de guerra dinamica renderizada sobre un lienzo `<canvas id="fog">`.
   * 12 pines interactivos (`<button class="pin">`) que abren modales de dialogo (`<dialog id="dlg">`) con los 12 desafios gestionados por `static/js/main.js`.
   * Muestra el nombre de la escuadra activa en las estadisticas superiores.
   * Zona de pedestales (`#slots`) para introducir la contraseña final:
     ```text
     HERACLES.EXE (12 caracteres)
     ```
   * Al validar la clave, se realiza una peticion `POST /api/verify` al servidor, vinculando la victoria al equipo en la base de datos.

4. **Pantalla 3 - Web Restaurada (`/restaurada`):**
   * Archivo: `templates/webRestaurada.html` y estilos `static/css/webRestaurada.css`.
   * El templo dorado refulge con estado HTTP 200 y sistema RESTAURADO.
   * Muestra el nombre de la escuadra victoriosa en el mensaje de gloria.
   * Podio con los cuatro últimos grupos registrados, renderizado con Jinja2 desde la base de datos.
   * Buscador de secciones (`#q`) gestionado por `static/js/webRestaurada_2.js`.
   * Memoria técnica del oráculo.

---

## 2. Las 12 pruebas: fichas técnicas y soluciones

Cada prueba es un minijuego en un canvas emergente (`static/js/juegos.js`) que se abre desde su pin del mapa.
Al superarla se muestra **el carácter y la casilla (posición) que ocupa** en la contraseña final `HERACLES.EXE`.
Todas tienen tiempo límite; los errores y el tiempo agotado se castigan con una espera que se guarda en el
navegador (cerrar la ventana no la salta). Las pruebas 11 y 12 se comprueban en el servidor
(`/api/validate-trial` con las soluciones de `heracles/game_data.py`); el resto se resuelve jugando y el
servidor registra la superación en la base de datos.

| Pos. | Trabajo | Módulo | Prueba (mecánica) | Solución | Carácter | Tiempo / castigo |
|:---:|:---|:---:|:---|:---|:---:|:---|
| 1 | León de Nemea | DIW | Colores RGB: igualar la melena del león con tres deslizadores (dos tonos) | Ajustar cada canal hasta que las tres pistas digan «✓ Bien» (±8) y pulsar *Sellar* | **H** | 1:20 · sellar mal 6 s |
| 2 | Hidra de Lerna | DWEC | Escritura rápida de dos inscripciones; cada error hace brotar una cabeza | Escribir las dos frases sin llegar a 9 cabezas | **E** | 1:00 · error 2 s |
| 3 | Cierva de Cerinea | DWEC | Atrapar 8 veces a la cierva dorada (eventos de ratón); hay ciervas falsas | 8 clics sobre la cierva dorada, evitando las rojas | **R** | 0:35 · cierva falsa 3 s |
| 4 | Jabalí de Erimanto | DIW | Seguir un rastro de iconos en una cuadrícula hasta la guarida | Pulsar en orden solo las casillas con el icono indicado | **A** | 1:00 · fallo 4 s |
| 5 | Establos de Augías | DAW | Arrastrar a la papelera los archivos peligrosos (extensiones dobles) | Tirar solo los que **terminan** en `.exe`, `.bat` o `.scr` | **C** | 1:10 · archivo bueno 6 s |
| 6 | Aves del Estínfalo | DAW | Contar aves en una animación con lag simulado | Elegir el número exacto en las dos bandadas | **L** | 1:40 · fallo 8 s |
| 7 | Toro de Creta | DWEC | Laberinto a oscuras con teclado (flechas / WASD) o botones | Llevar al toro hasta la puerta dorada | **E** | 2:00 · tiempo agotado 20 s |
| 8 | Yeguas de Diomedes | DWEC | Simon dice: repetir secuencias (6 rondas) | Repetir cada secuencia en orden | **S** | 2:30 · fallo 5 s |
| 9 | Cinturón de Hipólita | DIW | Encontrar el píxel/gema mal puesto en 4 cinturones | Pulsar la gema distinta en cada cinturón | **.** | 1:20 · fallo 4 s |
| 10 | Bueyes de Gerión | DWEC | Unir atajos de teclado con su acción (arrastrar cables) | Ctrl+C Copiar, Ctrl+X Cortar, Ctrl+V Pegar, Ctrl+Z Deshacer, Ctrl+Y Rehacer, Ctrl+S Guardar, Ctrl+F Buscar, Ctrl+H Reemplazar, Ctrl+P Imprimir, Ctrl+A Seleccionar todo | **E** | 1:15 · fallo 5 s |
| 11 | Manzanas de las Hespérides | DWES | **Prueba física**: un QR escondido abre `/oraculo/<token>` con `ODGRQ` y la pista «retrocede tantas letras como cabezas tiene Cerbero» (César −3) | `LADON` | **X** | sin límite · fallo 20 s |
| 12 | Cerbero | DWEC | Tres cabezas, tres sentidos: una letra en estrellas (vista), otra hablada con `speechSynthesis` (oído) y un acertijo (texto) | `RIO` (R, I, O) | **E** | sin límite · fallo 20 s |

El QR de las Hespérides se imprime desde el panel `/admin/qr` (abrir el panel con la IP del servidor para que
los móviles puedan acceder). Si un grupo se atasca, el panel `/admin` permite **dar una prueba por superada**.

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
    └── images/                # Mapa de la Helade e imagenes del podio
```

---

## 5. Rutas de la aplicación

**Vistas (Jinja2, `heracles/blueprints/main.py`)**
* `GET /` web averiada · `GET /login` identificación de grupo · `GET /mapa` mapa de pruebas (requiere grupo)
* `GET /restaurada` web restaurada (requiere haber ganado; `?presentacion=1` para mostrarla)
* `GET /oraculo/<token>` página que abre el QR de las Hespérides (sin sesión, para el móvil)

**API REST (`heracles/blueprints/api.py`)**
* `POST /api/login` / `POST /api/logout`: inicia o cierra la sesión del grupo (Flask-Login, PIN con hash).
* `GET /api/teams` · `GET /api/team/current`: grupos y progreso del grupo activo (incluye los segundos que le quedan, calculados por el servidor).
* `GET /api/trials`: los 12 trabajos (el carácter de cada uno solo se revela al grupo que la supera).
* `POST /api/validate-trial`: valida una prueba en el servidor y guarda el progreso del grupo.
* `POST /api/verify`: valida la contraseña final `HERACLES.EXE` y registra la victoria y el tiempo.
* `GET /api/leaderboard` · `GET /api/podio`: clasificación y podio.
* `POST /api/reset`: reinicia el progreso del grupo identificado (la administración reinicia desde `/admin`).

**Panel interno (`heracles/blueprints/admin.py`)**
* `/admin/login` · `/admin/`: grupos, tiempos, intentos y estado de cada prueba.
* `POST /admin/team/<id>/pass`: da por superada una prueba a un grupo atascado.
* `POST /admin/team/<id>/reset` · `POST /admin/team/<id>/delete` · `POST /admin/reset-all`.
* `/admin/qr`: QR imprimible de la prueba física.

---
