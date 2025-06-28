// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'expéditeur est requis']
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le destinataire est requis']
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: [true, 'L\'annonce est requise']
  },
  demande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demande',
    default: null
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu du message est requis'],
    trim: true,
    maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
  },
  type: {
    type: String,
    enum: ['texte', 'image', 'document', 'localisation', 'systeme'],
    default: 'texte'
  },
  fichiers: [{
    nom: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    taille: {
      type: Number,
      required: true
    },
    typeFichier: {
      type: String,
      enum: ['image', 'document', 'video', 'audio'],
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  localisation: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    adresse: {
      type: String,
      trim: true
    }
  },
  statut: {
    type: String,
    enum: ['envoye', 'livre', 'lu', 'echec'],
    default: 'envoye'
  },
  conversation: {
    type: String,
    required: true,
    index: true
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateLecture: {
    type: Date
  },
  modifie: {
    type: Boolean,
    default: false
  },
  dateModification: {
    type: Date
  },
  supprime: {
    type: Boolean,
    default: false
  },
  dateSuppression: {
    type: Date
  },
  reponseA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      enum: ['👍', '👎', '❤️', '😂', '😮', '😢', '😡']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  priorite: {
    type: String,
    enum: ['normale', 'haute', 'urgente'],
    default: 'normale'
  },
  messageSysteme: {
    type: {
      type: String,
      enum: [
        'demande_envoyee',
        'demande_acceptee',
        'demande_refusee',
        'colis_enleve',
        'colis_en_transit',
        'colis_livre',
        'evaluation_demandee',
        'conversation_archivee'
      ]
    },
    donnees: mongoose.Schema.Types.Mixed
  },
  metadonnees: {
    appareil: String,
    adresseIP: String,
    navigateur: String,
    geolocalisation: {
      latitude: Number,
      longitude: Number
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ expediteur: 1, destinataire: 1 });
messageSchema.index({ annonce: 1, createdAt: -1 });
messageSchema.index({ demande: 1 });
messageSchema.index({ statut: 1 });
messageSchema.index({ lu: 1, destinataire: 1 });

// Index composé pour les conversations
messageSchema.index({
  conversation: 1,
  createdAt: -1,
  supprime: 1
});

// Virtual pour obtenir l'ID de conversation formaté
messageSchema.virtual('conversationId').get(function() {
  return this.conversation;
});

// Virtual pour vérifier si le message est récent
messageSchema.virtual('estRecent').get(function() {
  const unJourEnMs = 24 * 60 * 60 * 1000;
  return (new Date() - this.createdAt) < unJourEnMs;
});

// Virtual pour compter les réactions
messageSchema.virtual('nombreReactions').get(function() {
  return this.reactions ? this.reactions.length : 0;
});

// Virtual pour vérifier si le message a des fichiers
messageSchema.virtual('aDesFichiers').get(function() {
  return this.fichiers && this.fichiers.length > 0;
});

// Middleware pre-save pour générer l'ID de conversation
messageSchema.pre('save', function(next) {
  // Générer l'ID de conversation si pas défini
  if (!this.conversation) {
    const ids = [this.expediteur, this.destinataire, this.annonce].sort();
    this.conversation = `${ids[0]}_${ids[1]}_${ids[2]}`;
  }
  
  // Mettre à jour la date de modification si le message est modifié
  if (this.isModified('contenu') && !this.isNew) {
    this.modifie = true;
    this.dateModification = new Date();
  }
  
  next();
});

// Middleware post-save pour notifier en temps réel
messageSchema.post('save', function() {
  // Ici vous pouvez émettre via Socket.IO si nécessaire
  // Cette logique sera implémentée dans le contrôleur
});

// Méthodes d'instance
messageSchema.methods.marquerCommeL = function() {
  if (!this.lu) {
    this.lu = true;
    this.dateLecture = new Date();
    this.statut = 'lu';
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.ajouterReaction = function(utilisateurId, emoji) {
  // Vérifier si l'utilisateur a déjà réagi
  const reactionExistante = this.reactions.find(
    r => r.utilisateur.toString() === utilisateurId.toString()
  );
  
  if (reactionExistante) {
    // Modifier la réaction existante
    reactionExistante.emoji = emoji;
    reactionExistante.date = new Date();
  } else {
    // Ajouter une nouvelle réaction
    this.reactions.push({
      utilisateur: utilisateurId,
      emoji: emoji,
      date: new Date()
    });
  }
  
  return this.save();
};

messageSchema.methods.supprimerReaction = function(utilisateurId) {
  this.reactions = this.reactions.filter(
    r => r.utilisateur.toString() !== utilisateurId.toString()
  );
  return this.save();
};

messageSchema.methods.modifier = function(nouveauContenu) {
  this.contenu = nouveauContenu;
  this.modifie = true;
  this.dateModification = new Date();
  return this.save();
};

messageSchema.methods.supprimerPour = function(utilisateurId) {
  // Suppression logique
  this.supprime = true;
  this.dateSuppression = new Date();
  return this.save();
};

messageSchema.methods.estAccessiblePar = function(utilisateurId) {
  const userId = utilisateurId.toString();
  return (
    this.expediteur.toString() === userId ||
    this.destinataire.toString() === userId
  ) && !this.supprime;
};

messageSchema.methods.ajouterMention = function(utilisateurId) {
  if (!this.mentions.includes(utilisateurId)) {
    this.mentions.push(utilisateurId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthodes statiques
messageSchema.statics.genererConversationId = function(expediteurId, destinataireId, annonceId) {
  const ids = [expediteurId, destinataireId, annonceId].sort();
  return `${ids[0]}_${ids[1]}_${ids[2]}`;
};

messageSchema.statics.findConversation = function(expediteurId, destinataireId, annonceId, options = {}) {
  const conversationId = this.genererConversationId(expediteurId, destinataireId, annonceId);
  
  const query = {
    conversation: conversationId,
    supprime: false
  };
  
  const {
    limite = 50,
    page = 1,
    depuisDate = null,
    avantDate = null
  } = options;
  
  if (depuisDate) query.createdAt = { $gte: depuisDate };
  if (avantDate) query.createdAt = { ...query.createdAt, $lte: avantDate };
  
  return this.find(query)
    .populate('expediteur destinataire', 'nom prenom photo')
    .populate('reponseA', 'contenu expediteur createdAt')
    .sort({ createdAt: -1 })
    .limit(limite)
    .skip((page - 1) * limite);
};

messageSchema.statics.findConversationsUtilisateur = function(utilisateurId, options = {}) {
  const { limite = 20, page = 1 } = options;
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { expediteur: mongoose.Types.ObjectId(utilisateurId) },
          { destinataire: mongoose.Types.ObjectId(utilisateurId) }
        ],
        supprime: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversation',
        dernierMessage: { $first: '$ROOT' },
        nombreMessagesNonLus: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$destinataire', mongoose.Types.ObjectId(utilisateurId)] },
                  { $eq: ['$lu', false] }
                ]
              },
              1,
              0
            ]
          }
        },
        nombreMessages: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'dernierMessage.expediteur',
        foreignField: '_id',
        as: 'expediteurInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'dernierMessage.destinataire',
        foreignField: '_id',
        as: 'destinataireInfo'
      }
    },
    {
      $lookup: {
        from: 'annonces',
        localField: 'dernierMessage.annonce',
        foreignField: '_id',
        as: 'annonceInfo'
      }
    },
    {
      $sort: { 'dernierMessage.createdAt': -1 }
    },
    {
      $skip: (page - 1) * limite
    },
    {
      $limit: limite
    }
  ]);
};

messageSchema.statics.marquerConversationCommeLue = function(conversationId, utilisateurId) {
  return this.updateMany(
    {
      conversation: conversationId,
      destinataire: utilisateurId,
      lu: false
    },
    {
      $set: {
        lu: true,
        dateLecture: new Date(),
        statut: 'lu'
      }
    }
  );
};

messageSchema.statics.compterMessagesNonLus = function(utilisateurId) {
  return this.countDocuments({
    destinataire: utilisateurId,
    lu: false,
    supprime: false
  });
};

messageSchema.statics.archiverConversation = function(conversationId) {
  // Créer un message système d'archivage
  return this.create({
    conversation: conversationId,
    contenu: 'Conversation archivée',
    type: 'systeme',
    messageSysteme: {
      type: 'conversation_archivee',
      donnees: { dateArchivage: new Date() }
    },
    statut: 'livre'
  });
};

messageSchema.statics.rechercherMessages = function(utilisateurId, termeRecherche, options = {}) {
  const {
    annonceId = null,
    depuisDate = null,
    avantDate = null,
    limite = 50
  } = options;
  
  const query = {
    $or: [
      { expediteur: utilisateurId },
      { destinataire: utilisateurId }
    ],
    contenu: { $regex: termeRecherche, $options: 'i' },
    supprime: false
  };
  
  if (annonceId) query.annonce = annonceId;
  if (depuisDate) query.createdAt = { $gte: depuisDate };
  if (avantDate) query.createdAt = { ...query.createdAt, $lte: avantDate };
  
  return this.find(query)
    .populate('expediteur destinataire', 'nom prenom photo')
    .populate('annonce', 'titre trajet')
    .sort({ createdAt: -1 })
    .limit(limite);
};

messageSchema.statics.statistiquesMessages = async function(utilisateurId, periode = 30) {
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() - periode);
  
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { expediteur: mongoose.Types.ObjectId(utilisateurId) },
          { destinataire: mongoose.Types.ObjectId(utilisateurId) }
        ],
        createdAt: { $gte: dateDebut },
        supprime: false
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        messagesEnvoyes: {
          $sum: { $cond: [{ $eq: ['$expediteur', mongoose.Types.ObjectId(utilisateurId)] }, 1, 0] }
        },
        messagesRecus: {
          $sum: { $cond: [{ $eq: ['$destinataire', mongoose.Types.ObjectId(utilisateurId)] }, 1, 0] }
        },
        conversationsActives: { $addToSet: '$conversation' },
        messagesAvecFichiers: {
          $sum: { $cond: [{ $gt: [{ $size: '$fichiers' }, 0] }, 1, 0] }
        },
        tempsResponseMoyen: {
          $avg: {
            $subtract: ['$dateLecture', '$createdAt']
          }
        }
      }
    },
    {
      $addFields: {
        nombreConversationsActives: { $size: '$conversationsActives' }
      }
    }
  ]);
  
  return stats[0] || {};
};

// Middleware pour nettoyer les anciens messages (à exécuter périodiquement)
messageSchema.statics.nettoyerAnciens = function(jourConservation = 365) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - jourConservation);
  
  return this.deleteMany({
    createdAt: { $lt: dateLimit },
    supprime: true
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;