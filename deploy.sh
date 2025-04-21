#!/bin/bash

# Copy the frontend build to the server
scp -r comcol_frontend/build stark.fr://var/www/html/comcol/frontend

# Copy the backend build to the server
scp -r manage.py stark.fr://var/www/html/comcol/
scp -r requirements.txt stark.fr://var/www/html/comcol/
# (pip install -r requirements.txt)
scp -r db.sqlite3 stark.fr://var/www/html/comcol/
scp -r comcol_backend/*.py stark.fr://var/www/html/comcol/comcol_backend/
scp -r prod-settings.py stark.fr://var/www/html/comcol/comcol_backend/settings.py
# scp -r media stark.fr://var/www/html/comcol/media
