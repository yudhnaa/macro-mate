#!/bin/bash

# Script để setup server DigitalOcean Droplet
# Chạy script này trên server mới

set -e

echo "=== Updating system packages ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installing Docker ==="
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

echo "=== Installing Docker Compose ==="
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== Adding current user to docker group ==="
sudo usermod -aG docker ${USER}

echo "=== Installing git ==="
sudo apt install -y git

echo "=== Setup firewall ==="
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "=== Setup completed! ==="
echo "Please logout and login again for docker group changes to take effect"
echo "Then clone your repository to ~/macro-mate"
