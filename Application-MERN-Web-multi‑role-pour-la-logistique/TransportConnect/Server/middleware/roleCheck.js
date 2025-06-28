// backend/middleware/roleCheck.js

// Middleware pour vérifier les rôles d'utilisateur
const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      // Vérifier si l'utilisateur a le bon rôle
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôles autorisés: ${roles.join(', ')}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur middleware requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware spécifique pour les administrateurs
const requireAdmin = requireRole('admin');

// Middleware spécifique pour les conducteurs
const requireConducteur = requireRole('conducteur');

// Middleware spécifique pour les expéditeurs
const requireExpediteur = requireRole('expediteur');

// Middleware pour conducteurs et expéditeurs (utilisateurs normaux)
const requireUser = requireRole('conducteur', 'expediteur');

// Middleware pour vérifier les permissions d'annonce
const authorizeAnnonceAccess = (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Seuls les conducteurs peuvent créer/modifier des annonces
    if (userRole !== 'conducteur' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les conducteurs peuvent gérer les annonces'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware authorizeAnnonceAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier les permissions de demande
const authorizeDemandeAccess = (action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      switch (action) {
        case 'create':
          // Seuls les expéditeurs peuvent créer des demandes
          if (userRole !== 'expediteur' && userRole !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Seuls les expéditeurs peuvent créer des demandes'
            });
          }
          break;
          
        case 'respond':
          // Seuls les conducteurs peuvent répondre aux demandes
          if (userRole !== 'conducteur' && userRole !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Seuls les conducteurs peuvent répondre aux demandes'
            });
          }
          break;
          
        case 'view':
          // Conducteurs et expéditeurs peuvent voir leurs demandes
          if (!['conducteur', 'expediteur', 'admin'].includes(userRole)) {
            return res.status(403).json({
              success: false,
              message: 'Accès refusé'
            });
          }
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Action non reconnue'
          });
      }
      
      next();
    } catch (error) {
      console.error('Erreur middleware authorizeDemandeAccess:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier les permissions d'évaluation
const authorizeEvaluationAccess = (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Seuls les conducteurs et expéditeurs peuvent créer des évaluations
    if (!['conducteur', 'expediteur', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les utilisateurs ayant effectué une transaction peuvent évaluer'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware authorizeEvaluationAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier les permissions de chat
const authorizeChatAccess = (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Seuls les conducteurs et expéditeurs peuvent accéder au chat
    if (!['conducteur', 'expediteur', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Accès au chat réservé aux utilisateurs actifs'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware authorizeChatAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier les permissions admin
const authorizeAdminAccess = (action) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès administrateur requis'
        });
      }
      
      // Ici vous pouvez ajouter des vérifications supplémentaires selon l'action
      // Par exemple, certaines actions pourraient nécessiter des permissions spéciales
      
      next();
    } catch (error) {
      console.error('Erreur middleware authorizeAdminAccess:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier si l'utilisateur peut modifier son profil
const authorizeProfileAccess = (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const profileUserId = req.params.id || req.params.userId;
    
    // Un utilisateur peut modifier son propre profil ou un admin peut modifier n'importe quel profil
    if (currentUserId !== profileUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que votre propre profil'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware authorizeProfileAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier les permissions de statistiques
const authorizeStatsAccess = (level = 'user') => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      switch (level) {
        case 'user':
          // Tous les utilisateurs authentifiés peuvent voir leurs propres stats
          if (!['conducteur', 'expediteur', 'admin'].includes(userRole)) {
            return res.status(403).json({
              success: false,
              message: 'Accès refusé aux statistiques'
            });
          }
          break;
          
        case 'global':
          // Seuls les admins peuvent voir les statistiques globales
          if (userRole !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Accès admin requis pour les statistiques globales'
            });
          }
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Niveau de permission non reconnu'
          });
      }
      
      next();
    } catch (error) {
      console.error('Erreur middleware authorizeStatsAccess:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier les permissions de modération
const authorizeModerationAccess = (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Seuls les admins peuvent modérer
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permissions de modération requises'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware authorizeModerationAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier si l'utilisateur a des badges spécifiques
const requireBadge = (...badges) => {
  return (req, res, next) => {
    try {
      if (!req.user.badges || req.user.badges.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Badges requis non trouvés'
        });
      }
      
      const userBadges = req.user.badges.map(badge => badge.type);
      const hasRequiredBadge = badges.some(badge => userBadges.includes(badge));
      
      if (!hasRequiredBadge) {
        return res.status(403).json({
          success: false,
          message: `Badges requis: ${badges.join(', ')}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur middleware requireBadge:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

// Middleware pour vérifier si l'utilisateur est vérifié
const requireVerified = (req, res, next) => {
  try {
    if (!req.user.emailVerifie) {
      return res.status(403).json({
        success: false,
        message: 'Email non vérifié. Veuillez vérifier votre email pour accéder à cette fonctionnalité.'
      });
    }
    
    // Vérifier si l'utilisateur a le badge "vérifié"
    const aVerifieBadge = req.user.badges?.some(badge => badge.type === 'verifie');
    
    if (!aVerifieBadge) {
      return res.status(403).json({
        success: false,
        message: 'Compte non vérifié. Contactez l\'administration pour la vérification.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur middleware requireVerified:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour les actions sensibles nécessitant une re-authentification
const requireRecentAuth = (maxAge = 30 * 60 * 1000) => { // 30 minutes par défaut
  return (req, res, next) => {
    try {
      const lastLogin = req.user.derniereConnexion;
      const now = new Date();
      
      if (!lastLogin || (now - lastLogin) > maxAge) {
        return res.status(403).json({
          success: false,
          message: 'Re-authentification requise pour cette action sensible',
          code: 'REAUTH_REQUIRED'
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur middleware requireRecentAuth:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireConducteur,
  requireExpediteur,
  requireUser,
  authorizeAnnonceAccess,
  authorizeDemandeAccess,
  authorizeEvaluationAccess,
  authorizeChatAccess,
  authorizeAdminAccess,
  authorizeProfileAccess,
  authorizeStatsAccess,
  authorizeModerationAccess,
  requireBadge,
  requireVerified,
  requireRecentAuth
};