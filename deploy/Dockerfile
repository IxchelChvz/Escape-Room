# Imagen base optimizada de Python para produccion
FROM python:3.11-slim

# Metadatos del contenedor
LABEL maintainer="Olympus Tech Solutions <daw@olympus.lan>"
LABEL description="HERACLES.EXE - Escape Room Educativo Web"

# Variables de entorno de Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el codigo fuente de la aplicacion
COPY . .

# Crear usuario sin privilegios por seguridad
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Exponer el puerto de la aplicacion
EXPOSE 3000

# Comprobacion de salud (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/trials || exit 1

# Comando de ejecucion con Gunicorn
CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:application"]
