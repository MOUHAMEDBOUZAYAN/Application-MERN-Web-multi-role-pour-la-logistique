FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose le port Vite (par défaut 5173)
EXPOSE 5173

# Lancer le serveur en mode développement
CMD ["npm", "run", "dev"]
