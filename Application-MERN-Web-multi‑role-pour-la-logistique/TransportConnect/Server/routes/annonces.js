// backend/routes/annonces.js
const express = require('express');
const {
  createAnnonce,
  getAnnonces,
  getAnnonce,
  updateAnnonce,
  deleteAnnonce,
  getMesAnnonces,
  rechercherAnnonces,
  ajouterCommentaire,
  getStatistiques
} = require('../controllers/annonceController');

const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');
const { 
  requireConducteur, 
  requireUser,
  authorizeAnnonceAccess, 
  requireAdmin,
  authorizeStatsAccess 
} = require('../middleware/roleCheck');
const {
  validateCreateAnnonce,
  validateObjectId,
  validateSearchFilters
} = require('../middleware/validation');
const Annonce = require('../models/Annonce');

const router = express.Router();

// Routes publiques
router.get('/', optionalAuthenticate, validateSearchFilters, getAnnonces);
router.get('/rechercher', validateSearchFilters, rechercherAnnonces);
router.get('/statistiques', authenticate, requireAdmin, authorizeStatsAccess('global'), getStatistiques);

// Routes avec authentification optionnelle
router.get('/:id', validateObjectId('id'), optionalAuthenticate, getAnnonce);

// Routes protégées
router.use(authenticate); // Toutes les routes suivantes nécessitent une authentification

// Routes pour les conducteurs
router.post('/', requireConducteur, validateCreateAnnonce, createAnnonce);
router.get('/mes-annonces/liste', requireUser, getMesAnnonces);

// Routes pour propriétaires d'annonces ou admin
router.put('/:id', 
  validateObjectId('id'), 
  authorizeAnnonceAccess, 
  updateAnnonce
);

router.delete('/:id', 
  validateObjectId('id'), 
  authorizeAnnonceAccess, 
  deleteAnnonce
);

// Routes pour commentaires
router.post('/:id/commentaires', 
  validateObjectId('id'),
  [
    require('express-validator').body('message')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Le commentaire doit contenir entre 10 et 500 caractères'),
    require('../middleware/validation').handleValidationErrors
  ],
  ajouterCommentaire
);

module.exports = router;