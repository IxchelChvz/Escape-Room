#!/bin/sh
# Copia diaria de la base de datos (cron: 0 * * * * /opt/heracles/deploy/backup.sh)
mkdir -p /opt/heracles/backups
cp /opt/heracles/heracles.db "/opt/heracles/backups/heracles-$(date +%Y%m%d-%H%M).db"
find /opt/heracles/backups -name 'heracles-*.db' -mtime +7 -delete
