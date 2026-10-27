# HERACLES.EXE // Los 12 Trabajos del Codigo

**Olympus Tech Solutions - Grupo 4 (DAW - Desarrollo de Aplicaciones Web)**  
*Escape Room Educativo y Proyecto Curricular Intermodular*

---

## 1. Descripcion y Narrativa (El Lore)

### La Maldicion Digital de Hera
La ira de la diosa Hera ha corrompido los cimientos digitales del Olimpo y de toda la Helade, fragmentando el templo sagrado en **12 pruebas mitologicas** que corresponden a errores informaticos del ciclo formativo de DAW.

Los participantes encarnan a **Heracles** y deben recorrer la geografia de la Grecia Antigua, resolver cada fallo tecnico (CSS bloqueante, bucles infinitos en JS, sanitizacion de entradas, enrutamiento HTTP, consultas SQL, herencia Jinja2 y barreras de accesibilidad) y obtener los 12 caracteres de la contraseña divina:

```text
Contraseña final: HERACLES.EXE (12 caracteres exactos)
```

Al introducir la clave correcta en el oraculo, el servidor valida la secuencia, purga la maldicion, registra la marca de tiempo en la base de datos relacional y restaura el Olimpo.

---

## 2. Reparto de Roles y Modulos del Equipo

El proyecto esta diseñado para cumplir las competencias de los diferentes modulos de DAW mediante el reparto de roles del Grupo 4:

- **Maialen (Coordinacion // IPE 2 // DIW):**
  - Gestion y planificacion del evento de escape room.
  - Diseño de la interfaz visual, maquetacion neoclasica, tipografias y transicion entre la web averiada (obsidiana) y la restaurada (marmol y oro).
- **Ixchel (Frontend // DWEC // DIW):**
  - Interactividad del mapa cartografico de la Helade en JavaScript y SVG.
  - Programacion de los minijuegos de los 12 trabajos en el cliente (captura de eventos, depuracion de bucles, emparejamiento DOM).
- **Paul (Backend // DWES):**
  - Servidor en Python con el microframework **Flask**.
  - Persistencia de datos mediante el ORM **SQLAlchemy** sobre SQLite.
  - Renderizado de vistas en servidor con **Jinja2** (herencia de plantillas, filtros y bucles).
  - API REST para validacion segura de respuestas y comprobacion de la contraseña final.
- **Juan (Despliegue y Sistemas // DAW // SI):**
  - Configuracion del entorno, maquina virtual, despliegue de puertos y servicios web.
  - Politicas de seguridad CORS, copias de seguridad de la base de datos y auditoria de intentos.

---

## 3. Mapeo Curricular: Los 12 Trabajos con los Modulos DAW

| Nº | Trabajo Mitologico | Reto Tecnico / Error Informatico | Modulo | Caracter |
| :---: | :--- | :--- | :---: | :---: |
| 1 | El Leon de Nemea | Centrado vertical de contenedor flexbox con CSS (`align-items: center`). | DIW / DWEC | H |
| 2 | La Hidra de Lerna | Bucle descontrolado en JS. Ordenar el bucle `for` para cortar y cauterizar. | DWEC | E |
| 3 | La Cierva de Cerinea | Elemento evasivo en el DOM con listener `mouseenter`. Atraparlo antes de que salte. | DWEC | R |
| 4 | El Jabali de Erimanto | Barrera de accesibilidad web. Correccion de la etiqueta `<img>` con el atributo `alt`. | DIW | A |
| 5 | Los Establos de Augias | Limpieza de codigo muerto (dead code, logs y variables basura) barriendo las manchas. | DWES | C |
| 6 | Las Aves del Estinfalo | Bandada de erratas de sintaxis. Localizar y neutralizar solo las palabras mal escritas. | DWEC | L |
| 7 | El Toro de Creta | Peticion a un endpoint inexistente en el servidor Flask. Identificar el codigo `404 Not Found`. | DWES | E |
| 8 | Las Yeguas de Diomedes | Sobrecarga de memoria del sistema. Repetir la secuencia exacta de cuatro cuadrantes (Simon). | DWEC | S |
| 9 | El Cinturon de Hipolita | Marcado semantico. Emparejar etiquetas HTML (`<nav>`, `<footer>`, `<a>`, `<img>`) con su funcion. | DIW | . |
| 10 | Los Bueyes de Gerion | Confusion de tipos en JavaScript. Evaluar la comparacion estricta (`'3' === 3 -> false`). | DWEC | E |
| 11 | Las Manzanas de las Hesperides | Criptografia clasica. Descifrar el codigo Cesar retrocediendo 3 posiciones (`KHUFXOHV -> HERCULES`). | DWES | X |
| 12 | Cerbero | Desafio triple del guardian del inframundo: Python (`len()`), SQL (`DISTINCT`) y Linux (`ls -a`). | DWES / DAW | E |

---

## 4. Arquitectura Tecnica

El proyecto cuenta con dos modalidades de ejecucion compatibles:

```text
[ CLIENTE NAVEGADOR ]
       |
       |-- Peticiones HTTP / Fetch JSON
       v
[ SERVIDOR BACKEND (Flask + Jinja2 + SQLAlchemy / Node.js) ]
       |
       |-- Consultas ORM (SQLAlchemy)
       v
[ BASE DE DATOS RELACIONAL (SQLite: olympus.db) ]
```

### A. Capa de Presentacion (Frontend)
- **HTML5 Semantico:** Sin ningun tipo de emoji; uso exclusivo de letras griegas (`Α`, `Β`, `Γ`...), vectores SVG y tipografias neoclasicas (`Cinzel`, `JetBrains Mono`, `Alegreya Sans`).
- **Mapa Cartografico de la Helade:** SVG integrado con las costas del Peloponeso, Creta, Tracia, el Mar Egeo y el Occidente remoto, con coordenadas reales para los 12 trabajos.
- **Audio Sintetizado:** Efectos sonoros generados nativamente en tiempo real mediante la **Web Audio API** del navegador (sin depender de archivos de audio externos).
- **Estilos Modales:** Alternancia de paleta mediante clases CSS (`:root` averiado en obsidiana frente a `:root.restored` en marmol blanco y lapislazuli).

### B. Capa de Negocio y Servidor (Backend DWES)
- **Flask (app.py):** Servidor principal que expone tanto vistas renderizadas como servicios REST.
- **Jinja2:** Motor de plantillas que implementa herencia (`base.html`), bloques dinamicos e inyeccion de datos desde la base de datos relacional.
- **SQLAlchemy (models.py):** ORM que mapea las entidades relacionales a clases de Python, eliminando el riesgo de inyeccion SQL.

---

## 5. Modelos de Base de Datos (SQLAlchemy ORM)

La base de datos SQLite (`olympus.db`) contiene cuatro tablas principales definidas en `backend/models.py`:

1. **`labors` (`Labor`):**
   - Catalogo de los 12 trabajos mitologicos con su orden, coordenadas X/Y en el mapa, texto narrativo y caracter asociado.
2. **`teams` (`Team`):**
   - Entidad que almacena los nombres de los equipos y codigo de grupo.
3. **`game_sessions` (`GameSession`):**
   - Almacena las partidas jugadas, el tiempo transcurrido en segundos, la fecha y si la maldicion fue purificada con exito.
4. **`labor_attempts` (`LaborAttempt`):**
   - Tabla de auditoria que registra cada respuesta enviada por los alumnos para su evaluacion por parte del profesor.

---

## 6. Endpoints de la API REST

Los endpoints asincronos residen bajo el prefijo `/api`:

### 1. Validar Trabajo
- **Ruta:** `POST /api/validate-trial`
- **Body JSON:**
  ```json
  {
    "trialId": 0,
    "answer": 0
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "status": "ok",
    "trialId": 0,
    "character": "H",
    "position": 1,
    "message": "Validado con exito por SQLAlchemy"
  }
  ```

### 2. Restaurar Olimpo y Validar Contraseña
- **Ruta:** `POST /api/restore`
- **Body JSON:**
  ```json
  {
    "password": "HERACLES.EXE",
    "team": "Equipo 4 // Olympus Tech",
    "duration": "06:45"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "status": "ok",
    "restored": true,
    "message": "Contraseña divina verificada por el ORM. Olimpo Restaurado."
  }
  ```

### 3. Cuadro de Honor
- **Ruta:** `GET /api/leaderboard`
- **Respuesta (200 OK):** Devuelve la lista de equipos y sus tiempos ordenada de menor a mayor.

---

## 7. Instrucciones de Instalacion y Ejecucion

### Opcion 1: Servidor Node.js (Pruebas Inmediatas en Navegador)
El proyecto incluye un servidor ligero en `server.js` con soporte para archivos estaticos y los endpoints de la API REST:

1. Ejecutar en la terminal del proyecto:
   ```bash
   node server.js
   ```
2. Abrir en el navegador:
   ```text
   http://localhost:3000
   ```

---

### Opcion 2: Servidor Completo Flask + SQLAlchemy + Jinja2 (Módulo DWES)
Para levantar el entorno completo con base de datos SQLite y plantillas de servidor:

1. Entrar en la carpeta del backend e instalar dependencias:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Iniciar el servidor Flask (creara y sembrara automaticamente la base de datos `olympus.db`):
   ```bash
   python -m backend.app
   ```
3. Rutas disponibles en el navegador:
   - **Aplicacion Principal:** `http://127.0.0.1:5000/`
   - **Cuadro de Honor (Renderizado con Jinja2):** `http://127.0.0.1:5000/leaderboard`
   - **Panel de Evaluacion Docente:** `http://127.0.0.1:5000/admin`
   - **API REST:** `http://127.0.0.1:5000/api/...`

---

## 8. Estructura de Ficheros del Repositorio

```text
Escape-room/
├── index.html               # Aplicacion cliente con mapa vectorial de la Helade
├── server.js                # Servidor local Node.js con API REST integrada
├── README.md                # Memoria explicativa del proyecto
└── backend/
    ├── app.py               # Fabrica de la aplicacion Flask y configuracion
    ├── models.py            # Modelos ORM SQLAlchemy (Labor, Team, GameSession, LaborAttempt)
    ├── seed.py              # Script de sembrado de los 12 trabajos en SQLite
    ├── requirements.txt     # Dependencias de Python (Flask, SQLAlchemy, Jinja2, CORS)
    ├── routes/
    │   ├── views.py         # Rutas de vistas Jinja2 (/, /leaderboard, /admin)
    │   └── api.py           # Rutas del servicio REST asincrono
    ├── static/
    │   └── css/main.css     # Estilos neoclasicos para las plantillas Jinja2
    └── templates/
        ├── base.html        # Plantilla maestra Jinja2 con herencia
        ├── index.html       # Vista principal con consulta de base de datos
        ├── leaderboard.html # Tabla de clasificacion generada por el servidor
        └── admin.html       # Panel docente de auditoria y control
```

---

## 9. Criterio Estetico y de Accesibilidad

- **Restriccion Estricta de Emojis:** Todo el sistema sustituye emojis por caracteres griegos clasicos (`Α`, `Β`, `Γ`), identificadores de estado tecnicos (`[ OK ]`, `[ ERR ]`, `[ BLOQUEADO ]`) y graficos vectoriales SVG puros.
- **Accesibilidad (WCAG):** Foco de teclado visible en todos los elementos interactivos, atributos `aria-label`, contraste de color optimizado y compatibilidad con `prefers-reduced-motion`.
