#!/bin/bash

# Pastikan script berhenti jika ada perintah yang gagal
set -e

# Lakukan git pull untuk mendapatkan perubahan terbaru
echo "Pulling latest changes from Git repository..."
git pull

# Install dependencies dengan npm
echo "Installing npm dependencies..."
npm install

# Bangun proyek dengan npm
echo "Building the project..."
npm run build

# Reload aplikasi dengan PM2
echo "Reloading application with PM2..."
pm2 reload erha-frontend

echo "Deployment completed successfully!"


