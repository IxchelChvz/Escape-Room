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
- Para probar desde un movil en la misma wifi: abrir `http://<IP-del-PC>:5000` (la IP sale con `ipconfig`) y permitir Python en el firewall de Windows para redes privadas.

## Base de datos
- Por defecto SQLite (`heracles.db`, se crea sola al arrancar).
- PostgreSQL: `pip install psycopg2-binary` y `DATABASE_URL=postgresql://usuario:clave@host:5432/heracles`.
- Si cambias los modelos con una base ya creada, borra `heracles.db` (se vuelve a sembrar) o usa Flask-Migrate.

## Que rama se despliega
Todo el trabajo reciente (minijuegos con ilustraciones, tiempos, prueba 11 bloqueada, panel de admin...) esta en
la rama **`pruebas`**. Antes del despliegue, fusionar `pruebas` en `main` o clonar directamente `pruebas`
(paso 2). Si se clona `main` sin fusionar, se despliega una version antigua.

## Produccion (Linux, maquina virtual Ubuntu)
Los archivos de configuracion estan en `deploy/`.

> **Saltos de linea:** clonar el repositorio con Git en el servidor. Si se copian los archivos desde Windows
> (USB, WinSCP...), `deploy/backup.sh` y `deploy/heracles.service` llevan saltos de linea de Windows y fallan;
> en ese caso pasarlos por `dos2unix`.

1. Usuario sin privilegios y carpeta de la app:
   ```
   sudo adduser --system --group heracles
   sudo mkdir -p /opt/heracles && sudo chown -R heracles:heracles /opt/heracles
   sudo chmod 750 /opt/heracles
   ```
2. Codigo y entorno virtual (como usuario `heracles`):
   ```
   git clone -b pruebas <repo> /opt/heracles && cd /opt/heracles
   python3 -m venv venv && venv/bin/pip install -r requirements.txt gunicorn
   ```
   En Ubuntu 24.04 hace falta `sudo apt install python3-venv`; no instalar paquetes con pip fuera del entorno virtual.
3. Variables de entorno en `/etc/heracles.env` (permisos `chmod 600`, propietario root):
   ```
   SECRET_KEY=<cadena larga aleatoria>
   ADMIN_PASSWORD=<contraseña del panel>
   QR_TOKEN=<codigo fijo para la URL del QR>
   FLASK_DEBUG=0
   ```
   Hay que definir las tres: gunicorn arranca 2 workers y, si no estan, cada uno podria generar valores distintos
   (sesiones que se cierran solas o un QR que cambia).
4. Crear la base de datos una sola vez antes de arrancar el servicio (evita que los 2 workers la creen a la vez):
   ```
   sudo -u heracles bash -c 'cd /opt/heracles && set -a && . /etc/heracles.env && venv/bin/python -c "import app"'
   ```
5. Servicio: `sudo cp deploy/heracles.service /etc/systemd/system/ && sudo systemctl enable --now heracles`
   (`enable` hace que vuelva a arrancar solo si se reinicia la maquina).
6. Nginx: copiar `deploy/nginx-heracles.conf` a `/etc/nginx/sites-available/heracles`, cambiar `server_name` por
   la IP o el dominio, enlazarlo en `sites-enabled` y `sudo nginx -t && sudo systemctl reload nginx`.
   Nginx (usuario `www-data`) debe poder leer `/opt/heracles/static`; si la web sale sin estilos, revisar permisos.
7. HTTPS (solo si hay dominio): `sudo certbot --nginx -d <dominio>`. Con una IP sin dominio se usa HTTP; el login
   funciona igual.
8. Firewall: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable` (el puerto 8000 solo escucha
   en 127.0.0.1).
9. Comprobar: `systemctl status heracles`, `journalctl -u heracles -f`, `curl -I http://localhost`.
   Un error 502 en el navegador indica que gunicorn no esta arrancado.

## Servidor en AWS Academy (Learner Lab)
1. **Instancia:** EC2 con Ubuntu 22.04 o 24.04, tipo `t2.micro` o `t3.micro` (regiones `us-east-1` o `us-west-2`).
2. **Conexion:** descargar `labsuser.pem` desde *AWS Details* y `ssh -i labsuser.pem ubuntu@<IP-publica>`.
   No guardar la clave dentro de la carpeta del proyecto.
3. **Security Group (reglas de entrada):** 80 abierto a `0.0.0.0/0`, 22 solo desde la IP propia, 443 solo si hay
   HTTPS. El 8000 no se abre.
4. **Elastic IP:** asociarla a la instancia. Sin ella la IP publica cambia cada vez que se reinicia el laboratorio
   y deja de funcionar el enlace (y el QR). Si se borra la instancia, liberar la Elastic IP para no gastar credito.
5. **El laboratorio se apaga a las 4 horas:** arrancarlo (*Start Lab*) antes de la sesion y vigilar el contador.
   Con `systemctl enable` (paso 5 de produccion), la app vuelve a arrancar sola al encender la instancia.
6. **No perder datos:** parar la instancia conserva el disco, pero terminarla o hacer *Reset* del laboratorio borra
   todo. Antes, descargar la base de datos: `scp -i labsuser.pem ubuntu@<IP>:/opt/heracles/heracles.db .`
7. **Probar desde fuera:** abrir `http://<IP-publica>` con el movil usando datos (sin wifi).

## Prueba de carga basica
Antes del evento, simular acceso simultaneo (por ejemplo 50 peticiones concurrentes):
```
sudo apt install apache2-utils
ab -n 500 -c 50 http://<servidor>/
ab -n 500 -c 50 http://<servidor>/api/trials
```
Revisar que no hay errores 5xx y que el tiempo medio es razonable; si no, subir `-w` en gunicorn.

## Copias de seguridad
- SQLite: `deploy/backup.sh` (cron cada hora el dia del evento con `sudo crontab -u heracles -e`; conserva 7 dias).
  Darle permiso de ejecucion con `chmod +x`. En Windows, Cobian Reflector.
- Las copias se guardan en el mismo disco: en AWS, descargar ademas una copia al ordenador (ver AWS, punto 6).
- PostgreSQL: `pg_dump heracles > copia.sql`.
- Restaurar: parar el servicio, copiar la copia sobre `heracles.db`, arrancar de nuevo.

## Plan de contingencia el dia del evento
1. Tener `heracles.db` de reserva y el repositorio clonado en un segundo equipo.
2. Si falla el servidor: `sudo systemctl restart heracles` (o `python app.py`); los grupos conservan el progreso en la base de datos.
3. Si un grupo se atasca o una prueba falla en su equipo: en `/admin` -> *Dar por superada* esa prueba; el mapa del
   grupo la recoge sola en menos de 15 s. Se puede hacer desde cualquier ordenador o movil con acceso al panel.
4. **Prueba 11 (Hespérides):** esta bloqueada con candado. Hay que darla por superada desde `/admin` a cada grupo
   para que reciba su caracter (sin el no pueden completar la contraseña). La pagina del QR (`/oraculo/<token>`)
   sigue existiendo, pero solo la abre la sesion de administracion (boton *Ver el oraculo* de las vistas previas).
5. Si un navegador no reproduce la voz de Cerbero, el juego muestra la letra escrita.
6. Para enseñar el resultado final sin haber ganado: entrar en `/admin` y pulsar *Ir a la web restaurada* (modo
   presentacion `/restaurada?presentacion=1`, solo funciona con la sesion de administracion abierta).
7. Para comprobar la pantalla de tiempo agotado sin esperar 1 h 30 min: `/admin` -> *Ver la pantalla de tiempo agotado*.
8. Soluciones y tiempos de todas las pruebas: tabla del README (seccion 2), para el personal de apoyo.
