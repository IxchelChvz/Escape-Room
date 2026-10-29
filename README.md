# HERACLES.EXE // Escape Room Digital - Los 12 Trabajos del Codigo

**Olympus Tech Solutions - Grupo 4 (DAW - Desarrollo de Aplicaciones Web)**  
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
   * Cartografia de Grecia (`static/images/mapaGriego.jpeg`) con niebla de guerra dinamica renderizada sobre un lienzo `<canvas id="fog">`.
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
   * Tabla de honor de las escuadras (Leaderboard) cargada dinamicamente desde la base de datos.
   * Buscador de secciones (`#q`) gestionado por `static/js/webRestaurada_2.js`.
   * Formulario de contacto y memoria tecnica del oraculo.

---

## 2. Matriz Curricular: Los 12 Trabajos de Heracles

| Num | Trabajo Mitologico | Modulo DAW | Concepto Tecnico | Solucion / Letra |
|:---:|:---|:---:|:---|:---:|
| 1 | Leon de Nemea | DIW | CSS Flexbox y Box Model | `align-items: center` (**H**) |
| 2 | Hidra de Lerna | DWEC | JavaScript, Bucles y Cauterizacion | Ordenar bucle `for` y cortar/quemar cabezas (**E**) |
| 3 | Cierva de Cerinea | DWEC | Eventos y Evasion de Cursor | Capturar a la cierva 6 veces en movimiento (**R**) |
| 4 | Jabali de Erimanto | DIW / DWEC | Marcado HTML y Accesibilidad | Atributo `alt` para lectores de pantalla (**A**) |
| 5 | Establos de Augias | DWES | Codigo Limpio y Buenas Practicas | Limpiar los manchas de codigo muerto del DOM (**C**) |
| 6 | Aves del Estinfalo | DAW | Depuracion de Sintaxis | Derribar las 5 erratas de codigo mal escritas (**L**) |
| 7 | Toro de Creta | DWES | Flask, Rutas y Codigos HTTP | Manejo de ruta no existente HTTP 404 (**E**) |
| 8 | Yeguas de Diomedes | DWEC / DWES | Memoria y Secuencia (Simon) | Memorizar y repetir el orden de las 4 yeguas (**S**) |
| 9 | Cinturon de Hipolita | DIW / DAW | HTML Semantico | Emparejar etiquetas con su funcion semantica (**.**) |
| 10 | Bueyes de Gerion | DWEC / DWES | Comparacion Estricta y Tipos | Comparacion `'3' === 3` devuelve `false` (**E**) |
| 11 | Manzanas Hesperides | DWEC | Criptografia Clasica (Cesar) | Descifrar `KHUFXOHV` con desplazamiento -3 -> `HERCULES` (**X**) |
| 12 | Cerbero | DWES | Python, SQL y Comandos Linux | 3 cabezas: `len()`, `DISTINCT`, `ls -a` (**E**) |

---

## 3. Puesta en Marcha del Backend

### Opcion A: Servidor Node.js (Recomendado para pruebas rapidas)

El proyecto incluye un servidor ligero sin librerias externas que sirve las plantillas y atiende a la API REST:

```bash
# Iniciar servidor
node server.js

# Acceso en el navegador:
# http://localhost:3000/
# http://localhost:3000/mapa
# http://localhost:3000/restaurada
```

---

### Opcion B: Backend Python con Flask, SQLAlchemy y Jinja2

Para evaluar el modulo de DWES (Desarrollo Web en Entorno Servidor):

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

El servidor Flask inicializa automaticamente la base de datos relacional SQLite `heracles.db` con los modelos ORM `Trial`, `Team` y `Submission`.

---

## 4. Estructura de Carpetas

```text
sharp-bose/
├── app.py                     # Backend Flask con SQLAlchemy y Jinja2
├── server.js                  # Servidor local Node.js con API REST
├── requirements.txt           # Dependencias Python (Flask, Flask-SQLAlchemy)
├── README.md                  # Documentacion del proyecto
├── templates/                 # Plantillas HTML originales del proyecto
│   ├── index.html             # Pantalla 1: Web Averiada / Landing
│   ├── mapa.html              # Pantalla 2: Mapa de la Helade y retos
│   └── webRestaurada.html     # Pantalla 3: Olimpo Restaurado
├── static/
│   ├── css/
│   │   ├── webAveriada.css    # Estilos del Templo Averiado
│   │   ├── styles.css         # Estilos del Mapa y modales
│   │   └── webRestaurada.css  # Estilos de la Web Restaurada
│   ├── js/
│   │   ├── webAveriada.js     # Logica de hidratacion de la landing
│   │   ├── main.js            # Logica de retos, niebla y API verify
│   │   └── webRestaurada_2.js # Logica del buscador y contacto
│   └── images/
│       └── mapaGriego.jpeg    # Cartografia historica de Grecia
└── Escape-Room-Fase1/         # Paquete completo exportable idéntico
```

---

## 5. Endpoints de la API REST

* `POST /api/login`: Autentica o crea una nueva escuadra en la base de datos (`name`, `pin`).
* `GET /api/teams`: Lista todos los equipos registrados y su estado.
* `GET /api/team/current`: Devuelve los datos del equipo activo en la sesion actual.
* `POST /api/verify`: Valida la clave `HERACLES.EXE`, asocia la victoria al equipo y devuelve `{ "success": true }`.
* `GET /api/trials`: Devuelve el listado de los 12 trabajos con metadatos.
* `POST /api/validate-trial`: Notifica y almacena en base de datos la superacion de un trabajo individual para el equipo activo.
* `GET /api/leaderboard`: Clasificacion de tiempos y puntuaciones de las escuadras en la base de datos.
* `POST /api/reset`: Reinicia el progreso en el backend.

---
