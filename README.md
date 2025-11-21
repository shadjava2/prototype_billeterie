# Prototype Billeterie Nationale

Application de gestion de billeterie nationale pour le Ministère des Transports.

## 🚀 Déploiement sur serveur OVH

### Prérequis
- Docker et Docker Compose installés
- Accès SSH au serveur
- Port 3377 ouvert dans le firewall

### Instructions de déploiement

#### Option 1 : Script automatique (recommandé)

```bash
cd /opt
wget https://raw.githubusercontent.com/shadjava2/prototype_billeterie/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

#### Option 2 : Déploiement manuel

```bash
# 1. Ouvrir le port 3377
sudo ufw allow 3377/tcp
sudo ufw reload

# 2. Créer le dossier (s'il n'existe pas)
sudo mkdir -p /opt/prototype_billeterie
sudo chown -R $USER:$USER /opt/prototype_billeterie

# 3. Aller dans le dossier
cd /opt/prototype_billeterie

# 4. Cloner ou mettre à jour
if [ ! -d ".git" ]; then
    git clone https://github.com/shadjava2/prototype_billeterie.git .
else
    git pull origin main
fi

# 5. Reconstruire et lancer
docker compose up -d --build

# 6. Vérifier
docker compose ps

# 7. Voir les logs
docker compose logs -f billeterie-proto
```

### Accès à l'application

L'application sera accessible sur : `http://votre-serveur:3377`

### Commandes utiles

- **Arrêter le conteneur :**
```bash
docker compose down
```

- **Redémarrer le conteneur :**
```bash
docker compose restart
```

- **Voir les logs :**
```bash
docker compose logs billeterie-proto
```

## 🛠️ Développement local

### Installation

```bash
npm install
```

### Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production

```bash
npm run build
npm start
```

## 📦 Structure du projet

- `app/` - Pages et routes Next.js
- `components/` - Composants React réutilisables
- `data/` - Données et types TypeScript
- `lib/` - Utilitaires et contextes
- `public/` - Fichiers statiques

## 🔧 Technologies utilisées

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Docker

## 📝 Notes

- L'application utilise un système de simulation en mémoire pour les données
- Les données sont persistées en session uniquement
- Pour la production, il faudra intégrer une base de données réelle
