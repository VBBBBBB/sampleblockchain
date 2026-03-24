#!/bin/bash
set -e

exec > >(tee -i /home/ubuntu/install.log)
exec 2>&1

echo "====================================="
echo "   STARTING RATION-CHAIN DEPLOYMENT"
echo "====================================="

echo "[1/7] Updating apt packages..."
sudo apt update -y

echo "[2/7] Installing Docker & Docker Compose..."
sudo apt install -y docker.io docker-compose curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

echo "[3/7] Installing Node.js & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

echo "[4/7] Installing PowerShell for Linux..."
sudo snap install powershell --classic

echo "[5/7] Extracting codebase..."
cd /home/ubuntu
tar -xzvf deploy.tar.gz

echo "[6/7] Booting Hyperledger Fabric Network..."
cd /home/ubuntu/network
sudo docker-compose up -d
echo "Waiting 15 seconds for containers to initialize..."
sleep 15
sudo pwsh ./restore_network.ps1

echo "[7/7] Starting Node.js API Server..."
cd /home/ubuntu/server
npm install
# Ensure port 3000 is used
export PORT=3000
pm2 start app.js --name "ration-api"
pm2 save
sudo env PATH=$PATH:/usr/bin $(npm root -g)/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "====================================="
echo "   ✅ DEPLOYMENT SUCCESSFUL!"
echo "   Backend API running on Port 3000."
echo "====================================="
