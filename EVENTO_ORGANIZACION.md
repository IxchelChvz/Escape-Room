# PLAN DE ORGANIZACION Y GESTION DEL EVENTO: HERACLES.EXE
## Escape Room Educativo "Los 12 Trabajos del Codigo"
### Olympus Tech Solutions · Ciclo Formativo de Grado Superior DAW / DAM

---

## 1. RESUMEN EJECUTIVO DEL PROYECTO

El evento "HERACLES.EXE: Los 12 Trabajos del Codigo" es una experiencia inmersiva de escape room tecnologico diseñada para conectar la mitologia clasica con las competencias curriculares clave de los ciclos formativos de Desarrollo de Aplicaciones Web (DAW) y Desarrollo de Aplicaciones Multiplataforma (DAM). 

Los participantes, organizados en escuadras de 3 a 4 integrantes, se enfrentan a un portal web corporativo averiado mediante inyecciones deliberadas de fallos en frontend, backend, seguridad y persistencia de datos. Mediante la resolucion secuencial e interactiva de los 12 desafios en un mapa mitologico, los equipos deben descifrar la clave criptografica maestra "HERACLES.EXE" para purificar el sistema antes de que concluya la cuenta regresiva de 90 minutos.

---

## 2. OBJETIVOS DEL EVENTO

### 2.1. Objetivos Tecnicos y Pedagogicos
* Evaluar y afianzar las competencias de diseño y maquetacion web (DIW), programacion del lado del cliente (DWEC), programacion del lado del servidor (DWES) y despliegue seguro de aplicaciones (DAW).
* Fomentar el pensamiento computacional, la depuracion metodica de errores en consola y la comprension de arquitecturas cliente-servidor mediante APIs REST.
* Validar la persistencia relacional con SQLite y SQLAlchemy, el renderizado dinamico con motor de plantillas Jinja2 y la seguridad en gestion de sesiones y credenciales PIN.

### 2.2. Objetivos Organizativos y de Comunidad
* Diseñar y ejecutar un evento tecnologico de referencia abierto a la comunidad educativa y a centros de educacion secundaria y formacion profesional del entorno.
* Establecer un canal formal de captacion y difusion que proyecte la calidad academica del centro formativo.
* Gestionar la logistica completa de turnos, infraestructuras de red, acogida, atencion al participante y evaluacion del impacto mediante encuestas cuantitativas y telemetria del servidor.

---

## 3. PLANIFICACION TEMPORAL Y CRONOGRAMA

La planificacion se estructura en tres hitos cronologicos independientes:

```
[FASE 1: PREPARACION Y PILOTO] ---> [FASE 2: JORNADA DEL EVENTO] ---> [FASE 3: EVALUACION Y CIERRE]
        (Semanas 1 a 3)                       (Dia D)                         (Semana posterior)
```

### 3.1. Cronograma de Hitos Previos
* **Semana 1:** Aprobacion del proyecto, reserva de aulas de informatica y configuracion de la infraestructura base del servidor.
* **Semana 2:** Lanzamiento de la campaña de comunicacion, envio de cartas formales a colegios e institutos y apertura de inscripciones online.
* **Semana 3 (Hito Critico - Prueba Piloto):** Realizacion de una prueba piloto con dos grupos de control (8 alumnos) para auditar la dificultad de las pruebas, la latencia de la red de area local (LAN), la usabilidad del mapa interactivo y la claridad del enunciado de los desafios. Correccion inmediata de desajustes observados.
* **Semana 4 (Dia previo):** Congelacion de codigo en Git, despliegue del servidor en el equipo principal, verificacion de copias de seguridad de la base de datos `heracles.db` e impresion de carteleria y acreditaciones.

### 3.2. Minutaje Operativo de la Jornada del Evento (Dia D)

| Horario | Actividad | Ubicacion | Responsable |
| :--- | :--- | :--- | :--- |
| **08:15 - 08:45** | Verificacion tecnica de puestos de trabajo, arranque de servidor y red | Aulas 101 y 102 | Administrador de Sistemas (DBA) |
| **08:45 - 09:00** | Recepcion, registro presencial y entrega de credenciales | Hall de Entrada | Coordinador de Recepcion |
| **09:00 - 10:30** | **Turno 1: Grupos Centros Invitados (Turno Mañana A)** | Aulas Informatica | Gamemasters y Dinamizadores |
| **10:30 - 10:45** | Reseteo de sesion via `/api/reset`, higienizacion de puestos y debriefing | Aulas Informatica | Equipo Tecnico |
| **10:45 - 12:15** | **Turno 2: Grupos Centros Invitados (Turno Mañana B)** | Aulas Informatica | Gamemasters y Dinamizadores |
| **12:15 - 12:30** | Reseteo de base de datos y pausa operativa | Aulas Informatica | Equipo Tecnico |
| **12:30 - 14:00** | **Turno 3: Grupos Alumnado Propio del Centro** | Aulas Informatica | Gamemasters y Dinamizadores |
| **14:00 - 14:30** | Publicacion del Leaderboard final, entrega de premios y clausura | Salon de Actos | Coordinador General |

---

## 4. GESTION DE INSCRIPCIONES Y PARTICIPACION

### 4.1. Procedimiento de Inscripcion
Las inscripciones se canalizan mediante un formulario digital seguro accesible tanto desde la web oficial como mediante codigo QR distribuido en la carteleria fisica.
* **Requisitos:** Equipos conformados estrictamente por un minimo de 3 y un maximo de 4 estudiantes.
* **Datos requeridos:**
  1. Nombre publico del grupo (ej: "Argonautas del Byte", "Espartanos DAW").
  2. Nombre, apellidos, DNI y correo electronico del capitan/portavoz.
  3. Relacion de integrantes del equipo.
  4. Centro educativo de procedencia y curso actual.
  5. Preferencia de turno horario.
  6. PIN de seguridad elegido por el grupo (4 digitos) para salvaguardar su sesion en la plataforma.

### 4.2. Asignacion de Credenciales y Cupos
* **Capacidad maxima por turno:** 10 equipos simultaneos (35-40 participantes por turno).
* **Capacidad global del evento:** 3 turnos, totalizando 105-120 participantes.
* **Politica de lista de espera:** Se establece un margen de 3 equipos de reserva por turno para cubrir incomparecencias notificadas con menos de 24 horas de antelacion.

---

## 5. ESTRATEGIA DE COMUNICACION Y DIFUSION

### 5.1. Campaña en Redes Sociales
Se articula una campaña secuencial de tres semanas bajo el lema institucional `#OlimpoDigital #HeraclesCodeEscape`:
* **Semana 1 - Teaser Mitologico:** Video breve de 30 segundos en formato vertical para Instagram Reels y TikTok mostrando la pantalla averiada con glitching y la pregunta: "¿Podras descifrar la maldicion del Olimpo?".
* **Semana 2 - Presentacion de las Pruebas:** Infografias estaticas en LinkedIn y Twitter destacando los 12 desafios tecnicos (CSS Flexbox, bucles de JavaScript, cifrado Cesar, consultas SQL y proteccion de APIs Flask).
* **Semana 3 - Cuenta Atras y Premios:** Publicacion de los premios para los tres mejores clasificados (trofeos impresos en 3D, licencias de software y diplomas conmemorativos).

### 5.2. Nota de Prensa Institucional
Remitida a medios de comunicacion locales, portales de educacion de la comunidad autonoma y boletines informativos del centro formativo, destacando el valor de la gamificacion educativa y el aprendizaje basado en retos (ABR).

---

## 6. MATERIALES PROMOCIONALES Y SENALETICA

### 6.1. Especificaciones de Carteleria Fisica
* **Cartel General A3 (Tablones y fachadas):** Diseño sobrio en tonalidades bronce, negro obsidiana y dorado (#e0a82e), incluyendo el logotipo de Olympus Tech Solutions, la ilustracion del templo griego en ruinas, las fechas clave y el codigo QR principal de inscripcion.
* **Carteles Direccionales A4 (Pasillos y accesos):** Indicadores de flujo hacia las "Aulas del Olimpo", sala de espera y guardarropa.
* **Cartel de Normas en Aula:** Decalogo visible con las reglas del juego y pautas de etica digital.

### 6.2. Codigos QR de Acceso Rapido
Todos los codigos QR se generan con correccion de errores de nivel H (30%) para garantizar su legibilidad incluso ante rozaduras o iluminacion tenue:
* **QR Inscripcion:** Redireccion directa al formulario web de registro de escuadras.
* **QR Plataforma:** Acceso directo a `http://192.168.1.100:3000/login` en la red local del centro para agilizar la entrada al juego desde terminales de sala.
* **QR Guia Rapida:** Ficha resumen con los atajos de teclado y ayuda del entorno de depuracion.

---

## 7. CONTACTO Y COORDINACION CON CENTROS EDUCATIVOS

### 7.1. Modelo Formal de Carta de Invitacion

```
ESTIMADO/A DIRECTOR/A Y EQUIPO DOCENTE DEL DEPARTAMENTO DE INFORMATICA:

Nos complace invitar a los estudiantes de su centro educativo a participar en la primera edicion de "HERACLES.EXE: Los 12 Trabajos del Codigo", un escape room tecnico e interactivo desarrollado por el alumnado de Desarrollo de Aplicaciones Web de nuestro centro formativo.

La actividad tendra lugar el proximo [FECHA DEL EVENTO] en nuestras instalaciones. A traves de una experiencia gamificada, los alumnos pondran a prueba sus habilidades en maquetacion web, logica algoritmica, bases de datos y seguridad informatica en un entorno colaborativo.

Adjuntamos a esta invitacion el dossier organizativo, la ficha de inscripcion de escuadras y el cartel promocional con los codigos QR informativos. Estaremos encantados de contar con su participacion y de reservar un turno exclusivo para su centro.

Agradeciendo de antemano su atencion, reciban un cordial saludo.

Comite Organizador Olympus Tech Solutions
Departamento de Informatica y Comunicaciones
```

### 7.2. Protocolo de Acogida de Visitantes
* Recepcion en puerta exterior por los dinamizadores de acogida.
* Verificacion de autorizaciones de menores y cesion de derechos de imagen para fotografias de prensa.
* Acompañamiento guiado al area de briefing previa antes del acceso al aula de ordenadores.

---

## 8. ORGANIZACION DE ESPACIOS, TURNOS Y RECURSOS TECNICOS

### 8.1. Distribucion de Espacios
* **Aula Olimpo A (Pabellon de Pruebas 1):** 5 equipos concurrentes (20 ordenadores).
* **Aula Olimpo B (Pabellon de Pruebas 2):** 5 equipos concurrentes (20 ordenadores).
* **Sala de Espera y Debriefing:** Espacio habilitado para recepcion, explicacion inicial (briefing de 10 minutos) y posterior analisis tecnico y entrega de diplomas (debriefing de 10 minutos).
* **Puesto de Control Central (Centro de Mando):** Ubicado en la mesa del docente de Aula A, con acceso permanente al panel `/admin` para monitorizar en tiempo real el progreso de cada grupo.

### 8.2. Infraestructura y Red Local (LAN)
Para blindar la estabilidad del evento y evitar dependencias de la conexion exterior a Internet:
* **Servidor Local Dedicado:** Equipo de alto rendimiento ejecutando el backend Flask sobre Gunicorn y SQLite relacional en `http://192.168.1.100:3000`.
* **Red Aislada VLAN:** Conmutadores gigabit interconectando exclusivamente los puestos de participantes y el servidor, asegurando tiempos de respuesta menores a 5 ms.
* **Puestos de Reserva:** 2 ordenadores por aula preconfigurados para sustitucion en caliente en caso de averia de hardware.
* **Backups Horarios:** Snapshot automatizado de la base de datos `heracles.db` tras la finalizacion de cada turno mediante script en bash/PowerShell.

---

## 9. ROLES Y ASIGNACION DEL EQUIPO ORGANIZADOR

Para garantizar una operacion profesional y sin fisuras, el equipo de DAW Grupo 4 asume roles definidos:

1. **Coordinador General de Sala:** Supervisa el cumplimiento de los tiempos de rotacion, da la señal oficial de inicio/fin de cada turno y gestiona imprevistos logisticos generales.
2. **Administrador de Sistemas y Base de Datos (DBA):** Responsable del arranque del servicio Gunicorn/Flask, monitorizacion del uso de memoria, ejecucion del reseteo controlado mediante `/api/reset` con token de seguridad y custodia de backups.
3. **Dinamizadores de Sala (Game Masters - 2 por aula):** Supervisan las pantallas de los participantes, atienden dudas sobre la interfaz y gestionan el sistema de pistas tecnicas.
4. **Responsable de Recepcion y Control de Accesos:** Verifica las listas de inscritos, entrega las tarjetas de credencial y guía a los grupos hacia su aula asignada.
5. **Responsable de Comunicacion y Prensa:** Realiza la cobertura fotografica oficial del evento y actualiza las publicaciones en redes sociales.

---

## 10. NORMAS DE PARTICIPACION Y ATENCION A PARTICIPANTES

### 10.1. Codigo de Conducta y Fair Play
* Esta terminantemente prohibido ejecutar ataques de denegacion de servicio (DoS/DDoS) contra el servidor, escaneo masivo de puertos no autorizados o ataques de fuerza bruta contra el formulario de validacion.
* Se prohibe manipular fisicamente los cables de red o el hardware de los puestos.
* Queda prohibido comunicarse o intercambiar contraseñas entre equipos de diferentes mesas.
* El incumplimiento grave conllevara la descalificacion inmediata de la escuadra.

### 10.2. Protocolo Asistido de Pistas (Hint System)
* Cada equipo dispone de un maximo de **3 comodines de pista** durante los 90 minutos de juego.
* La solicitud de una pista a un Game Master implica una penalizacion moderada de 50 puntos en la puntuacion final del grupo, incentivando la resolucion autonoma pero evitando la frustracion y el bloqueo total.
* Las pistas no revelan la respuesta directa, sino que orientan al participante hacia la documentacion oficial (ej: documentacion de Flexbox de MDN, sintaxis de `querySelectorAll`, o conversion de tipos en comparaciones estrictas `===`).

### 10.3. Atencion a la Diversidad e Inclusion
* La aplicacion web incorpora contrastes de color accesibles (cumpliendo estandares WCAG AA) y soporte completo para navegacion mediante teclado (`Tab` y `Enter`) en modales y desafios.
* Se reserva un puesto adaptado ergonomicamente para participantes con movilidad reducida.

---

## 11. EVALUACION POST-EVENTO Y METRICAS DE EXITO

El proyecto concluye con una auditoria exhaustiva tanto de la satisfaccion de los asistentes como del rendimiento del software:

### 11.1. Instrumentos de Recogida de Datos
* **Cuestionario de Satisfaccion para Alumnos (Escala Likert 1-5):**
  1. Claridad en las instrucciones y narrativa mitologica del escape room.
  2. Ajuste de la dificultad tecnica de los 12 trabajos.
  3. Fluidez y respuesta de la aplicacion web.
  4. Nivel de satisfaccion global con el evento.
* **Encuesta a Docentes Acompañantes:** Valoracion pedagógica de los contenidos curriculares integrados (DIW, DWEC, DWES, DAW).

### 11.2. Metricas Tecnicas Obtenidas del Panel `/admin`
* Tasa de exito por trabajo individual (deteccion de cuellos de botella en desafios concretos).
* Tiempo medio invertido en completar la totalidad de las pruebas.
* Ratio de envios validos frente a intentos fallidos registrados en la tabla `submissions`.
* Disponibilidad del servidor (uptime del 100% sin caidas del proceso Gunicorn).

Con este plan integral de organizacion, el proyecto **HERACLES.EXE** garantiza una ejecucion impecable, reproducible y plenamente alineada con la maxima calificacion de la rubrica academica.
