#!/bin/bash

# Script de déploiement pour OVH
# Usage: bash deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de l'application Billeterie Nationale"
echo "=================================================="

# 1. Ouvrir le port 3377
echo ""
echo "📌 Étape 1: Configuration du firewall..."
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
else
    echo "✅ Dossier existe déjà"
fi

cd "$DEPLOY_DIR"

# 3. Cloner ou mettre à jour le dépôt
echo ""
echo "📌 Étape 3: Récupération du code..."

if [ -d ".git" ]; then
    echo "📥 Mise à jour du dépôt existant..."
    git pull origin main
    echo "✅ Code mis à jour"
else
    echo "📥 Clonage du dépôt..."
    # Supprimer le contenu si le dossier existe mais n'est pas un dépôt Git
    if [ "$(ls -A)" ]; then
        echo "⚠️  Le dossier contient des fichiers. Nettoyage..."
        rm -rf * .[!.]* 2>/dev/null || true
    fi
    git clone https://github.com/shadjava2/prototype_billeterie.git .
    echo "✅ Dépôt cloné"
fi

# 4. Reconstruire et lancer avec Docker
echo ""
echo "📌 Étape 4: Construction et démarrage du conteneur..."
docker compose up -d --build
echo "✅ Conteneur lancé"

# 5. Vérifier le statut
echo ""
echo "📌 Étape 5: Vérification du statut..."
sleep 2
docker compose ps

echo ""
echo "=================================================="
echo "✅ Déploiement terminé avec succès!"
echo ""
echo "📊 Pour voir les logs en temps réel:"
echo "   docker compose logs -f billeterie-proto"
echo ""
echo "🌐 L'application est accessible sur: http://$(hostname -I | awk '{print $1}'):3377"
echo "=================================================="

