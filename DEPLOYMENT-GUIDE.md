# 🚀 Guide de Déploiement EcoRide

Guide complet pour déployer l'application EcoRide en production avec Docker.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Déploiement Local](#déploiement-local)
- [Déploiement Production](#déploiement-production)
- [Monitoring](#monitoring)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Système requis

```bash
# Minimum system requirements
CPU: 2 cores
RAM: 4GB
Storage: 20GB
OS: Linux, macOS, Windows (with WSL2)

# Docker requirements
Docker Engine: 20.10+
Docker Compose: 2.0+
```

### Installation Docker

#### Linux (Ubuntu/Debian)

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajout utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installation Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérification
docker --version
docker-compose --version
```

#### Windows

```powershell
# Installer Docker Desktop pour Windows
# Télécharger depuis: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

# Activer WSL2 si nécessaire
wsl --install
wsl --set-default-version 2

# Vérification
docker --version
docker compose --version
```

#### macOS

```bash
# Installer Docker Desktop pour macOS
# Télécharger depuis: https://desktop.docker.com/mac/main/amd64/Docker.dmg

# Ou via Homebrew
brew install --cask docker

# Vérification
docker --version
docker compose --version
```

## 🏠 Déploiement Local

### 1. Clonage et configuration

```bash
# Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# Copier et configurer l'environnement
cp .env.example .env
```

### 2. Configuration des variables

Éditer le fichier `.env` :

```env
# === ENVIRONNEMENT ===
COMPOSE_PROJECT_NAME=ecoride
NODE_ENV=production

# === BASE DE DONNÉES ===
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=ecoride_db
MYSQL_USER=ecoride_user
MYSQL_PASSWORD=your_secure_user_password

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_mongo_password
MONGO_INITDB_DATABASE=ecoride_db

# === SÉCURITÉ ===
JWT_SECRET=your_super_secure_jwt_secret_256_bits
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=12

# === RÉSEAU ===
ALLOWED_ORIGINS=http://localhost,http://localhost:80
```

### 3. Lancement de l'application

```bash
# Build et démarrage
docker compose up --build -d

# Vérification du statut
docker compose ps

# Logs en temps réel
docker compose logs -f
```

### 4. Vérification du déploiement

```bash
# Test de connectivité
curl http://localhost/health
curl http://localhost:3000/api/health

# Accès aux interfaces
# Frontend: http://localhost
# Backend API: http://localhost:3000
# Adminer (MySQL): http://localhost:8080
# Mongo Express: http://localhost:8081
```

## 🌐 Déploiement Production

### 1. Serveur Cloud (AWS/GCP/Azure)

#### Spécifications recommandées

```yaml
# Minimum production
Instance: t3.medium (AWS) / e2-standard-2 (GCP)
CPU: 2 vCPUs
RAM: 4GB
Storage: 20GB SSD
Network: 1 Gbps

# Optimal production
Instance: t3.large (AWS) / e2-standard-4 (GCP)
CPU: 2 vCPUs
RAM: 8GB
Storage: 50GB SSD
Network: 1 Gbps
```

#### Configuration serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl wget git unzip

# Installation Docker (voir section précédente)

# Configuration firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Optimisation système
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Configuration Production

#### Variables d'environnement sécurisées

```bash
# Générer des secrets sécurisés
openssl rand -hex 32  # JWT_SECRET
openssl rand -base64 32  # Mots de passe DB

# Fichier .env production
cat > .env << 'EOF'
COMPOSE_PROJECT_NAME=ecoride-prod
NODE_ENV=production

# Base de données avec mots de passe forts
MYSQL_ROOT_PASSWORD=GENERATED_SECURE_PASSWORD_1
MYSQL_DATABASE=ecoride_db
MYSQL_USER=ecoride_user
MYSQL_PASSWORD=GENERATED_SECURE_PASSWORD_2

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=GENERATED_SECURE_PASSWORD_3
MONGO_INITDB_DATABASE=ecoride_db

# Sécurité
JWT_SECRET=GENERATED_256_BIT_SECRET
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=12

# CORS pour votre domaine
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

# Sécuriser le fichier
chmod 600 .env
```

#### Configuration SSL/TLS avec Traefik

```yaml
# traefik.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik:/etc/traefik:ro
      - traefik-acme:/acme
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"

volumes:
  traefik-acme:
```

### 3. Déploiement automatisé

#### Script de déploiement

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Déploiement EcoRide Production"

# Variables
REPO_URL="https://github.com/2umish8/TP-EcoRide-DWWM.git"
DEPLOY_DIR="/opt/ecoride"
BACKUP_DIR="/opt/ecoride-backups"

# Sauvegarde des données
echo "📦 Sauvegarde des données..."
mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
docker compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases > $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/mysql_backup.sql

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $DEPLOY_DIR
git pull origin main

# Reconstruction des images
echo "🔨 Reconstruction des containers..."
docker compose down
docker compose pull
docker compose build --no-cache
docker compose up -d

# Vérification de la santé
echo "🔍 Vérification de la santé..."
sleep 30
curl -f http://localhost/health || exit 1
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Déploiement terminé avec succès!"
```

#### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/ecoride
          chmod +x deploy.sh
          ./deploy.sh
```

## Monitoring

### 1. Health Checks

```bash
# Script de monitoring
#!/bin/bash
# monitor.sh

check_service() {
    local service=$1
    local url=$2
    
    if curl -f -s $url > /dev/null; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: FAIL"
        # Alertes (email, Slack, etc.)
    fi
}

check_service "Frontend" "http://localhost/health"
check_service "Backend" "http://localhost:3000/api/health"
check_service "MySQL" "http://localhost:8080"
```

### 2. Logs centralisés

```yaml
# logging-stack.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  elasticsearch-data:
```

### 3. Métriques avec Prometheus

```yaml
# monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus-data:
  grafana-data:
```

## Maintenance

### 1. Sauvegardes automatiques

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/ecoride-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR/$DATE

# Sauvegarde MySQL
docker compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases > $BACKUP_DIR/$DATE/mysql_backup.sql

# Sauvegarde MongoDB
docker compose exec mongodb mongodump --out /tmp/mongo_backup
docker compose cp mongodb:/tmp/mongo_backup $BACKUP_DIR/$DATE/

# Compression
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE/
rm -rf $DATE/

# Nettoyage (garder seulement les 30 derniers jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Sauvegarde terminée: $BACKUP_DIR/$DATE.tar.gz"
```

### 2. Mises à jour automatiques

```bash
# Crontab pour les mises à jour automatiques
# crontab -e

# Sauvegarde quotidienne à 2h00
0 2 * * * /opt/ecoride/backup.sh

# Vérification santé toutes les 5 minutes
*/5 * * * * /opt/ecoride/monitor.sh

# Mise à jour sécurité weekly
0 3 * * 0 cd /opt/ecoride && docker compose pull && docker compose up -d
```

### 3. Optimisation des performances

```bash
# Nettoyage Docker périodique
docker system prune -af --volumes

# Optimisation base de données
docker compose exec mysql mysql -u root -p -e "OPTIMIZE TABLE ecoride_db.*;"

# Analyse des logs volumineux
docker compose logs --since="24h" | grep -i error
```

## Troubleshooting

### 1. Problèmes courants

#### Service ne démarre pas

```bash
# Vérifier les logs
docker compose logs service_name

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Redémarrer un service
docker compose restart service_name
```

#### Base de données corrompue

```bash
# Vérifier l'intégrité MySQL
docker compose exec mysql mysqlcheck -u root -p --all-databases

# Réparer si nécessaire
docker compose exec mysql mysqlcheck -u root -p --all-databases --repair

# Restaurer depuis sauvegarde
docker compose exec mysql mysql -u root -p < backup.sql
```

#### Problèmes de connectivité

```bash
# Vérifier les réseaux Docker
docker network ls
docker network inspect ecoride-network

# Tester la connectivité inter-services
docker compose exec frontend ping backend
docker compose exec backend ping mysql
```

### 2. Récupération d'urgence

```bash
# Arrêt d'urgence
docker compose down --remove-orphans

# Restauration complète
./deploy.sh

# Restauration depuis sauvegarde
cd /opt/ecoride-backups
tar -xzf latest_backup.tar.gz
# Restaurer les données...
```

### 3. Contacts et escalation

```yaml
# Procédure d'escalation
Level 1: Redémarrage automatique (healthchecks)
Level 2: Notification équipe DevOps
Level 3: Escalation management
Level 4: Contacte éditeur/support
```

## Optimisations Production

### 1. Performance

```bash
# Configuration nginx pour haute performance
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;

# Cache statique
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Sécurité avancée

```bash
# Fail2ban pour protection SSH
sudo apt install fail2ban

# Configuration firewall avancée
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from specific_ip to any port 22

# Audit de sécurité
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc aquasec/trivy image ecoride-backend
```

### 3. Scalabilité

```yaml
# Docker Swarm pour la scalabilité
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

---

## Ressources additionnelles

- [Documentation Docker](https://docs.docker.com/)
- [Guide sécurité containers](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Monitoring avec Prometheus](https://prometheus.io/docs/)
- [Best practices Node.js](https://github.com/goldbergyoni/nodebestpractices)

---

**Bon déploiement! L'équipe EcoRide vous souhaite une mise en production réussie.**