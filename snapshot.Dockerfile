# Plate Recognizer Snapshot Collector Dockerfile
# ملف Docker لجامع لقطات Plate Recognizer

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY snapshot_requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r snapshot_requirements.txt

# Copy application files
COPY snapshot_to_postgres.py /app/
COPY .env /app/.env

# Copy images file (if exists)
# If you want to add images at build time, uncomment the next line
# COPY images.txt /app/

# Create directory for logs
RUN mkdir -p /app/logs

# Environment variables (can be overridden at runtime)
ENV PYTHONUNBUFFERED=1

# Default command - expects images.txt to be mounted or provided
CMD ["python", "snapshot_to_postgres.py", "images.txt"]
