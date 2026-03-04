# ============================================================
# PAMP Backend — Dockerfile
# Python 3.12 FastAPI + Uvicorn
# ============================================================

FROM python:3.12-slim

# Prevents Python from writing .pyc files and enables stdout logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run as non-root user for security
RUN useradd -m -u 1001 pamp && chown -R pamp:pamp /app
USER pamp

EXPOSE 8000

# Use 2 workers per CPU core (4 vCPUs = 8 workers max; start with 4)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
