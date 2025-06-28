// backend/routes/users.js
const express = require('express');
const {
  getUserProfile,
  updateProfile,
  uploadPhoto,
  getUserStatistiques,
  rechercherUtilisateurs,
  getTopUtilisateurs,
  supprimerCompte,
  getHistoriqueActivite,
  getNotifications,
  getDashboard
} = require('../controllers/userController');

const { authenticate } = require('../middleware/auth');
const {
  authorizeProfileAccess,
  requireRecentAuth,
  authorizeStatsAccess
} = require('../middleware/roleCheck');
const {
  validateObjectId,
  validateUpdateProfile,
  validateSearchFilters,
  handleValidationErrors
} = require('../middleware/validation');
const { body, query } = require('express-validator');

const router = express.Router();

// Routes publiques
router.get('/rechercher', validateSearchFilters, rechercherUtilisateurs);
router.get('/top', [
  query('categorie')
    .optional()
    .isIn(['note', 'activite', 'experience'])
    .withMessage('Catégorie invalide'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite invalide'),
  handleValidationErrors
], getTopUtilisateurs);

router.get('/:id/profile', validateObjectId('id'), getUserProfile);
router.get('/:id/statistiques', validateObjectId('id'), getUserStatistiques);

// Routes protégées
router.use(authenticate);

// Routes pour le profil utilisateur
router.put('/profile', validateUpdateProfile, updateProfile);
router.post('/upload-photo', uploadPhoto);

router.delete('/compte',
  requireRecentAuth(5 * 60 * 1000), // Re-auth requise dans les 5 dernières minutes
  [
    body('motDePasse')
      .notEmpty()
      .withMessage('Mot de passe requis pour supprimer le compte'),
    body('confirmation')
      .equals('SUPPRIMER MON COMPTE')
      .withMessage('Confirmation incorrecte'),
    handleValidationErrors
  ],
  supprimerCompte
);

// Routes pour l'activité et notifications
router.get('/dashboard', getDashboard);
router.get('/historique', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('type')
    .optional()
    .isIn(['annonces', 'demandes', 'evaluations'])
    .withMessage('Type d\'activité invalide'),
  query('periode')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Période invalide (1-365 jours)'),
  handleValidationErrors
], getHistoriqueActivite);

router.get('/notifications', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
  query('nonLues')
    .optional()
    .isBoolean()
    .withMessage('nonLues doit être true ou false'),
  handleValidationErrors
], getNotifications);

module.exports = router;