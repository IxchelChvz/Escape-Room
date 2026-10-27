# HERACLES.EXE // Los 12 Trabajos del Codigo

**Olympus Tech Solutions - Grupo 4 (DAW - Desarrollo de Aplicaciones Web)**  
*Escape Room Educativo y Proyecto Curricular Intermodular*

---

## 1. Descripcion y Narrativa (El Lore)

### La Maldicion Digital de Hera
La ira de la diosa Hera ha corrompido los cimientos digitales del Olimpo y de toda la Helade, fragmentando el templo sagrado en **12 pruebas mitologicas** que corresponden a errores informaticos del ciclo formativo de DAW (Desarrollo de Aplicaciones Web).

Los participantes encarnan a **Heracles** y deben recorrer la geografia de la Grecia Antigua, resolver cada fallo tecnico (CSS bloqueante, bucles infinitos en JS, sanitizacion de entradas, enrutamiento HTTP, consultas SQL, herencia Jinja2 y barreras de accesibilidad) y obtener los 12 caracteres de la contraseña divina:

```text
Contraseña final: HERACLES.EXE (12 caracteres exactos)
```

Al introducir la clave correcta en el oraculo, el servidor valida la secuencia, purga la maldicion, registra la marca de tiempo en la tabla de lideres y restaura la conexion con el monte Olimpo.

---

## 2. Arquitectura de la Aplicacion Web

La aplicacion esta diseñada con una experiencia en 3 pantallas secuenciales e integradas:

```
[ PANTALLA 1: TEMPLO AVERIADO (LANDING) ]
      |
      |--> (Boton monumental: ENTRAR A LA HELADE EN RUINAS)
      v
[ PANTALLA 2: MAPA CARTOGRAFICO DE LA HELADE ]
      |
      |--> (12 Nodos mitologicos interactivos + Modales de reto)
      |--> (Obtencion de los 12 caracteres: H-E-R-A-C-L-E-S-.-E-X-E)
      v
[ PANTALLA 3: ALTAR DE DESBLOQUEO Y PURGA FINAL ]
      |
      |--> (Validacion criptografica + Animacion de restauracion + Leaderboard)
```

### Pantalla 1: Templo Averiado (Landing Page)
- **Friso y Arquitrabe Sagrado:** Estetica oscura inspirada en la Grecia mitologica subterranea (obsidiana pulida, bronce forjado, dorado olimpico y carmesi de maldicion).
- **Altar Terminal Interactivo:** Consola incrustada en piedra donde los desarrolladores pueden interactuar con comandos iniciales (`ayuda`, `estado`, `oraculo`, `trabajos`).
- **Papiros Sagrados de Reglas:** Tablon con las 4 directrices fundamentales del escape room.
- **Dossier de Olympus Tech Solutions:** Identificacion del equipo de desarrollo, modulos cubiertos y objetivos academicos.
- **Portal de Acceso Monumental:** Gran boton con textura de marmol quebrado con transicion fluida al mapa de Grecia.

### Pantalla 2: Mapa Cartografico de la Helade
- **Plano Vectorial de Grecia Antigua:** Cartografia SVG detallada que abarca el Peloponeso, Grecia Continental, Tracia, Creta y el Mar Egeo, con rosa de los vientos y coordenadas reales.
- **12 Nodos Mitologicos:** Cada ubicacion historica aloja un trabajo interactivo con marcadores de estado (Pendiente, En curso, Purgado).
- **Selector de Retos Directo:** Panel inferior con tarjetas de acceso rapido a cada uno de los 12 desafios.

### Pantalla 3: Altar de Desbloqueo y Purga
- **12 Pedestales de Piedra:** Celdas interactivas para componer la palabra sagrada `HERACLES.EXE`.
- **Validador de Integridad:** Comprueba en tiempo real si el participante ha superado las 12 pruebas antes de autorizar el rito final.
- **Rito de Restauracion:** Envía la clave al backend via API REST y activa el resplandor sagrado dorado eliminando la corrompida aura roja.

---

## 3. Matriz Curricular: Los 12 Trabajos de DAW

Cada trabajo plantea un reto de programacion real con mecanicas complejas que requieren analisis y aplicacion de conocimientos tecnicos:

| Num | Trabajo Mitologico | Modulo DAW | Concepto Tecnico | Mecanica del Desafio | Letra |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | Leon de Nemea | DIW | Box Model, z-index, Pointer-Events | Desarmar una coraza CSS invisible que bloquea clics superpuestos (`pointer-events: none; z-index: 0`). | **H** |
| 2 | Hidra de Lerna | DWEC | Event Bubbling y Bucles Infinitos | Detener la propagacion de eventos (`e.stopPropagation()`) y cortar la regeneracion recursiva de nodos DOM en bucle `for`. | **E** |
| 3 | Cierva de Cerinea | DWEC | Evasion de Cursor y Coordenadas DOM | Capturar un elemento volatil que huye del puntero calculando distancias euclidianas relativas en la ventana. | **R** |
| 4 | Jabali de Erimanto | DWEC | Expresiones Regulares (RegEx) | Formular una mascara estricta (`^HERACLES-(202[0-9])-(ARCADIA\|ERIMANTO)$`) para validar el codigo de captura. | **A** |
| 5 | Establos de Augias | DWES | SQL Injection y Sanitizacion | Ejecutar una sentencia segura de limpieza (`DELETE FROM estiercol WHERE establo_id = 5`) respetando la clausula restrictiva. | **C** |
| 6 | Aves del Estinfalo | DIW / WAI | Accesibilidad Web y Contrastes | Restablecer atributos semanticos ARIA y ratios de contraste WCAG AA (minimo 4.5:1) para hacer visible el codigo oculto. | **L** |
| 7 | Toro de Creta | DWES | Enrutamiento HTTP y CORS | Configurar los metodos permitidos y cabeceras Access-Control para solventar un bloqueo cruzado de origen. | **E** |
| 8 | Yeguas de Diomedes | DWES / Desp | Permisos de Sistema Unix | Calcular la mascara numerica octal adecuada (`chmod 750`) para revocar privilegios excesivos de escritura publica. | **S** |
| 9 | Cinturon de Hipolita | DAW / Ent | DevTools e Inspeccion Web | Rastrear un secreto dividido en 3 fragmentos ocultos en el DOM (Elements), cabeceras de red (Network) y Storage. | **.** |
| 10 | Bueyes de Gerion | DWES | Plantillas Jinja2 y Herencia | Completar los bloques `{% extends %}` y `{% block %}` para renderizar adecuadamente la vista dividida del monstruo triforme. | **E** |
| 11 | Manzanas Hesperides | DWEC | Criptografia Clasica (Cesar) | Implementar el algoritmo de rotacion de caracteres con desplazamiento modular para descifrar el mensaje secreto. | **X** |
| 12 | Cerbero del Inframundo | DWES | Tokens JWT y Autenticacion | Montar la estructura estandar de un JSON Web Token (Header, Payload, Signature) para calmar al guardian. | **E** |

---

## 4. Guia de Puesta en Marcha

### Opcion A: Servidor Ligero Node.js (Recomendado para pruebas rapidas)

El proyecto incluye un servidor ligero sin dependencias externas:

```bash
# 1. Situarse en la carpeta del proyecto
cd c:\Users\JuanAdrianPerezPerez\Documents\antigravity\sharp-bose

# 2. Iniciar el servidor
node server.js

# 3. Abrir en el navegador
# http://localhost:3000
```

Endpoints del servidor Node:
- `GET /` -> Servir `index.html` con la aplicacion completa.
- `POST /api/validate-trial` -> Valida la solucion tecnica de cada uno de los 12 trabajos.
- `POST /api/restore` -> Procesa la clave final `HERACLES.EXE` y purga el sistema.
- `GET /api/leaderboard` -> Devuelve la tabla de tiempos de los equipos.

---

### Opcion B: Backend Robusto Python con Flask, SQLAlchemy y Jinja2

Para la evaluacion del modulo de Servidor (DWES), se proporciona un backend completo en `backend/`:

#### Requisitos
- Python 3.8+
- pip

#### Instalacion y Ejecucion
```bash
# 1. Acceder al directorio del backend
cd Escape-Room/backend

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Inicializar la base de datos SQLite con los datos de las 12 pruebas
python seed.py

# 4. Iniciar la aplicacion Flask
python app.py
```

El servidor Flask se iniciara en `http://localhost:5000` con:
- ORM SQLAlchemy gestionando modelos relacionales (`Trial`, `Team`, `Submission`, `AuditLog`).
- Vistas renderizadas mediante plantillas Jinja2 (`templates/`).
- API REST documentada para la validacion dinamica de cada trabajo.

---

## 5. Estructura de Directorios

```text
sharp-bose/
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

## 6. Solucionario para el Docente / Evaluador

Para agilizar la correccion o demostracion en clase:

1. **Trabajo 1 (Leon de Nemea):** Modificar las propiedades de `.nemean-armor` a `pointer-events: auto;` y `z-index: 1;`.
2. **Trabajo 2 (Hidra de Lerna):** Introducir `event.stopPropagation();` dentro del manejador del evento y limitar el bucle a `i < cabezas.length`.
3. **Trabajo 3 (Cierva de Cerinea):** Pulsar sobre la cierva antes de que el evento `mouseenter` recalcule sus coordenadas X/Y o pulsar el boton de aturdimiento sincronico.
4. **Trabajo 4 (Jabali de Erimanto):** Introducir un codigo valido que cumpla la regex, por ejemplo: `HERACLES-2024-ARCADIA`.
5. **Trabajo 5 (Establos de Augias):** Escribir la sentencia SQL `DELETE FROM estiercol WHERE establo_id = 5;`.
6. **Trabajo 6 (Aves del Estinfalo):** Ajustar la luminosidad y contraste de color del texto `#ffff00` sobre fondo `#000000` con `aria-hidden="false"`.
7. **Trabajo 7 (Toro de Creta):** Añadir cabecera `Access-Control-Allow-Origin: *` y metodo `POST`.
8. **Trabajo 8 (Yeguas de Diomedes):** Seleccionar permisos `750` (`rwxr-x---`).
9. **Trabajo 9 (Cinturon de Hipolita):** Inspeccionar la consola, cabecera de red simulada y `localStorage.getItem('girdle_fragment')`. Concatenar: `AMAZONAS_KEY_2024`.
10. **Trabajo 10 (Bueyes de Gerion):** Completar `{% extends "base.html" %}` y `{% block content %}`.
11. **Trabajo 11 (Manzanas Hesperides):** Aplicar rotacion ROT13 sobre el criptograma para obtener la palabra clave `ATLAS`.
12. **Trabajo 12 (Cerbero del Inframundo):** Componer el token JWT con algoritmo `HS256`, rol `HERACLES_ADMIN` y firma valida.

**Clave Maestra de Desbloqueo Final:**  
`HERACLES.EXE`

---

## 7. Creditos y Licencia

- **Proyecto:** Escape Room Curricular Intermodular de DAW
- **Equipo:** Olympus Tech Solutions - Grupo 4
- **Avisos de Estilo:** Totalmente libre de emojis, optimizado con tipografias clasicas (Cinzel y JetBrains Mono) y diseño responsive compatible con dispositivos moviles y pantallas de escritorio.
