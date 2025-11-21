#!/bin/bash

# Script de déploiement simple pour prototype_billeterie
# Port: 3377
# Dossier: /opt/prototype_billeterie

set -e

echo "🚀 Déploiement prototype_billeterie"
echo "=================================="

# 1. Ouvrir le port 3377
echo ""
echo "📌 Étape 1: Ouverture du port 3377..."
sudo ufw allow 3377/tcp
sudo ufw reload
echo "✅ Port 3377 ouvert"

# 2. Créer le dossier s'il n'existe pas
echo ""
echo "📌 Étape 2: Préparation du dossier..."
DEPLOY_DIR="/opt/prototype_billeterie"

if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Création du dossier $DEPLOY_DIR..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
    echo "✅ Dossier créé"
fi

cd "$DEPLOY_DIR"

# 3. Cloner ou mettre à jour
echo ""
echo "📌 Étape 3: Récupération du code..."

if [ -d ".git" ]; then
    echo "📥 Mise à jour du dépôt..."
    git pull origin main
    echo "✅ Code mis à jour"
else
    echo "📥 Clonage du dépôt..."
    git clone https://github.com/shadjava2/prototype_billeterie.git .
    echo "✅ Dépôt cloné"
fi

# 4. Lancer Docker
echo ""
echo "📌 Étape 4: Lancement Docker..."
docker compose up -d --build
echo "✅ Conteneur lancé"

# 5. Vérifier
echo ""
echo "📌 Étape 5: Vérification..."
sleep 2
docker compose ps

echo ""
echo "=================================="
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Logs: docker compose logs -f billeterie-proto"
echo "🌐 URL: http://$(hostname -I | awk '{print $1}'):3377"
echo "=================================="

