// backend/models/Evaluation.js
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  evaluateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'évaluateur est requis']
  },
  evalue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La personne évaluée est requise']
  },
  demande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demande',
    required: [true, 'La demande est requise']
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: [true, 'L\'annonce est requise']
  },
  note: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) || (value * 2) % 1 === 0; // Permet les demi-points
      },
      message: 'La note doit être un nombre entier ou avoir des demi-points'
    }
  },
  criteres: {
    ponctualite: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'La note de ponctualité est requise']
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'La note de communication est requise']
    },
    professionnalisme: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'La note de professionnalisme est requise']
    },
    soinMarchandise: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        // Requis seulement pour les évaluations de conducteur
        return this.typeEvaluation === 'expediteur_vers_conducteur';
      }
    },
    qualiteEmballage: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        // Requis seulement pour les évaluations d'expéditeur
        return this.typeEvaluation === 'conducteur_vers_expediteur';
      }
    },
    respectConsignes: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'La note de respect des consignes est requise']
    }
  },
  commentaire: {
    type: String,
    trim: true,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères'],
    required: [true, 'Un commentaire est requis']
  },
  typeEvaluation: {
    type: String,
    enum: ['expediteur_vers_conducteur', 'conducteur_vers_expediteur'],
    required: [true, 'Le type d\'évaluation est requis']
  },
  avantages: [{
    type: String,
    enum: [
      'ponctuel',
      'communicatif',
      'professionnel',
      'soigneux',
      'flexible',
      'aimable',
      'efficace',
      'fiable',
      'prix_correct',
      'vehicule_propre',
      'emballage_soigne',
      'description_exacte',
      'disponible'
    ]
  }],
  inconvenients: [{
    type: String,
    enum: [
      'retard',
      'mauvaise_communication',
      'non_professionnel',
      'marchandise_abimee',
      'vehicule_sale',
      'prix_eleve',
      'peu_flexible',
      'emballage_insuffisant',
      'description_inexacte',
      'indisponible'
    ]
  }],
  recommande: {
    type: Boolean,
    required: [true, 'La recommandation est requise']
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 100
    },
    type: {
      type: String,
      enum: ['colis_recu', 'colis_endommage', 'bon_livraison', 'autre'],
      default: 'autre'
    }
  }],
  reponse: {
    commentaire: {
      type: String,
      trim: true,
      maxlength: [300, 'La réponse ne peut pas dépasser 300 caractères']
    },
    dateReponse: {
      type: Date
    },
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  signalement: {
    signale: {
      type: Boolean,
      default: false
    },
    motif: {
      type: String,
      enum: [
        'commentaire_inapproprie',
        'note_injustifiee',
        'faux_commentaire',
        'information_personnelle',
        'diffamation',
        'autre'
      ]
    },
    dateSignalement: Date,
    signalePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    traite: {
      type: Boolean,
      default: false
    },
    dateTraitement: Date,
    decision: {
      type: String,
      enum: ['maintenue', 'modifiee', 'supprimee']
    }
  },
  moderationAdmin: {
    approuvee: {
      type: Boolean,
      default: true
    },
    dateModeration: Date,
    moderateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisonRejet: String
  },
  statistiques: {
    nombreVues: {
      type: Number,
      default: 0
    },
    nombreLikes: {
      type: Number,
      default: 0
    },
    nombreDislikes: {
      type: Number,
      default: 0
    },
    utile: [{
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
evaluationSchema.index({ evaluateur: 1, evalue: 1, demande: 1 }, { unique: true });
evaluationSchema.index({ evalue: 1, note: -1 });
evaluationSchema.index({ typeEvaluation: 1 });
evaluationSchema.index({ createdAt: -1 });
evaluationSchema.index({ 'moderationAdmin.approuvee': 1 });

// Virtual pour calculer la note moyenne des critères
evaluationSchema.virtual('noteMoyenneCriteres').get(function() {
  const criteres = this.criteres;
  const notesCriteres = [];
  
  // Ajouter toutes les notes définies
  if (criteres.ponctualite) notesCriteres.push(criteres.ponctualite);
  if (criteres.communication) notesCriteres.push(criteres.communication);
  if (criteres.professionnalisme) notesCriteres.push(criteres.professionnalisme);
  if (criteres.soinMarchandise) notesCriteres.push(criteres.soinMarchandise);
  if (criteres.qualiteEmballage) notesCriteres.push(criteres.qualiteEmballage);
  if (criteres.respectConsignes) notesCriteres.push(criteres.respectConsignes);
  
  if (notesCriteres.length === 0) return 0;
  
  const somme = notesCriteres.reduce((acc, note) => acc + note, 0);
  return Math.round((somme / notesCriteres.length) * 2) / 2; // Arrondir aux demi-points
});

// Virtual pour vérifier si l'évaluation est récente
evaluationSchema.virtual('estRecente').get(function() {
  const unMoisEnMs = 30 * 24 * 60 * 60 * 1000;
  return (new Date() - this.createdAt) < unMoisEnMs;
});

// Virtual pour calculer le score d'utilité
evaluationSchema.virtual('scoreUtilite').get(function() {
  const likes = this.statistiques.nombreLikes || 0;
  const dislikes = this.statistiques.nombreDislikes || 0;
  const total = likes + dislikes;
  
  if (total === 0) return 0;
  return Math.round((likes / total) * 100);
});

// Middleware pre-save pour calculer la note globale
evaluationSchema.pre('save', function(next) {
  // Calculer la note globale basée sur les critères
  if (this.isModified('criteres')) {
    this.note = this.noteMoyenneCriteres;
  }
  
  next();
});

// Middleware post-save pour mettre à jour les statistiques de l'utilisateur évalué
evaluationSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const Evaluation = mongoose.model('Evaluation');
    
    // Calculer les nouvelles statistiques pour l'utilisateur évalué
    const stats = await Evaluation.aggregate([
      {
        $match: {
          evalue: this.evalue,
          'moderationAdmin.approuvee': true
        }
      },
      {
        $group: {
          _id: null,
          noteMoyenne: { $avg: '$note' },
          nombreEvaluations: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await User.findByIdAndUpdate(this.evalue, {
        'statistiques.noteMoyenne': Math.round(stats[0].noteMoyenne * 2) / 2,
        'statistiques.nombreEvaluations': stats[0].nombreEvaluations
      });
    }
  } catch (error) {
    console.error('Erreur mise à jour statistiques utilisateur:', error);
  }
});

// Méthodes d'instance
evaluationSchema.methods.ajouterReponse = function(commentaire, auteurId) {
  this.reponse = {
    commentaire: commentaire,
    dateReponse: new Date(),
    auteur: auteurId
  };
  return this.save();
};

evaluationSchema.methods.marquerUtile = function(utilisateurId) {
  const dejaMarque = this.statistiques.utile.some(
    u => u.utilisateur.toString() === utilisateurId.toString()
  );
  
  if (!dejaMarque) {
    this.statistiques.utile.push({
      utilisateur: utilisateurId,
      date: new Date()
    });
    this.statistiques.nombreLikes += 1;
    return this.save();
  }
  
  throw new Error('Déjà marqué comme utile');
};

evaluationSchema.methods.marquerInutile = function() {
  this.statistiques.nombreDislikes += 1;
  return this.save();
};

evaluationSchema.methods.signaler = function(motif, signalePar) {
  this.signalement = {
    signale: true,
    motif: motif,
    dateSignalement: new Date(),
    signalePar: signalePar,
    traite: false
  };
  return this.save();
};

evaluationSchema.methods.traiterSignalement = function(decision, moderateur) {
  if (!this.signalement.signale) {
    throw new Error('Aucun signalement à traiter');
  }
  
  this.signalement.traite = true;
  this.signalement.dateTraitement = new Date();
  this.signalement.decision = decision;
  
  // Appliquer la décision
  switch (decision) {
    case 'supprimee':
      this.moderationAdmin.approuvee = false;
      this.moderationAdmin.raisonRejet = 'Supprimée suite à signalement';
      break;
    case 'modifiee':
      // La modification sera faite manuellement
      break;
    case 'maintenue':
      // Rien à faire
      break;
  }
  
  this.moderationAdmin.dateModeration = new Date();
  this.moderationAdmin.moderateur = moderateur;
  
  return this.save();
};

evaluationSchema.methods.incrementerVues = function() {
  this.statistiques.nombreVues += 1;
  return this.save();
};

// Méthodes statiques
evaluationSchema.statics.findByEvalue = function(evalueId, approuveeSeulement = true) {
  const query = { evalue: evalueId };
  if (approuveeSeulement) {
    query['moderationAdmin.approuvee'] = true;
  }
  return this.find(query)
    .populate('evaluateur', 'nom prenom photo badges')
    .sort({ createdAt: -1 });
};

evaluationSchema.statics.findByEvaluateur = function(evaluateurId) {
  return this.find({ evaluateur: evaluateurId })
    .populate('evalue', 'nom prenom photo')
    .sort({ createdAt: -1 });
};

evaluationSchema.statics.statistiquesUtilisateur = async function(utilisateurId) {
  const stats = await this.aggregate([
    {
      $match: {
        evalue: mongoose.Types.ObjectId(utilisateurId),
        'moderationAdmin.approuvee': true
      }
    },
    {
      $group: {
        _id: null,
        noteMoyenne: { $avg: '$note' },
        nombreEvaluations: { $sum: 1 },
        repartitionNotes: {
          $push: '$note'
        },
        moyennePonctualite: { $avg: '$criteres.ponctualite' },
        moyenneCommunication: { $avg: '$criteres.communication' },
        moyenneProfessionnalisme: { $avg: '$criteres.professionnalisme' },
        moyenneSoinMarchandise: { $avg: '$criteres.soinMarchandise' },
        moyenneQualiteEmballage: { $avg: '$criteres.qualiteEmballage' },
        moyenneRespectConsignes: { $avg: '$criteres.respectConsignes' },
        tauxRecommandation: {
          $multiply: [
            { $divide: [
              { $sum: { $cond: ['$recommande', 1, 0] } },
              { $sum: 1 }
            ]},
            100
          ]
        }
      }
    },
    {
      $addFields: {
        repartition5etoiles: {
          $size: { $filter: { input: '$repartitionNotes', cond: { $eq: ['$$this', 5] } } }
        },
        repartition4etoiles: {
          $size: { $filter: { input: '$repartitionNotes', cond: { $eq: ['$$this', 4] } } }
        },
        repartition3etoiles: {
          $size: { $filter: { input: '$repartitionNotes', cond: { $eq: ['$$this', 3] } } }
        },
        repartition2etoiles: {
          $size: { $filter: { input: '$repartitionNotes', cond: { $eq: ['$$this', 2] } } }
        },
        repartition1etoile: {
          $size: { $filter: { input: '$repartitionNotes', cond: { $eq: ['$$this', 1] } } }
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

evaluationSchema.statics.topUtilisateurs = async function(limite = 10, typeEvaluation = null) {
  const matchQuery = { 'moderationAdmin.approuvee': true };
  if (typeEvaluation) {
    matchQuery.typeEvaluation = typeEvaluation;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$evalue',
        noteMoyenne: { $avg: '$note' },
        nombreEvaluations: { $sum: 1 }
      }
    },
    { $match: { nombreEvaluations: { $gte: 3 } } }, // Au moins 3 évaluations
    { $sort: { noteMoyenne: -1, nombreEvaluations: -1 } },
    { $limit: limite },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'utilisateur'
      }
    },
    { $unwind: '$utilisateur' }
  ]);
};

evaluationSchema.statics.statistiquesGlobales = async function() {
  const stats = await this.aggregate([
    {
      $match: { 'moderationAdmin.approuvee': true }
    },
    {
      $group: {
        _id: null,
        totalEvaluations: { $sum: 1 },
        noteMoyenneGlobale: { $avg: '$note' },
        evaluationsExpediteur: {
          $sum: { $cond: [{ $eq: ['$typeEvaluation', 'conducteur_vers_expediteur'] }, 1, 0] }
        },
        evaluationsConducteur: {
          $sum: { $cond: [{ $eq: ['$typeEvaluation', 'expediteur_vers_conducteur'] }, 1, 0] }
        },
        tauxRecommandationGlobal: {
          $multiply: [
            { $divide: [
              { $sum: { $cond: ['$recommande', 1, 0] } },
              { $sum: 1 }
            ]},
            100
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;