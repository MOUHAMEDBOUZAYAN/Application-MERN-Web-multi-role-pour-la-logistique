// backend/routes/admin.js
const express = require('express');
const {
  getDashboard,
  getUtilisateurs,
  modifierStatutUtilisateur,
  gererBadge,
  getAnnonces,
  modifierStatutAnnonce,
  supprimerAnnonce,
  getDemandes,
  resoudreLitige,
  getLitiges,
  creerAdmin,
  getLogs,
  exporterDonnees,
  getMetriques
} = require('../controllers/adminController');

const { authenticate } = require('../middleware/auth');
const {
  requireAdmin,
  authorizeAdminAccess,
  authorizeModerationAccess
} = require('../middleware/roleCheck');
const {
  validateObjectId,
  validateSearchFilters,
  handleValidationErrors
} = require('../middleware/validation');
const { body, query, param } = require('express-validator');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(authenticate);
router.use(requireAdmin);

// Dashboard principal
router.get('/dashboard', getDashboard);
router.get('/metriques', getMetriques);

// Gestion des utilisateurs
router.get('/utilisateurs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('statut')
    .optional()
    .isIn(['actif', 'suspendu', 'en_attente'])
    .withMessage('Statut invalide'),
  query('role')
    .optional()
    .isIn(['conducteur', 'expediteur', 'admin'])
    .withMessage('Rôle invalide'),
  query('recherche')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Recherche doit contenir entre 2 et 50 caractères'),
  handleValidationErrors
], getUtilisateurs);

router.put('/utilisateurs/:id/statut',
  validateObjectId('id'),
  [
    body('statut')
      .isIn(['actif', 'suspendu', 'en_attente'])
      .withMessage('Statut invalide'),
    body('raison')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La raison doit contenir entre 10 et 500 caractères'),
    handleValidationErrors
  ],
  modifierStatutUtilisateur
);

router.put('/utilisateurs/:id/badges',
  validateObjectId('id'),
  [
    body('action')
      .isIn(['ajouter', 'retirer'])
      .withMessage('Action invalide'),
    body('typeBadge')
      .isIn(['verifie', 'conducteur_experimente', 'expediteur_fiable'])
      .withMessage('Type de badge invalide'),
    handleValidationErrors
  ],
  gererBadge
);

router.post('/utilisateurs/admin', [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('telephone')
    .matches(/^(\+212|0)[5-7][0-9]{8}$/)
    .withMessage('Numéro de téléphone invalide'),
  handleValidationErrors
], creerAdmin);

// Gestion des annonces
router.get('/annonces', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('statut')
    .optional()
    .isIn(['active', 'inactive', 'complete', 'annulee', 'suspendue'])
    .withMessage('Statut invalide'),
  query('recherche')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Recherche doit contenir entre 2 et 100 caractères'),
  handleValidationErrors
], getAnnonces);

router.put('/annonces/:id/statut',
  validateObjectId('id'),
  [
    body('statut')
      .isIn(['active', 'inactive', 'suspendue', 'annulee'])
      .withMessage('Statut invalide'),
    body('raison')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La raison doit contenir entre 10 et 500 caractères'),
    handleValidationErrors
  ],
  modifierStatutAnnonce
);

router.delete('/annonces/:id',
  validateObjectId('id'),
  [
    body('raison')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La raison de suppression doit contenir entre 10 et 500 caractères'),
    handleValidationErrors
  ],
  supprimerAnnonce
);

// Gestion des demandes
router.get('/demandes', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('statut')
    .optional()
    .isIn(['en_attente', 'acceptee', 'refusee', 'en_cours', 'enlevee', 'en_transit', 'livree', 'annulee', 'litige'])
    .withMessage('Statut invalide'),
  query('recherche')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Recherche doit contenir entre 2 et 50 caractères'),
  handleValidationErrors
], getDemandes);

// Gestion des litiges
router.get('/litiges', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
  query('resolu')
    .optional()
    .isBoolean()
    .withMessage('resolu doit être true ou false'),
  handleValidationErrors
], getLitiges);

router.put('/demandes/:id/resoudre-litige',
  validateObjectId('id'),
  authorizeModerationAccess,
  [
    body('resolution')
      .trim()
      .isLength({ min: 20, max: 1000 })
      .withMessage('La résolution doit contenir entre 20 et 1000 caractères'),
    body('decision')
      .isIn(['faveur_expediteur', 'faveur_conducteur', 'partage'])
      .withMessage('Décision invalide'),
    handleValidationErrors
  ],
  resoudreLitige
);

// Logs et audit
router.get('/logs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('type')
    .optional()
    .isIn(['user', 'annonce', 'demande', 'evaluation'])
    .withMessage('Type de log invalide'),
  query('admin')
    .optional()
    .isMongoId()
    .withMessage('ID admin invalide'),
  query('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('dateFin')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  handleValidationErrors
], getLogs);

// Export de données
router.get('/export/:type', [
  param('type')
    .isIn(['users', 'annonces', 'demandes', 'evaluations'])
    .withMessage('Type d\'export invalide'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format invalide'),
  query('dateDebut')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('dateFin')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  handleValidationErrors
], exporterDonnees);

module.exports = router;