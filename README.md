# Prototype Billeterie Nationale

Application de gestion de billeterie nationale pour le Ministère des Transports.

## 🚀 Déploiement sur serveur OVH

### Prérequis
- Docker et Docker Compose installés
- Accès SSH au serveur
- Port 3377 ouvert dans le firewall

### Instructions de déploiement

1. **Ouvrir le port 3377 dans le firewall :**
```bash
sudo ufw allow 3377/tcp
sudo ufw reload
```

2. **Aller dans le dossier du projet :**
```bash
cd /opt/prototype_billeterie
```

3. **Cloner le dépôt (première fois) :**
```bash
git clone https://github.com/shadjava2/prototype_billeterie.git .
```

4. **Mettre à jour le code :**
```bash
git pull origin main
```

5. **Reconstruire et lancer le conteneur :**
```bash
docker compose up -d --build
```

6. **Vérifier que le conteneur tourne :**
```bash
docker compose ps
```

7. **Voir les logs en temps réel :**
```bash
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
