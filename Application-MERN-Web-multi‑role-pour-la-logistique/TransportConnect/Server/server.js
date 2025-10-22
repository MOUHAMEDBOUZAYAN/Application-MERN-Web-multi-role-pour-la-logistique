// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const annonceRoutes = require('./routes/annonces');
const demandeRoutes = require('./routes/demandes');
const evaluationRoutes = require('./routes/evaluations');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const app = express();
const server = createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware CORS
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware pour le parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Serveur TransportConnect en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test DB route for diagnostics
app.get('/api/test-db', async (req, res) => {
  try {
    const Annonce = require('./models/Annonce');
    const count = await Annonce.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Erreur de validation MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }
  
  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} déjà existant`
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Gestion des connexions Socket.IO pour le chat
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);
  
  // Rejoindre une room spécifique à une annonce
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    activeUsers.set(socket.id, { userId, roomId });
    console.log(`Utilisateur ${userId} a rejoint la room ${roomId}`);
  });
  
  // Envoyer un message
  socket.on('send-message', async (data) => {
    try {
      const { roomId, senderId, receiverId, message, annonceId } = data;
      
      // Ici, vous pouvez sauvegarder le message en base de données
      // const newMessage = await Message.create({ ... });
      
      // Diffuser le message dans la room
      socket.to(roomId).emit('receive-message', {
        id: Date.now(), // Remplacer par l'ID de la base de données
        senderId,
        receiverId,
        message,
        annonceId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      socket.emit('message-error', 'Erreur lors de l\'envoi du message');
    }
  });
  
  // Déconnexion
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`Utilisateur ${user.userId} déconnecté de la room ${user.roomId}`);
      activeUsers.delete(socket.id);
    }
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  🚀 Serveur TransportConnect démarré !
  📱 Port: ${PORT}
  🌍 Environnement: ${process.env.NODE_ENV}
  🔗 URL: http://localhost:${PORT}
  💾 Base de données: ${process.env.MONGODB_URI ? 'Configurée' : 'Non configurée'}
  `);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Exception non gérée:', err);
  process.exit(1);
});

module.exports = { app, server, io };