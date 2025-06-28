# Étape 1 : Image de base
FROM node:18

# Étape 2 : Créer un dossier de travail
WORKDIR /app

# Étape 3 : Copier les fichiers
COPY package*.json ./
RUN npm install


# Copier le reste du projet
COPY . .

# Port exposé
EXPOSE 5000

# Commande de démarrage
CMD ["node", "index.js"]
