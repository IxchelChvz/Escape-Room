# HERACLES.EXE // Funcionamiento del Codigo

Plataforma web de Escape Room educativo construida con **Python (Flask)**, **SQLAlchemy ORM (SQLite)** y motor de plantillas **Jinja2**.

---

## Que hace la aplicacion

La aplicacion simula un portal web del Olimpo que ha sufrido una corrupcion intencionada de software. Los usuarios deben identificar a su grupo, superar 12 pruebas tecnicas distribuidas en un mapa interactivo para obtener los 12 caracteres de la contraseña maestra (`HERACLES.EXE`) y restaurar el sistema.

---

## Vistas y Logica del Frontend

1. **Templo Averiado (`/`):**
   * Muestra la interfaz colapsada con errores HTTP 500 simulados, glitching visual y consola de depuracion.
   * Incorpora una terminal interactiva que simula la subida de un exploit con arte ASCII de la Quimera.
   * Renderiza dinamicamente con Jinja2 las 12 secciones bloqueadas del templo desde la base de datos.
   * Muestra el nombre del grupo activo si ya ha iniciado sesion.

2. **Identificacion de Grupo (`/login`):**
   * Registro e inicio de sesion: si el grupo no existe, se crea en la base de datos; si ya existe, comprueba el PIN de acceso.
   * El PIN se valida mediante hash criptografico en el servidor (`check_password_hash`). Si el PIN es incorrecto, deniega el acceso con HTTP 401.
   * Guarda la sesion en el servidor (`session['team_name']`, `session['team_id']`) y en `localStorage`.

3. **Mapa de Retos (`/mapa`):**
   * Despliega la cartografia en formato pergamino (`static/images/mapaGriego.jpeg`) con una capa de niebla de guerra dinamica renderizada sobre `<canvas id="fog">`.
   * Dispone 12 pines interactivos sobre las coordenadas exactas de cada region mitologica:
     * Pruebas 3 (Cierva), 11 (Hesperides) y 12 (Cerbero) desbloqueadas y accesibles.
     * Pruebas 1, 2, 4, 5, 6, 7, 8, 9 y 10 bloqueadas visualmente con candado SVG.
   * Cada pin abre un modal con un desafio practico (CSS Flexbox, bucles de JavaScript, capturas por eventos, accesibilidad HTML, consultas SQL, comandos Linux y cifrado Cesar).
   * Al resolver un trabajo, se disipa la niebla en esa zona, se desvela el caracter correspondiente y se notifica al servidor via `POST /api/validate-trial`.
   * Incluye pedestales para introducir la clave maestra de 12 caracteres y enviarla a validar a `/api/verify`.

4. **Templo Restaurado (`/restaurada`):**
   * Vista accesible una vez introducida la clave correcta o en modo presentacion.
   * Muestra el portal en estado optimo (HTTP 200) y la tabla de honor (Leaderboard) con los tiempos de los grupos que han completado los 12 trabajos.

5. **Panel Interno de Evaluacion (`/admin`):**
   * Cuadro de mandos para organizadores y profesores.
   * Muestra KPIs en tiempo real (grupos registrados, partidas finalizadas, envios y porcentaje de aciertos).
   * Tabla con el progreso individual de cada grupo: nombre, tiempo transcurrido, puntuacion, estado y lista de trabajos superados.
   * Auditoria de intentos (`submissions`) con fecha, solucion enviada y resultado.
   * Funcion de reseteo del torneo protegida por token de administrador (`OLIMPO_ADMIN_2024`).

---

## Logica del Backend y Persistencia

El backend reside integramente en `app.py`:

* **Modelos Relacionales (SQLAlchemy ORM):**
  * `Team`: Equipos, PIN hasheado, puntuacion, tiempo transcurrido y estado de restauracion.
  * `Trial`: Definicion de los 12 trabajos, modulo formativo, coordenadas de mapa y caracter asignado.
  * `team_trials`: Tabla intermedia N:M que asocia que trabajos ha superado cada grupo de forma independiente.
  * `Submission`: Auditoria de cada respuesta enviada por los alumnos vinculada obligatoriamente a `team_id`.
  * `GameSession`: Registro historico de partidas finalizadas.

* **Endpoints de la API REST:**
  * `POST /api/login`: Autentica comprobando el PIN hasheado o crea un nuevo grupo.
  * `GET /api/teams`: Lista los grupos registrados en orden de creacion.
  * `GET /api/team/current`: Retorna los datos del grupo con sesion activa.
  * `GET /api/trials`: Retorna los 12 trabajos y su estado.
  * `POST /api/validate-trial`: Valida la solucion en el servidor contra un diccionario canonico (`CANONICAL_SOLUTIONS`), vincula el trabajo al equipo en `team_trials`, registra el intento en `submissions` con `team_id` y actualiza la puntuacion.
  * `POST /api/verify`: Valida la contraseña maestra `HERACLES.EXE`, registra la hora de finalizacion y activa el estado restaurado.
  * `GET /api/leaderboard`: Devuelve los mejores tiempos de los grupos victoriosos.
  * `POST /api/reset`: Endpoint protegido con `X-Admin-Token` que reinicia el progreso de las tablas entre turnos.

---

## Puesta en Marcha

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Iniciar el servidor
python app.py
```

El servidor arranca en `http://localhost:3000` inicializando automaticamente la base de datos `heracles.db`.


<!-- Añado comentario de pruebaP. -->
