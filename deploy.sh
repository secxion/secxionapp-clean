#!/bin/bash

# VPS info
VPS_USER=root
VPS_IP=31.97.255.22
VPS_DIR=/root/secxionapp

# Path to your SSH private key
SSH_KEY=~/.ssh/id_ed25519

function deploy() {
  echo "🌀 Starting deployment to $VPS_IP..."
  
  echo "🖼️  Compressing images before deployment..."
  npm run compress:images

  echo "🧹 Cleaning up remote directories..."
  ssh -i "$SSH_KEY" $VPS_USER@$VPS_IP << 'ENDSSH'
    rm -rf /root/secxionapp/*
    mkdir -p /root/secxionapp/{backend/client_build,frontend}
ENDSSH

  echo "📤 Uploading files via scp..."
  scp -r -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o LogLevel=ERROR \
    ./backend ./frontend package.json "$VPS_USER@$VPS_IP:$VPS_DIR"

  # Explicitly copy backend and frontend package.json and package-lock.json
  scp -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o LogLevel=ERROR \
    ./backend/package.json ./backend/package-lock.json "$VPS_USER@$VPS_IP:$VPS_DIR/backend/"
  scp -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    -o LogLevel=ERROR \
    ./frontend/package.json ./frontend/package-lock.json "$VPS_USER@$VPS_IP:$VPS_DIR/frontend/"

  echo "🔧 Running post-deploy setup on VPS..."
  ssh -i "$SSH_KEY" $VPS_USER@$VPS_IP << 'ENDSSH'
    set -e # Exit on error

    cd /root/secxionapp

    echo "📦 Installing backend dependencies..."
    cd backend
    npm install

    echo "🛠️ Building frontend..."
    cd ../frontend
    npm install
    npm run build

    echo "🚚 Moving frontend build into backend/client_build..."
    rm -rf ../backend/client_build/*
    cp -r build/* ../backend/client_build/

    echo "🔁 Restarting backend with PM2..."
    cd ../backend
    if pm2 list | grep -q "secxion-backend"; then
      pm2 delete secxion-backend
    fi
  pm2 start index.js --name secxion-backend
    pm2 save

    echo "✅ Server deploy complete."
ENDSSH

  echo "🎉 Local deploy script finished."
}

# Main execution
deploy