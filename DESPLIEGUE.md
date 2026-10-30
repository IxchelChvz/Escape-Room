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
3. Si falla la red: usar el modo presentación (`/restaurada?presentacion=1`) para mostrar el resultado final.
