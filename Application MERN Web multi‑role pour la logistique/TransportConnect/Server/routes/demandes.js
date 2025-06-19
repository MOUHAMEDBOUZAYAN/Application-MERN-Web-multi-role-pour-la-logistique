// backend/routes/demandes.js
const express = require('express');
const {
  createDemande,
  getDemandesConducteur,
  getDemandesExpediteur,
  getDemande,
  repondreDemande,
  updateStatutDemande,
  annulerDemande,
  ajouterCommunication,
  updatePosition,
  suivreDemande,
  signalerLitige,
  getStatistiques
} = require('../controllers/demandeController');

const { authenticate, authorize } = require('../middleware/auth');
const {
  requireExpediteur,
  requireConducteur,
  authorizeDemandeAccess,
  requireAdmin,
  authorizeStatsAccess
} = require('../middleware/roleCheck');
const {
  validateCreateDemande,
  validateObjectId,
  validateSearchFilters,
  handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');
const Demande = require('../models/Demande');

const router = express.Router();

// Routes publiques
router.get('/suivi/:numeroSuivi', suivreDemande);

// Routes protégées
router.use(authenticate);

// Routes pour les expéditeurs
router.post('/', 
  requireExpediteur, 
  authorizeDemandeAccess('create'), 
  validateCreateDemande, 
  createDemande
);

router.get('/expediteur/mes-demandes', 
  requireExpediteur, 
  validateSearchFilters, 
  getDemandesExpediteur
);

// Routes pour les conducteurs
router.get('/conducteur/demandes-recues', 
  requireConducteur, 
  validateSearchFilters, 
  getDemandesConducteur
);

router.put('/:id/reponse',
  validateObjectId('id'),
  requireConducteur,
  [
    body('action')
      .isIn(['accepter', 'refuser'])
      .withMessage('Action invalide'),
    body('commentaire')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
    handleValidationErrors
  ],
  repondreDemande
);

router.put('/:id/statut',
  validateObjectId('id'),
  requireConducteur,
  [
    body('statut')
      .isIn(['en_cours', 'enlevee', 'en_transit', 'livree', 'annulee'])
      .withMessage('Statut invalide'),
    body('commentaire')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
    handleValidationErrors
  ],
  updateStatutDemande
);

router.put('/:id/position',
  validateObjectId('id'),
  requireConducteur,
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude invalide'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude invalide'),
    body('adresse')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Adresse trop longue'),
    handleValidationErrors
  ],
  updatePosition
);

// Routes communes (expéditeur et conducteur)
router.get('/:id', 
  validateObjectId('id'), 
  authorizeDemandeAccess('view'), 
  getDemande
);

router.put('/:id/annuler',
  validateObjectId('id'),
  requireExpediteur,
  [
    body('motif')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Le motif doit contenir entre 10 et 500 caractères'),
    handleValidationErrors
  ],
  annulerDemande
);

router.post('/:id/communications',
  validateObjectId('id'),
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Le message doit contenir entre 1 et 1000 caractères'),
    body('type')
      .optional()
      .isIn(['message', 'notification', 'alerte'])
      .withMessage('Type de communication invalide'),
    handleValidationErrors
  ],
  ajouterCommunication
);

router.post('/:id/litige',
  validateObjectId('id'),
  [
    body('motif')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Le motif doit contenir entre 10 et 500 caractères'),
    handleValidationErrors
  ],
  signalerLitige
);

// Routes administrateur
router.get('/admin/statistiques', 
  requireAdmin, 
  authorizeStatsAccess('global'), 
  getStatistiques
);

module.exports = router;