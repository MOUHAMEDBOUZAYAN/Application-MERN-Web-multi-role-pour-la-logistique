// backend/models/Annonce.js
const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le conducteur est requis'],
    index: true
  },
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  trajet: {
    depart: {
      ville: {
        type: String,
        required: [true, 'La ville de départ est requise'],
        trim: true
      },
      adresse: {
        type: String,
        trim: true
      },
      codePostal: {
        type: String,
        trim: true
      },
      coordonnees: {
        latitude: Number,
        longitude: Number
      }
    },
    destination: {
      ville: {
        type: String,
        required: [true, 'La ville de destination est requise'],
        trim: true
      },
      adresse: {
        type: String,
        trim: true
      },
      codePostal: {
        type: String,
        trim: true
      },
      coordonnees: {
        latitude: Number,
        longitude: Number
      }
    },
    etapesIntermediaires: [{
      ville: {
        type: String,
        required: true,
        trim: true
      },
      adresse: {
        type: String,
        trim: true
      },
      ordre: {
        type: Number,
        required: true
      }
    }],
    distance: {
      type: Number, // en kilomètres
      min: 0
    },
    dureeEstimee: {
      type: Number, // en heures
      min: 0
    }
  },
  planning: {
    dateDepart: {
      type: Date,
      required: [true, 'La date de départ est requise'],
      validate: {
        validator: function(date) {
          return date > new Date();
        },
        message: 'La date de départ doit être dans le futur'
      }
    },
    dateArriveeEstimee: {
      type: Date
    },
    flexibilite: {
      type: String,
      enum: ['exacte', 'flexible_1h', 'flexible_3h', 'flexible_1j'],
      default: 'exacte'
    }
  },
  capacite: {
    dimensionsMax: {
      longueur: {
        type: Number,
        required: [true, 'La longueur maximale est requise'],
        min: 0
      },
      largeur: {
        type: Number,
        required: [true, 'La largeur maximale est requise'],
        min: 0
      },
      hauteur: {
        type: Number,
        required: [true, 'La hauteur maximale est requise'],
        min: 0
      }
    },
    poidsMax: {
      type: Number,
      required: [true, 'Le poids maximal est requis'],
      min: 0
    },
    volumeMax: {
      type: Number, // calculé automatiquement
      min: 0
    },
    nombreColisMax: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  typesMarchandise: [{
    type: String,
    enum: [
      'electromenager',
      'mobilier',
      'vetements',
      'alimentation',
      'electronique',
      'documents',
      'medicaments',
      'fragile',
      'produits_chimiques',
      'materiaux_construction',
      'autre'
    ],
    required: true
  }],
  restrictions: {
    interdits: [{
      type: String,
      enum: [
        'liquides',
        'produits_dangereux',
        'animaux',
        'produits_perissables',
        'objets_de_valeur',
        'armes',
        'drogues'
      ]
    }],
    exigences: [{
      type: String,
      enum: [
        'emballage_special',
        'temperature_controlee',
        'manipulation_delicate',
        'assurance_requise',
        'documents_douane'
      ]
    }]
  },
  tarification: {
    prixParKg: {
      type: Number,
      min: 0
    },
    prixFixe: {
      type: Number,
      min: 0
    },
    typeTarification: {
      type: String,
      enum: ['par_kg', 'prix_fixe', 'negociable'],
      required: [true, 'Le type de tarification est requis']
    },
    deviseAcceptee: {
      type: String,
      enum: ['MAD', 'EUR', 'USD'],
      default: 'MAD'
    }
  },
  statut: {
    type: String,
    enum: ['active', 'inactive', 'complete', 'annulee', 'suspendue'],
    default: 'active'
  },
  vehicule: {
    type: {
      type: String,
      enum: ['camionnette', 'camion', 'fourgon', 'voiture', 'moto'],
      required: [true, 'Le type de véhicule est requis']
    },
    marque: String,
    modele: String,
    immatriculation: String,
    photos: [String]
  },
  conditions: {
    paiementAccepte: [{
      type: String,
      enum: ['especes', 'virement', 'paypal', 'carte_bancaire'],
      required: true
    }],
    assuranceIncluse: {
      type: Boolean,
      default: false
    },
    suiviGPS: {
      type: Boolean,
      default: false
    }
  },
  statistiques: {
    nombreVues: {
      type: Number,
      default: 0
    },
    nombreDemandes: {
      type: Number,
      default: 0
    },
    nombreDemandesAcceptees: {
      type: Number,
      default: 0
    },
    tauxAcceptation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  photos: [{
    url: String,
    description: String,
    ordre: Number
  }],
  documentsRequis: [{
    type: String,
    enum: ['carte_identite', 'permis_conduire', 'carte_grise', 'assurance_vehicule', 'autres'],
    required: false
  }],
  commentaires: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    dateCommentaire: {
      type: Date,
      default: Date.now
    },
    reponse: {
      message: String,
      dateReponse: Date
    }
  }],
  moderationAdmin: {
    verifie: {
      type: Boolean,
      default: false
    },
    dateVerification: Date,
    adminVerificateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisonSuspension: String
  },
  dateCreation: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances de recherche
annonceSchema.index({ 'trajet.depart.ville': 1, 'trajet.destination.ville': 1 });
annonceSchema.index({ 'planning.dateDepart': 1 });
annonceSchema.index({ statut: 1 });
annonceSchema.index({ conducteur: 1 });
annonceSchema.index({ typesMarchandise: 1 });
annonceSchema.index({ createdAt: -1 });
annonceSchema.index({ 'tarification.prixParKg': 1 });

// Index composé pour recherche avancée
annonceSchema.index({
  'trajet.depart.ville': 1,
  'trajet.destination.ville': 1,
  'planning.dateDepart': 1,
  statut: 1
});

// Virtual pour calculer le volume maximal
annonceSchema.virtual('volumeMaxCalcule').get(function() {
  const { longueur, largeur, hauteur } = this.capacite.dimensionsMax;
  return longueur * largeur * hauteur;
});

// Virtual pour vérifier si l'annonce est active
annonceSchema.virtual('estActive').get(function() {
  return this.statut === 'active' && this.planning.dateDepart > new Date();
});

// Virtual pour calculer le temps restant
annonceSchema.virtual('tempsRestant').get(function() {
  const maintenant = new Date();
  const dateDepart = new Date(this.planning.dateDepart);
  return Math.max(0, dateDepart - maintenant);
});

// Middleware pre-save pour calculer le volume et mettre à jour les stats
annonceSchema.pre('save', function(next) {
  if (this.isModified('capacite.dimensionsMax')) {
    const { longueur, largeur, hauteur } = this.capacite.dimensionsMax;
    this.capacite.volumeMax = longueur * largeur * hauteur;
  }
  
  // Calculer le taux d'acceptation
  if (this.statistiques.nombreDemandes > 0) {
    this.statistiques.tauxAcceptation = 
      (this.statistiques.nombreDemandesAcceptees / this.statistiques.nombreDemandes) * 100;
  }
  
  // Mettre à jour la date d'arrivée estimée si pas définie
  if (!this.planning.dateArriveeEstimee && this.trajet.dureeEstimee) {
    this.planning.dateArriveeEstimee = new Date(
      this.planning.dateDepart.getTime() + (this.trajet.dureeEstimee * 60 * 60 * 1000)
    );
  }
  
  next();
});

// Méthodes d'instance
annonceSchema.methods.incrementerVues = async function() {
  // S'assurer que 'statistiques' existe
  if (!this.statistiques) {
    this.statistiques = { nombreVues: 0, nombreDemandes: 0 };
  }
  this.statistiques.nombreVues = (this.statistiques.nombreVues || 0) + 1;
  await this.save({ timestamps: false }); // Éviter de mettre à jour updatedAt
};

annonceSchema.methods.ajouterDemande = function() {
  this.statistiques.nombreDemandes += 1;
  return this.save();
};

annonceSchema.methods.accepterDemande = function() {
  this.statistiques.nombreDemandesAcceptees += 1;
  return this.save();
};

annonceSchema.methods.peutAccepterColis = function(dimensionsColis, poidsColis) {
  const { longueur, largeur, hauteur } = this.capacite.dimensionsMax;
  const { longueur: l, largeur: w, hauteur: h } = dimensionsColis;
  
  return (
    l <= longueur &&
    w <= largeur &&
    h <= hauteur &&
    poidsColis <= this.capacite.poidsMax
  );
};

annonceSchema.methods.ajouterCommentaire = function(utilisateurId, message) {
  this.commentaires.push({
    utilisateur: utilisateurId,
    message: message,
    dateCommentaire: new Date()
  });
  return this.save();
};

annonceSchema.methods.repondreCommentaire = function(commentaireId, reponse) {
  const commentaire = this.commentaires.id(commentaireId);
  if (commentaire) {
    commentaire.reponse = {
      message: reponse,
      dateReponse: new Date()
    };
    return this.save();
  }
  throw new Error('Commentaire non trouvé');
};

// Méthodes statiques
annonceSchema.statics.findByTrajet = function(villeDepart, villeDestination) {
  return this.find({
    'trajet.depart.ville': new RegExp(villeDepart, 'i'),
    'trajet.destination.ville': new RegExp(villeDestination, 'i'),
    statut: 'active'
  });
};

annonceSchema.statics.findDisponibles = function(dateDebut, dateFin) {
  return this.find({
    'planning.dateDepart': {
      $gte: dateDebut || new Date(),
      $lte: dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    },
    statut: 'active'
  });
};

annonceSchema.statics.findByTypesMarchandise = function(types) {
  return this.find({
    typesMarchandise: { $in: types },
    statut: 'active'
  });
};

annonceSchema.statics.statistiquesGlobales = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAnnonces: { $sum: 1 },
        annoncesActives: {
          $sum: { $cond: [{ $eq: ['$statut', 'active'] }, 1, 0] }
        },
        annoncesCompletes: {
          $sum: { $cond: [{ $eq: ['$statut', 'complete'] }, 1, 0] }
        },
        prixMoyenParKg: { $avg: '$tarification.prixParKg' },
        volumeMoyenDisponible: { $avg: '$capacite.volumeMax' },
        tauxAcceptationMoyen: { $avg: '$statistiques.tauxAcceptation' }
      }
    }
  ]);
  
  return stats[0] || {};
};

annonceSchema.statics.topDestinations = async function(limite = 10) {
  return this.aggregate([
    { $match: { statut: 'active' } },
    { $group: { _id: '$trajet.destination.ville', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limite }
  ]);
};

const Annonce = mongoose.model('Annonce', annonceSchema);

module.exports = Annonce;