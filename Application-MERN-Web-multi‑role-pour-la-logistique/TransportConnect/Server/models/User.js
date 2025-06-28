// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true,
    match: [
      /^(\+?\d{1,4}[\s-]?)?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{4})$/,
      'Veuillez fournir un numéro de téléphone valide'
    ]
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
  },
  role: {
    type: String,
    enum: {
      values: ['conducteur', 'expediteur', 'admin'],
      message: 'Le rôle doit être soit conducteur, expediteur ou admin'
    },
    required: [true, 'Le rôle est requis']
  },
  statut: {
    type: String,
    enum: ['actif', 'suspendu', 'en_attente'],
    default: 'actif'
  },
  badges: [{
    type: {
      type: String,
      enum: ['verifie', 'conducteur_experimente', 'expediteur_fiable'],
    },
    dateObtention: {
      type: Date,
      default: Date.now
    }
  }],
  photo: {
    type: String,
    default: null
  },
  adresse: {
    rue: { type: String, trim: true },
    ville: { type: String, trim: true },
    codePostal: { type: String, trim: true },
    pays: { type: String, trim: true, default: 'Maroc' }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    langue: { type: String, default: 'fr' }
  },
  statistiques: {
    nombreAnnonces: { type: Number, default: 0 },
    nombreDemandesEnvoyees: { type: Number, default: 0 },
    nombreDemandesAcceptees: { type: Number, default: 0 },
    notemoyenne: { type: Number, default: 0, min: 0, max: 5 },
    nombreEvaluations: { type: Number, default: 0 }
  },
  derniereConnexion: {
    type: Date,
    default: Date.now
  },
  emailVerifie: {
    type: Boolean,
    default: false
  },
  tokenVerificationEmail: String,
  tokenResetMotDePasse: String,
  dateExpirationResetMotDePasse: Date,
  tentativesConnexion: {
    nombre: { type: Number, default: 0 },
    derniereTentative: Date,
    bloque: { type: Boolean, default: false },
    dateBlocage: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ statut: 1 });
userSchema.index({ createdAt: -1 });

// Virtual pour le nom complet
userSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// Virtual pour compter les badges
userSchema.virtual('nombreBadges').get(function() {
  return this.badges ? this.badges.length : 0;
});

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('motDePasse')) return next();
  
  try {
    // Générer le salt et hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparerMotDePasse = async function(motDePasseCandidat) {
  try {
    return await bcrypt.compare(motDePasseCandidat, this.motDePasse);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison du mot de passe');
  }
};

// Méthode pour ajouter un badge
userSchema.methods.ajouterBadge = function(typeBadge) {
  const badgeExiste = this.badges.some(badge => badge.type === typeBadge);
  if (!badgeExiste) {
    this.badges.push({ type: typeBadge, dateObtention: new Date() });
  }
  return this.save();
};

// Méthode pour supprimer un badge
userSchema.methods.supprimerBadge = function(typeBadge) {
  this.badges = this.badges.filter(badge => badge.type !== typeBadge);
  return this.save();
};

// Méthode pour mettre à jour les statistiques
userSchema.methods.mettreAJourStatistiques = function(stats) {
  Object.keys(stats).forEach(key => {
    if (this.statistiques.hasOwnProperty(key)) {
      this.statistiques[key] = stats[key];
    }
  });
  return this.save();
};

// Méthode pour vérifier si l'utilisateur est bloqué
userSchema.methods.estBloque = function() {
  if (!this.tentativesConnexion.bloque) return false;
  
  // Débloquer automatiquement après 24h
  const unJourEnMs = 24 * 60 * 60 * 1000;
  const maintenant = new Date();
  const dateBlocage = new Date(this.tentativesConnexion.dateBlocage);
  
  if (maintenant - dateBlocage > unJourEnMs) {
    this.tentativesConnexion.bloque = false;
    this.tentativesConnexion.nombre = 0;
    this.tentativesConnexion.dateBlocage = null;
    this.save();
    return false;
  }
  
  return true;
};

// Méthode pour gérer les tentatives de connexion
userSchema.methods.gererTentativeConnexion = function(succes) {
  if (succes) {
    this.tentativesConnexion.nombre = 0;
    this.tentativesConnexion.bloque = false;
    this.tentativesConnexion.dateBlocage = null;
    this.derniereConnexion = new Date();
  } else {
    this.tentativesConnexion.nombre += 1;
    this.tentativesConnexion.derniereTentative = new Date();
    
    // Bloquer après 5 tentatives échouées
    if (this.tentativesConnexion.nombre >= 5) {
      this.tentativesConnexion.bloque = true;
      this.tentativesConnexion.dateBlocage = new Date();
    }
  }
  
  return this.save();
};

// Méthode pour nettoyer les données sensibles avant l'envoi
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.motDePasse;
  delete user.tokenVerificationEmail;
  delete user.tokenResetMotDePasse;
  delete user.dateExpirationResetMotDePasse;
  return user;
};

// Méthodes statiques
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActifs = function() {
  return this.find({ statut: 'actif' });
};

userSchema.statics.statistiquesGlobales = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUtilisateurs: { $sum: 1 },
        utilisateursActifs: {
          $sum: { $cond: [{ $eq: ['$statut', 'actif'] }, 1, 0] }
        },
        conducteurs: {
          $sum: { $cond: [{ $eq: ['$role', 'conducteur'] }, 1, 0] }
        },
        expediteurs: {
          $sum: { $cond: [{ $eq: ['$role', 'expediteur'] }, 1, 0] }
        },
        utilisateursVerifies: {
          $sum: { $cond: ['$emailVerifie', 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

const User = mongoose.model('User', userSchema);

module.exports = User;