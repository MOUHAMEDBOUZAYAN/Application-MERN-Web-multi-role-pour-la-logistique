// backend/routes/evaluations.js
const express = require('express');
const {
  createEvaluation,
  getEvaluationsUtilisateur,
  getMesEvaluations,
  getEvaluation,
  repondreEvaluation,
  marquerUtile,
  signalerEvaluation,
  getEvaluationsEnAttenteModeation,
  modererEvaluation,
  getStatistiquesEvaluations,
  peutEvaluer,
  getResumeEvaluations,
  rechercherEvaluations
} = require('../controllers/evaluationController');

const { authenticate, optionalAuthenticate, authorizeEvaluation } = require('../middleware/auth');
const {
  requireUser,
  requireAdmin,
  authorizeModerationAccess,
  authorizeStatsAccess
} = require('../middleware/roleCheck');
const {
  validateCreateEvaluation,
  validateObjectId,
  validateSearchFilters,
  handleValidationErrors
} = require('../middleware/validation');
const { body, query } = require('express-validator');

const router = express.Router();

// Routes publiques
router.get('/rechercher', validateSearchFilters, rechercherEvaluations);
router.get('/utilisateur/:userId', validateObjectId('userId'), getEvaluationsUtilisateur);
router.get('/resume/:userId', validateObjectId('userId'), getResumeEvaluations);

// Routes avec authentification optionnelle
router.get('/:id', validateObjectId('id'), optionalAuthenticate, getEvaluation);

// Routes protégées
router.use(authenticate);

// Routes pour tous les utilisateurs connectés
router.post('/', 
  requireUser,
  authorizeEvaluation,
  validateCreateEvaluation,
  createEvaluation
);

router.get('/mes-evaluations/donnees', 
  validateSearchFilters,
  getMesEvaluations
);

router.get('/peut-evaluer/:demandeId', 
  validateObjectId('demandeId'),
  peutEvaluer
);

router.post('/:id/utile',
  validateObjectId('id'),
  marquerUtile
);

router.post('/:id/reponse',
  validateObjectId('id'),
  [
    body('commentaire')
      .trim()
      .isLength({ min: 10, max: 300 })
      .withMessage('La réponse doit contenir entre 10 et 300 caractères'),
    handleValidationErrors
  ],
  repondreEvaluation
);

router.post('/:id/signaler',
  validateObjectId('id'),
  [
    body('motif')
      .isIn([
        'commentaire_inapproprie',
        'note_injustifiee',
        'faux_commentaire',
        'information_personnelle',
        'diffamation',
        'autre'
      ])
      .withMessage('Motif de signalement invalide'),
    handleValidationErrors
  ],
  signalerEvaluation
);

// Routes administrateur
router.get('/admin/moderation/en-attente',
  requireAdmin,
  authorizeModerationAccess,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
    handleValidationErrors
  ],
  getEvaluationsEnAttenteModeation
);

router.put('/:id/moderation',
  validateObjectId('id'),
  requireAdmin,
  authorizeModerationAccess,
  [
    body('action')
      .isIn(['approuver', 'rejeter', 'traiter_signalement'])
      .withMessage('Action de modération invalide'),
    body('raisonRejet')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('La raison de rejet doit contenir entre 10 et 500 caractères'),
    body('decision')
      .optional()
      .isIn(['maintenue', 'modifiee', 'supprimee'])
      .withMessage('Décision invalide'),
    handleValidationErrors
  ],
  modererEvaluation
);

router.get('/admin/statistiques',
  requireAdmin,
  authorizeStatsAccess('global'),
  getStatistiquesEvaluations
);

module.exports = router;