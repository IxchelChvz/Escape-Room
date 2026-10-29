# HERACLES.EXE // Escape Room Digital - Los 12 Trabajos del Codigo

**Olympus Tech Solutions - Grupo 4 (DAW - Desarrollo de Aplicaciones Web)**  
*Proyecto Intermodular: DIW, DWEC, DWES y Despliegue de Aplicaciones Web*

---

## 1. Descripcion General del Proyecto

HERACLES.EXE es una aplicacion web interactiva de Escape Room tecnico-educativo basada en los 12 Trabajos de Heracles, adaptados rigurosamente a las competencias curriculares clave de los modulos de Desarrollo de Aplicaciones Web (DAW) y Multiplataforma (DAM).

La plataforma esta construida con una arquitectura de servidor unico en **Python / Flask** con persistencia relacional en **SQLite / SQLAlchemy ORM**, renderizado dinamico con motor de plantillas **Jinja2** (con herencia mediante `base.html`), gestion segura de sesiones, validacion estricta de retos del lado del servidor y un panel interno de evaluacion y telemetria para organizadores docentes (`/admin`).

---

## 2. Arquitectura de Vistas (Jinja2 Template Inheritance)

La interfaz se estructura mediante herencia de plantillas Jinja2 a partir de `templates/base.html`, garantizando consistencia semantica, accesibilidad y dinamismo:

1. **Pantalla 1 - Web Averiada (Landing Page) (`/`):**
   * Archivo: `templates/index.html` (extiende `base.html`).
   * Representa el templo sagrado del Olimpo corrompido por errores intencionados (HTTP 500, excepciones en consola, terminal interactiva de descompilacion y arte ASCII de la Quimera).
   * Renderiza dinamicamente los 12 bloqueos mediante un bucle `{% for trial in trials %}`.
   * Muestra el equipo activo mediante `{{ active_team }}` y enlace directo al flujo de entrada.

2. **Pantalla de Identificacion - Eleccion de Grupo (`/login`):**
   * Archivo: `templates/login.html` (extiende `base.html`).
   * Permite a los participantes registrar un nuevo grupo o identificarse con uno existente.
   * Sistema de seguridad con PIN de 4 digitos hasheado criptograficamente en servidor (PBKDF2/Werkzeug). Si el PIN no coincide, deniega el acceso con codigo HTTP 401.

3. **Pantalla 2 - Mapa de la Helade y Retos (`/mapa`):**
   * Archivo: `templates/mapa.html` (extiende `base.html`).
   * Cartografia de Grecia con niebla de guerra dinamica renderizada sobre `<canvas id="fog">`.
   * 12 pines interactivos en coordenadas exactas. Por diseño pedagogico, las pruebas 3, 11 y 12 permanecen abiertas mientras que el resto muestran candado SVG.
   * Modales interactivos para cada desafio. La superacion se valida tanto en cliente como en el endpoint del servidor `/api/validate-trial`.
   * Zona de pedestales para introducir la contraseña maestra de 12 caracteres: `HERACLES.EXE`.

4. **Pantalla 3 - Web Restaurada (`/restaurada`):**
   * Archivo: `templates/webRestaurada.html` (extiende `base.html`).
   * Muestra el templo glorificado con HTTP 200 tras introducir la clave correcta.
   * Renderiza mediante Jinja2 la clasificacion oficial (Leaderboard) de equipos que han purificado el Olimpo.

5. **Pantalla 4 - Panel Interno de Evaluacion Docente (`/admin`):**
   * Archivo: `templates/admin.html` (extiende `base.html`).
   * Cuadro de mandos para organizadores y profesores.
   * Metricas KPI en tiempo real: grupos inscritos, templos purificados, total de envios y aciertos.
   * Tabla con el progreso individual de cada grupo, PIN configurado, tiempo invertido y lista de trabajos superados.
   * Registro historico de auditoria de envios (`submissions`).
   * Boton de reseteo protegido para reiniciar la competicion entre turnos de alumnos.

---

## 3. Matriz Curricular: Los 12 Trabajos de Heracles

| Num | Trabajo Mitologico | Modulo | Concepto Tecnico Evaluado | Solucion Canonica / Letra |
|:---:|:---|:---:|:---|:---:|
| 1 | Leon de Nemea | DIW | CSS Flexbox y Box Model | `align-items: center` (**H**) |
| 2 | Hidra de Lerna | DWEC | JavaScript, Bucles y Cauterizacion | Ordenar bucle `for` y cortar/quemar cabezas (**E**) |
| 3 | Cierva de Cerinea | DWEC | Eventos y Evasion de Cursor | Capturar a la cierva 6 veces en movimiento (**R**) |
| 4 | Jabali de Erimanto | DIW / DWEC | Marcado HTML y Accesibilidad | Atributo `alt` para lectores de pantalla (**A**) |
| 5 | Establos de Augias | DWES | Codigo Limpio y Refactorizacion | Limpiar manchas de codigo muerto del DOM (**C**) |
| 6 | Aves del Estinfalo | DAW | Depuracion de Sintaxis | Derribar las 5 erratas de codigo mal escritas (**L**) |
| 7 | Toro de Creta | DWES | Flask, Rutas y Codigos HTTP | Manejo de ruta inexistente HTTP 404 (**E**) |
| 8 | Yeguas de Diomedes | DWEC / DWES | Memoria y Secuencia (Simon) | Memorizar y reproducir el orden de 4 yeguas (**S**) |
| 9 | Cinturon de Hipolita | DIW / DAW | HTML Semantico | Emparejar etiquetas con su funcion semantica (**.**) |
| 10 | Bueyes de Gerion | DWEC / DWES | Comparacion Estricta y Tipos | Comparacion `'3' === 3` devuelve `false` (**E**) |
| 11 | Manzanas Hesperides | DWEC | Criptografia Clasica (Cesar) | Descifrar `KHUFXOHV` con desplazamiento -3 -> `HERCULES` (**X**) |
| 12 | Cerbero | DWES | Python, SQL y Comandos Linux | 3 cabezas: `len()`, `DISTINCT`, `ls -a` (**E**) |

---

## 4. Despliegue y Puesta en Marcha

### 4.1. Ejecucion Local con Python

```bash
# 1. Crear y activar entorno virtual
python -m venv venv
# En Linux/Mac:
source venv/bin/activate
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# 2. Instalar dependencias requeridas
pip install -r requirements.txt

# 3. Configurar variables de entorno (opcional, utiliza .env por defecto)
cp .env.example .env

# 4. Iniciar el servidor Flask
python app.py

# El servidor arranca en http://localhost:3000/
```

### 4.2. Ejecucion con Servidor WSGI de Produccion (Gunicorn)

```bash
gunicorn --config gunicorn.conf.py wsgi:application
```

### 4.3. Despliegue con Docker y Docker Compose

El directorio `deploy/` contiene la infraestructura para contenedores:

```bash
# Construir y levantar el contenedor de la aplicacion y el proxy Nginx
cd deploy
docker compose up -d --build

# Verificar estado y registros
docker compose ps
docker compose logs -f
```

---

## 5. Endpoints de la API REST

* `POST /api/login`: Autentica un grupo existente comprobando su PIN hasheado (401 si no coincide) o registra uno nuevo.
* `GET /api/teams`: Lista todos los grupos registrados con su puntuacion y estado.
* `GET /api/team/current`: Devuelve el grupo activo en la sesion actual de Flask.
* `GET /api/trials`: Devuelve la definicion y estado de los 12 trabajos de Heracles.
* `POST /api/validate-trial`: Valida la solucion en el servidor, vincula el trabajo resuelto a la tabla intermedia `team_trials`, asocia obligatoriamente `team_id` en la tabla `submissions` y actualiza la puntuacion.
* `POST /api/verify`: Valida la clave maestra final `HERACLES.EXE` y registra la victoria del equipo.
* `GET /api/leaderboard`: Devuelve el ranking de grupos victoriosos ordenados por menor tiempo.
* `POST /api/reset`: Endpoint protegido mediante cabecera `X-Admin-Token` o parametro `token` que reinicia el progreso de las escuadras para un nuevo turno docente.

---

## 6. Organizacion del Evento y Documentacion

Para consultar el plan integral de difusion, inscripciones, contacto con colegios, turnos de 90 minutos y protocolo de atencion al participante, consulte el documento:
* [EVENTO_ORGANIZACION.md](EVENTO_ORGANIZACION.md)
