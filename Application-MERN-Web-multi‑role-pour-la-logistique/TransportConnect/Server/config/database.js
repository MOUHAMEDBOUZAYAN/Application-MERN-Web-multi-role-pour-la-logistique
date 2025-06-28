// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`
    ✅ MongoDB Connecté
    🏠 Host: ${conn.connection.host}
    📊 Base: ${conn.connection.name}
    🔌 Port: ${conn.connection.port}
    `);

    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose déconnecté de MongoDB');
    });

    // Fermeture propre lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 Connexion MongoDB fermée proprement');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erreur lors de la fermeture de MongoDB:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;