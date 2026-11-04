# Despliegue de Heracles.exe

## Desarrollo (Windows)
```
python -m venv escapeVenv
escapeVenv\Scripts\activate          (si PowerShell bloquea scripts, usar cmd)
pip install -r requirements.txt
python app.py                          (FLASK_DEBUG=1 para recarga automatica)
```
- Juego: http://localhost:5000
- Panel interno: http://localhost:5000/admin (contraseña en `.admin_password` o en `ADMIN_PASSWORD`)

## Base de datos
- Por defecto SQLite (`heracles.db`, se crea sola al arrancar).
- PostgreSQL: `pip install psycopg2-binary` y `DATABASE_URL=postgresql://usuario:clave@host:5432/heracles`.
- Si cambias los modelos con una base ya creada, borra `heracles.db` (se vuelve a sembrar) o usa Flask-Migrate.

## Produccion (Linux, maquina virtual Ubuntu)
Los archivos de configuracion estan en `deploy/`.

1. Usuario sin privilegios y carpeta de la app:
   ```
   sudo adduser --system --group heracles
   sudo mkdir -p /opt/heracles && sudo chown -R heracles:heracles /opt/heracles
   sudo chmod 750 /opt/heracles
   ```
2. Codigo y entorno virtual (como usuario `heracles`):
   ```
   git clone <repo> /opt/heracles && cd /opt/heracles
   python3 -m venv venv && venv/bin/pip install -r requirements.txt gunicorn
   ```
3. Variables de entorno en `/etc/heracles.env` (permisos `chmod 600`, propietario root):
   ```
   SECRET_KEY=<cadena larga aleatoria>
   ADMIN_PASSWORD=<contraseña del panel>
   FLASK_DEBUG=0
   ```
4. Servicio: `sudo cp deploy/heracles.service /etc/systemd/system/ && sudo systemctl enable --now heracles`
5. Nginx: copiar `deploy/nginx-heracles.conf` a `/etc/nginx/sites-available/heracles`, enlazarlo en `sites-enabled`, `sudo nginx -t && sudo systemctl reload nginx`.
6. HTTPS (si hay dominio): `sudo certbot --nginx -d <dominio>`.
7. Firewall: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable` (el puerto 8000 solo escucha en 127.0.0.1).
8. Comprobar: `systemctl status heracles`, `journalctl -u heracles -f`, `curl -I http://localhost`.

## Prueba de carga basica
Antes del evento, simular acceso simultaneo (por ejemplo 50 peticiones concurrentes):
```
sudo apt install apache2-utils
ab -n 500 -c 50 http://<servidor>/
ab -n 500 -c 50 http://<servidor>/api/trials
```
Revisar que no hay errores 5xx y que el tiempo medio es razonable; si no, subir `-w` en gunicorn.

## Copias de seguridad
- SQLite: `deploy/backup.sh` (cron cada hora el dia del evento; conserva 7 dias). En Windows, Cobian Reflector.
- PostgreSQL: `pg_dump heracles > copia.sql`.
- Restaurar: parar el servicio, copiar la copia sobre `heracles.db`, arrancar de nuevo.

## Plan de contingencia el dia del evento
1. Tener `heracles.db` de reserva y el repositorio clonado en un segundo equipo.
2. Si falla el servidor: `sudo systemctl restart heracles` (o `python app.py`); los grupos conservan el progreso en la base de datos.
3. Si un grupo se atasca o una prueba falla en su equipo: en `/admin` -> *Dar por superada* esa prueba; el mapa del grupo la recoge sola en menos de 15 s.
4. Si los moviles no pueden abrir el QR (sin wifi): llevar impresa la tarjeta con el mensaje `ODGRQ` y la pista del desplazamiento; la solucion es `LADON`.
5. Si un navegador no reproduce la voz de Cerbero, el juego muestra la letra escrita.
6. Si falla la red: usar el modo presentacion (`/restaurada?presentacion=1`) para mostrar el resultado final.
7. Soluciones de todas las pruebas: tabla del README (seccion 2), para el personal de apoyo.
