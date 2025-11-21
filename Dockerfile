# syntax=docker/dockerfile:1

FROM python:3.12-slim as backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    nginx \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/comcol_backend/ ./comcol_backend/
COPY backend/manage.py ./

# Copy prod-settings.py as the actual settings.py in the module
COPY backend/prod-settings.py ./comcol_backend/settings.py

# Copy database and media
COPY backend/db.sqlite3 ./
COPY backend/media/ ./media/

# --- Frontend build ---
FROM node:20 as frontend
WORKDIR /frontend
COPY frontend/comcol_frontend/package.json ./
COPY frontend/comcol_frontend/package-lock.json ./
RUN npm install || true # fallback if no lock file
COPY frontend/comcol_frontend/ ./
RUN npm run build

# --- Final image ---
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend from backend stage
COPY --from=backend /app /app

# Copy frontend build
COPY --from=frontend /frontend/build /app/frontend_build

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Collect static files (no --settings needed, it uses comcol_backend.settings)
RUN python manage.py collectstatic --noinput

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set permissions
RUN chmod -R 755 /app/media

# Gunicorn for Django
RUN pip install gunicorn

# Expose port
EXPOSE 8080

# Start script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
