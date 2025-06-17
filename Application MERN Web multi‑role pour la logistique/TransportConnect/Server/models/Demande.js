// backend/models/Demande.js
const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'expéditeur est requis']
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: [true, 'L\'annonce est requise']
  },
  conducteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le conducteur est requis']
  },
  colis: {
    description: {
      type: String,
      required: [true, 'La description du colis est requise'],
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    dimensions: {
      longueur: {
        type: Number,
        required: [true, 'La longueur est requise'],
        min: [0.1, 'La longueur doit être positive']
      },
      largeur: {
        type: Number,
        required: [true, 'La largeur est requise'],
        min: [0.1, 'La largeur doit être positive']
      },
      hauteur: {
        type: Number,
        required: [true, 'La hauteur est requise'],
        min: [0.1, 'La hauteur doit être positive']
      }
    },
    poids: {
      type: Number,
      required: [true, 'Le poids est requis'],
      min: [0.1, 'Le poids doit être positif']
    },
    volume: {
      type: Number, // calculé automatiquement
      min: 0
    },
    type: {
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
      required: [true, 'Le type de marchandise est requis']
    },
    valeurDeclaree: {
      type: Number,
      min: 0,
      default: 0
    },
    fragile: {
      type: Boolean,
      default: false
    },
    photos: [{
      url: String,
      description: String
    }]
  },
  adresses: {
    enlevement: {
      nom: {
        type: String,
        required: [true, 'Le nom pour l\'enlèvement est requis']
      },
      telephone: {
        type: String,
        required: [true, 'Le téléphone pour l\'enlèvement est requis']
      },
      adresse: {
        type: String,
        required: [true, 'L\'adresse d\'enlèvement est requise']
      },
      ville: {
        type: String,
        required: [true, 'La ville d\'enlèvement est requise']
      },
      codePostal: {
        type: String,
        required: [true, 'Le code postal d\'enlèvement est requis']
      },
      instructions: {
        type: String,
        maxlength: [200, 'Les instructions ne peuvent pas dépasser 200 caractères']
      },
      creneauHoraire: {
        debut: Date,
        fin: Date
      }
    },
    livraison: {
      nom: {
        type: String,
        required: [true, 'Le nom pour la livraison est requis']
      },
      telephone: {
        type: String,
        required: [true, 'Le téléphone pour la livraison est requis']
      },
      adresse: {
        type: String,
        required: [true, 'L\'adresse de livraison est requise']
      },
      ville: {
        type: String,
        required: [true, 'La ville de livraison est requise']
      },
      codePostal: {
        type: String,
        required: [true, 'Le code postal de livraison est requis']
      },
      instructions: {
        type: String,
        maxlength: [200, 'Les instructions ne peuvent pas dépasser 200 caractères']
      },
      creneauHoraire: {
        debut: Date,
        fin: Date
      }
    }
  },
  tarification: {
    montantPropose: {
      type: Number,
      required: [true, 'Le montant proposé est requis'],
      min: 0
    },
    montantAccepte: {
      type: Number,
      min: 0
    },
    devise: {
      type: String,
      enum: ['MAD', 'EUR', 'USD'],
      default: 'MAD'
    },
    methodePaiement: {
      type: String,
      enum: ['especes', 'virement', 'paypal', 'carte_bancaire'],
      required: [true, 'La méthode de paiement est requise']
    },
    paiementEffectue: {
      type: Boolean,
      default: false
    },
    datePaiement: Date
  },
  statut: {
    type: String,
    enum: [
      'en_attente',
      'acceptee',
      'refusee',
      'en_cours',
      'enlevee',
      'en_transit',
      'livree',
      'annulee',
      'litige'
    ],
    default: 'en_attente'
  },
  historique: [{
    statut: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    commentaire: String,
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  suivi: {
    numeroSuivi: {
      type: String,
      unique: true,
      sparse: true
    },
    positionActuelle: {
      latitude: Number,
      longitude: Number,
      adresse: String,
      dateMAJ: Date
    },
    etapes: [{
      lieu: String,
      date: Date,
      statut: String,
      commentaire: String
    }]
  },
  dates: {
    dateCreation: {
      type: Date,
      default: Date.now
    },
    dateReponse: Date,
    dateEnlevement: Date,
    dateLivraisonPrevue: Date,
    dateLivraisonReelle: Date
  },
  conditions: {
    assuranceRequise: {
      type: Boolean,
      default: false
    },
    signatureRequise: {
      type: Boolean,
      default: true
    },
    photoLivraison: {
      type: Boolean,
      default: false
    },
    conditionsSpeciales: [{
      type: String,
      maxlength: 100
    }]
  },
  documents: [{
    type: {
      type: String,
      enum: ['bon_enlevement', 'bon_livraison', 'facture', 'photo_colis', 'signature', 'autre']
    },
    url: String,
    nom: String,
    dateUpload: {
      type: Date,
      default: Date.now
    },
    uploadePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  communications: [{
    expediteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    lu: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['message', 'notification', 'alerte'],
      default: 'message'
    }
  }],
  evaluation: {
    expediteurVersConduteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation'
    },
    conducteurVersExpediteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation'
    }
  },
  litige: {
    signale: {
      type: Boolean,
      default: false
    },
    dateSignalement: Date,
    motif: String,
    signalePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolu: {
      type: Boolean,
      default: false
    },
    dateResolution: Date,
    resolution: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
demandeSchema.index({ expediteur: 1, statut: 1 });
demandeSchema.index({ conducteur: 1, statut: 1 });
demandeSchema.index({ annonce: 1 });
demandeSchema.index({ statut: 1, createdAt: -1 });
demandeSchema.index({ 'suivi.numeroSuivi': 1 });
demandeSchema.index({ 'dates.dateCreation': -1 });

// Virtual pour calculer le volume du colis
demandeSchema.virtual('volumeColis').get(function() {
  if (this.colis && this.colis.dimensions) {
    const { longueur, largeur, hauteur } = this.colis.dimensions;
    return longueur * largeur * hauteur;
  }
  return 0;
});

// Virtual pour vérifier si la demande est active
demandeSchema.virtual('estActive').get(function() {
  const statutsActifs = ['en_attente', 'acceptee', 'en_cours', 'enlevee', 'en_transit'];
  return statutsActifs.includes(this.statut);
});

// Virtual pour calculer la durée depuis la création
demandeSchema.virtual('dureeDepuisCreation').get(function() {
  return new Date() - this.dates.dateCreation;
});

// Virtual pour vérifier si la demande est en retard
demandeSchema.virtual('enRetard').get(function() {
  if (this.dates.dateLivraisonPrevue && !this.dates.dateLivraisonReelle) {
    return new Date() > this.dates.dateLivraisonPrevue;
  }
  return false;
});

// Middleware pre-save
demandeSchema.pre('save', function(next) {
  // Calculer le volume du colis
  if (this.colis && this.colis.dimensions) {
    const { longueur, largeur, hauteur } = this.colis.dimensions;
    this.colis.volume = longueur * largeur * hauteur;
  }
  
  // Générer un numéro de suivi si la demande est acceptée et n'en a pas
  if (this.statut === 'acceptee' && !this.suivi.numeroSuivi) {
    this.suivi.numeroSuivi = this.genererNumeroSuivi();
  }
  
  // Ajouter à l'historique si le statut change
  if (this.isModified('statut')) {
    this.historique.push({
      statut: this.statut,
      date: new Date(),
      commentaire: `Statut changé vers: ${this.statut}`
    });
  }
  
  next();
});

// Méthodes d'instance
demandeSchema.methods.genererNumeroSuivi = function() {
  const prefix = 'TC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

demandeSchema.methods.changerStatut = function(nouveauStatut, commentaire, auteur) {
  this.statut = nouveauStatut;
  
  // Mettre à jour les dates selon le statut
  switch (nouveauStatut) {
    case 'acceptee':
      this.dates.dateReponse = new Date();
      break;
    case 'enlevee':
      this.dates.dateEnlevement = new Date();
      break;
    case 'livree':
      this.dates.dateLivraisonReelle = new Date();
      break;
  }
  
  // Ajouter à l'historique
  this.historique.push({
    statut: nouveauStatut,
    date: new Date(),
    commentaire: commentaire || `Statut changé vers: ${nouveauStatut}`,
    auteur: auteur
  });
  
  return this.save();
};

demandeSchema.methods.ajouterCommunication = function(expediteurId, message, type = 'message') {
  this.communications.push({
    expediteur: expediteurId,
    message: message,
    date: new Date(),
    type: type,
    lu: false
  });
  return this.save();
};

demandeSchema.methods.marquerCommunicationLue = function(communicationId) {
  const communication = this.communications.id(communicationId);
  if (communication) {
    communication.lu = true;
    return this.save();
  }
  throw new Error('Communication non trouvée');
};

demandeSchema.methods.ajouterDocument = function(typeDoc, url, nom, uploadePar) {
  this.documents.push({
    type: typeDoc,
    url: url,
    nom: nom,
    dateUpload: new Date(),
    uploadePar: uploadePar
  });
  return this.save();
};

demandeSchema.methods.mettreAJourPosition = function(latitude, longitude, adresse) {
  this.suivi.positionActuelle = {
    latitude: latitude,
    longitude: longitude,
    adresse: adresse,
    dateMAJ: new Date()
  };
  return this.save();
};

demandeSchema.methods.ajouterEtapeSuivi = function(lieu, statut, commentaire) {
  this.suivi.etapes.push({
    lieu: lieu,
    date: new Date(),
    statut: statut,
    commentaire: commentaire
  });
  return this.save();
};

demandeSchema.methods.signalerLitige = function(motif, signalePar) {
  this.litige = {
    signale: true,
    dateSignalement: new Date(),
    motif: motif,
    signalePar: signalePar,
    resolu: false
  };
  this.statut = 'litige';
  return this.save();
};

demandeSchema.methods.resoudreLitige = function(resolution) {
  if (this.litige.signale) {
    this.litige.resolu = true;
    this.litige.dateResolution = new Date();
    this.litige.resolution = resolution;
    return this.save();
  }
  throw new Error('Aucun litige à résoudre');
};

demandeSchema.methods.calculerTarif = function(tarificationAnnonce) {
  if (tarificationAnnonce.typeTarification === 'par_kg') {
    return this.colis.poids * tarificationAnnonce.prixParKg;
  } else if (tarificationAnnonce.typeTarification === 'prix_fixe') {
    return tarificationAnnonce.prixFixe;
  }
  return this.tarification.montantPropose;
};

demandeSchema.methods.peutEtreAcceptee = function() {
  return this.statut === 'en_attente';
};

demandeSchema.methods.peutEtreAnnulee = function() {
  const statutsAnnulables = ['en_attente', 'acceptee'];
  return statutsAnnulables.includes(this.statut);
};

// Méthodes statiques
demandeSchema.statics.findByExpediteur = function(expediteurId, statut = null) {
  const query = { expediteur: expediteurId };
  if (statut) query.statut = statut;
  return this.find(query).populate('annonce conducteur');
};

demandeSchema.statics.findByConducteur = function(conducteurId, statut = null) {
  const query = { conducteur: conducteurId };
  if (statut) query.statut = statut;
  return this.find(query).populate('annonce expediteur');
};

demandeSchema.statics.findByAnnonce = function(annonceId, statut = null) {
  const query = { annonce: annonceId };
  if (statut) query.statut = statut;
  return this.find(query).populate('expediteur');
};

demandeSchema.statics.findByNumeroSuivi = function(numeroSuivi) {
  return this.findOne({ 'suivi.numeroSuivi': numeroSuivi })
    .populate('expediteur conducteur annonce');
};

demandeSchema.statics.findEnRetard = function() {
  return this.find({
    'dates.dateLivraisonPrevue': { $lt: new Date() },
    'dates.dateLivraisonReelle': null,
    statut: { $in: ['acceptee', 'en_cours', 'enlevee', 'en_transit'] }
  });
};

demandeSchema.statics.statistiquesGlobales = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalDemandes: { $sum: 1 },
        demandesEnAttente: {
          $sum: { $cond: [{ $eq: ['$statut', 'en_attente'] }, 1, 0] }
        },
        demandesAcceptees: {
          $sum: { $cond: [{ $eq: ['$statut', 'acceptee'] }, 1, 0] }
        },
        demandesLivrees: {
          $sum: { $cond: [{ $eq: ['$statut', 'livree'] }, 1, 0] }
        },
        demandesRefusees: {
          $sum: { $cond: [{ $eq: ['$statut', 'refusee'] }, 1, 0] }
        },
        litiges: {
          $sum: { $cond: ['$litige.signale', 1, 0] }
        },
        montantTotalTransporte: { $sum: '$tarification.montantAccepte' },
        poidsTotal: { $sum: '$colis.poids' },
        volumeTotal: { $sum: '$colis.volume' },
        tauxAcceptation: {
          $multiply: [
            { $divide: [
              { $sum: { $cond: [{ $eq: ['$statut', 'acceptee'] }, 1, 0] } },
              { $sum: { $cond: [{ $ne: ['$statut', 'en_attente'] }, 1, 0] } }
            ]},
            100
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

demandeSchema.statics.statistiquesParPeriode = async function(dateDebut, dateFin) {
  return this.aggregate([
    {
      $match: {
        'dates.dateCreation': {
          $gte: dateDebut,
          $lte: dateFin
        }
      }
    },
    {
      $group: {
        _id: {
          annee: { $year: '$dates.dateCreation' },
          mois: { $month: '$dates.dateCreation' },
          jour: { $dayOfMonth: '$dates.dateCreation' }
        },
        nombreDemandes: { $sum: 1 },
        montantTotal: { $sum: '$tarification.montantAccepte' },
        poidsTotal: { $sum: '$colis.poids' }
      }
    },
    { $sort: { '_id.annee': 1, '_id.mois': 1, '_id.jour': 1 } }
  ]);
};

demandeSchema.statics.topExpediteurs = async function(limite = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$expediteur',
        nombreDemandes: { $sum: 1 },
        montantTotal: { $sum: '$tarification.montantAccepte' }
      }
    },
    { $sort: { nombreDemandes: -1 } },
    { $limit: limite },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'expediteur'
      }
    },
    { $unwind: '$expediteur' }
  ]);
};

demandeSchema.statics.demandesParStatut = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$statut',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const Demande = mongoose.model('Demande', demandeSchema);

module.exports = Demande;