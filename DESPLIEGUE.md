# Despliegue de Heracles.exe

## Desarrollo (Windows)
```
python -m venv escapeVenv
escapeVenv\Scripts\activate          (o:  python -m ... si PowerShell bloquea scripts, usar cmd)
pip install -r requirements.txt
python app.py                          (FLASK_DEBUG=1 para recarga automatica)
```
- Juego: http://localhost:5000
- Panel interno: http://localhost:5000/admin (la contraseña esta en `.admin_password` o en `ADMIN_PASSWORD`)

## Base de datos
- Por defecto SQLite (`heracles.db`, se crea sola al arrancar).
- PostgreSQL: `pip install psycopg2-binary` y definir `DATABASE_URL=postgresql://usuario:clave@host:5432/heracles`.
- Si cambias los modelos con una base ya creada, borra `heracles.db` (se vuelve a sembrar) o usa Flask-Migrate.

## Produccion (Linux, máquina virtual)
```
pip install gunicorn
gunicorn -w 2 -b 127.0.0.1:8000 wsgi:app
```
Nginx delante como proxy inverso (`proxy_pass http://127.0.0.1:8000;`) y un servicio systemd que lance gunicorn con las variables `SECRET_KEY`, `ADMIN_PASSWORD` y `DATABASE_URL`.

## Copias de seguridad
- SQLite: copiar `heracles.db` a diario (Cobian Reflector en Windows, o `cp` + cron en Linux).
- PostgreSQL: `pg_dump heracles > copia.sql`.

## Plan de contingencia el día del evento
1. Tener `heracles.db` de reserva y el repositorio clonado en un segundo equipo.
2. Si falla el servidor: reiniciar con `python app.py`; los grupos conservan el progreso en la base de datos.
3. Si un grupo se atasca o una prueba falla en su equipo: en `/admin` → *Dar por superada* esa prueba; el mapa
   del grupo la recoge sola en menos de 15 s y pueden seguir.
4. Si los móviles no pueden abrir el QR (sin wifi): llevar impresa la tarjeta con el mensaje `ODGRQ` y la pista
   del desplazamiento; la solución es `LADON`.
5. Si un navegador no reproduce la voz de Cerbero, el juego muestra la letra escrita.
6. Si falla la red: usar el modo presentación (`/restaurada?presentacion=1`) para mostrar el resultado final.
7. Soluciones de todas las pruebas: tabla del README (sección 2), para el personal de apoyo.
