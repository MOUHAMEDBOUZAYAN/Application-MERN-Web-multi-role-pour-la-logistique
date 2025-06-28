// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

// Middleware pour vérifier l'authentification
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Récupérer le token depuis les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }
    
    try {
      // Vérifier et décoder le token
      const decoded = verifyToken(token);
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.id)
        .select('+motDePasse'); // Inclure le mot de passe pour les vérifications
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token invalide. Utilisateur non trouvé.'
        });
      }
      
      // Vérifier si l'utilisateur est actif
      if (user.statut !== 'actif') {
        return res.status(401).json({
          success: false,
          message: 'Compte suspendu ou inactif.'
        });
      }
      
      // Vérifier si l'utilisateur n'est pas bloqué
      if (user.estBloque()) {
        return res.status(401).json({
          success: false,
          message: 'Compte temporairement bloqué. Réessayez plus tard.'
        });
      }
      
      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
      
    } catch (jwtError) {
      // Erreurs spécifiques JWT
      let message = 'Token invalide';
      
      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expiré. Veuillez vous reconnecter.';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Token malformé.';
      }
      
      return res.status(401).json({
        success: false,
        message: message
      });
    }
    
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour l'authentification optionnelle
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (user && user.statut === 'actif' && !user.estBloque()) {
          req.user = user;
        }
      } catch (jwtError) {
        // En cas d'erreur, on continue sans utilisateur
        console.warn('Token optionnel invalide:', jwtError.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware auth optionnel:', error);
    next(); // Continuer même en cas d'erreur
  }
};

// Middleware pour vérifier la propriété d'une ressource
const authorize = (Model, paramName = 'id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de ressource manquant'
        });
      }
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée'
        });
      }
      
      // Vérifier la propriété
      const resourceUserId = resource[userField]?.toString() || resource[userField];
      const currentUserId = req.user._id.toString();
      
      if (resourceUserId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Vous n\'êtes pas autorisé à accéder à cette ressource.'
        });
      }
      
      // Ajouter la ressource à la requête pour éviter de la récupérer à nouveau
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Erreur middleware authorize:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier l'accès à une conversation
const authorizeConversation = async (req, res, next) => {
  try {
    const { expediteurId, destinataireId, annonceId } = req.params;
    const currentUserId = req.user._id.toString();
    
    // Vérifier que l'utilisateur fait partie de la conversation
    if (expediteurId !== currentUserId && destinataireId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette conversation'
      });
    }
    
    // Vérifier que l'annonce existe
    const Annonce = require('../models/Annonce');
    const annonce = await Annonce.findById(annonceId);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    req.annonce = annonce;
    next();
    
  } catch (error) {
    console.error('Erreur middleware authorizeConversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour limiter les tentatives de connexion
const rateLimitLogin = (maxTentatives = 5, fenetreTemps = 15 * 60 * 1000) => {
  const tentatives = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const maintenant = Date.now();
    
    // Nettoyer les anciennes tentatives
    for (const [cle, donnees] of tentatives.entries()) {
      if (maintenant - donnees.premiereeTentative > fenetreTemps) {
        tentatives.delete(cle);
      }
    }
    
    const donneesTentatives = tentatives.get(ip);
    
    if (donneesTentatives) {
      if (donneesTentatives.compte >= maxTentatives) {
        const tempsRestant = Math.ceil((fenetreTemps - (maintenant - donneesTentatives.premiereeTentative)) / 1000 / 60);
        return res.status(429).json({
          success: false,
          message: `Trop de tentatives de connexion. Réessayez dans ${tempsRestant} minutes.`
        });
      }
      
      donneesTentatives.compte += 1;
      donneesTentatives.derniereTentative = maintenant;
    } else {
      tentatives.set(ip, {
        compte: 1,
        premiereeTentative: maintenant,
        derniereTentative: maintenant
      });
    }
    
    next();
  };
};

// Middleware pour réinitialiser le rate limit en cas de succès
const resetRateLimit = (req, res, next) => {
  // Cette fonction sera appelée après une connexion réussie
  const ip = req.ip || req.connection.remoteAddress;
  
  // Logique pour réinitialiser le compteur
  res.on('finish', () => {
    if (res.statusCode === 200) {
      // Réinitialiser les tentatives pour cette IP
      // Cette logique sera implémentée si nécessaire
    }
  });
  
  next();
};

// Middleware pour vérifier les permissions sur les évaluations
const authorizeEvaluation = async (req, res, next) => {
  try {
    const { demandeId } = req.body || req.params;
    const currentUserId = req.user._id.toString();
    
    const Demande = require('../models/Demande');
    const demande = await Demande.findById(demandeId)
      .populate('expediteur conducteur');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur fait partie de la transaction
    const expediteurId = demande.expediteur._id.toString();
    const conducteurId = demande.conducteur._id.toString();
    
    if (currentUserId !== expediteurId && currentUserId !== conducteurId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à évaluer cette transaction'
      });
    }
    
    // Vérifier que la demande est terminée
    if (demande.statut !== 'livree') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer qu\'une demande livrée'
      });
    }
    
    req.demande = demande;
    next();
    
  } catch (error) {
    console.error('Erreur middleware authorizeEvaluation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  authorizeConversation,
  rateLimitLogin,
  resetRateLimit,
  authorizeEvaluation
};