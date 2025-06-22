// backend/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: formattedErrors
    });
  }
  
  next();
};

// Validations pour l'authentification
const validateRegister = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZàáâäçéèêëïîôùûüÿñæœÀÁÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ\s-.]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, points, espaces et tirets'),
    
  body('prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZàáâäçéèêëïîôùûüÿñæœÀÁÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ\s-.]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, points, espaces et tirets'),
    
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
    
  body('telephone')
    .trim()
    .matches(/^(\+212|0)[5-7][0-9]{8}$/)
    .withMessage('Numéro de téléphone marocain invalide (ex: +212600000000 ou 0600000000)'),
    
  body('motDePasse')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
    
  body('role')
    .isIn(['conducteur', 'expediteur'])
    .withMessage('Le rôle doit être "conducteur" ou "expediteur"'),
    
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
    
  body('motDePasse')
    .notEmpty()
    .withMessage('Mot de passe requis'),
    
  handleValidationErrors
];

// Validations pour les annonces
const validateCreateAnnonce = [
  body('titre')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Le titre doit contenir entre 10 et 100 caractères'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
    
  body('trajet.depart.ville')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville de départ est requise (2-50 caractères)'),
    
  body('trajet.destination.ville')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville de destination est requise (2-50 caractères)'),
    
  body('planning.dateDepart')
    .isISO8601()
    .withMessage('Date de départ invalide')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('La date de départ doit être dans le futur');
      }
      return true;
    }),
    
  body('capacite.dimensionsMax.longueur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Longueur invalide (0.1-1000 cm)'),
    
  body('capacite.dimensionsMax.largeur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Largeur invalide (0.1-1000 cm)'),
    
  body('capacite.dimensionsMax.hauteur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Hauteur invalide (0.1-1000 cm)'),
    
  body('capacite.poidsMax')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Poids maximal invalide (0.1-10000 kg)'),
    
  body('typesMarchandise')
    .isArray({ min: 1 })
    .withMessage('Au moins un type de marchandise doit être sélectionné')
    .custom((types) => {
      const validTypes = [
        'electromenager', 'mobilier', 'vetements', 'alimentation',
        'electronique', 'documents', 'medicaments', 'fragile',
        'produits_chimiques', 'materiaux_construction', 'autre'
      ];
      const invalidTypes = types.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(`Types de marchandise invalides: ${invalidTypes.join(', ')}`);
      }
      return true;
    }),
    
  body('tarification.typeTarification')
    .isIn(['par_kg', 'prix_fixe', 'negociable'])
    .withMessage('Type de tarification invalide'),
    
  body('tarification.prixParKg')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Prix par kg invalide'),
    
  body('tarification.prixFixe')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Prix fixe invalide'),
    
  body('vehicule.type')
    .isIn(['camionnette', 'camion', 'fourgon', 'voiture', 'moto'])
    .withMessage('Type de véhicule invalide'),
    
  handleValidationErrors
];

// Validations pour les demandes
const validateCreateDemande = [
  body('annonce')
    .isMongoId()
    .withMessage('ID d\'annonce invalide'),
    
  body('colis.description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description du colis requise (10-500 caractères)'),
    
  body('colis.dimensions.longueur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Longueur du colis invalide (0.1-1000 cm)'),
    
  body('colis.dimensions.largeur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Largeur du colis invalide (0.1-1000 cm)'),
    
  body('colis.dimensions.hauteur')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Hauteur du colis invalide (0.1-1000 cm)'),
    
  body('colis.poids')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Poids du colis invalide (0.1-10000 kg)'),
    
  body('colis.type')
    .isIn([
      'electromenager', 'mobilier', 'vetements', 'alimentation',
      'electronique', 'documents', 'medicaments', 'fragile',
      'produits_chimiques', 'materiaux_construction', 'autre'
    ])
    .withMessage('Type de marchandise invalide'),
    
  body('adresses.enlevement.nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom pour l\'enlèvement requis (2-100 caractères)'),
    
  body('adresses.enlevement.telephone')
    .matches(/^(\+212|0)[5-7][0-9]{8}$/)
    .withMessage('Téléphone d\'enlèvement invalide'),
    
  body('adresses.enlevement.adresse')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adresse d\'enlèvement requise (5-200 caractères)'),
    
  body('adresses.livraison.nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom pour la livraison requis (2-100 caractères)'),
    
  body('adresses.livraison.telephone')
    .matches(/^(\+212|0)[5-7][0-9]{8}$/)
    .withMessage('Téléphone de livraison invalide'),
    
  body('adresses.livraison.adresse')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Adresse de livraison requise (5-200 caractères)'),
    
  body('tarification.montantPropose')
    .isFloat({ min: 0.1 })
    .withMessage('Montant proposé invalide'),
    
  body('tarification.methodePaiement')
    .isIn(['especes', 'virement', 'paypal', 'carte_bancaire'])
    .withMessage('Méthode de paiement invalide'),
    
  handleValidationErrors
];

// Validations pour les évaluations
const validateCreateEvaluation = [
  body('demande')
    .isMongoId()
    .withMessage('ID de demande invalide'),
    
  body('evalue')
    .isMongoId()
    .withMessage('ID d\'utilisateur évalué invalide'),
    
  body('criteres.ponctualite')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note de ponctualité invalide (1-5)'),
    
  body('criteres.communication')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note de communication invalide (1-5)'),
    
  body('criteres.professionnalisme')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note de professionnalisme invalide (1-5)'),
    
  body('criteres.respectConsignes')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note de respect des consignes invalide (1-5)'),
    
  body('commentaire')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Commentaire requis (10-500 caractères)'),
    
  body('recommande')
    .isBoolean()
    .withMessage('Recommandation requise (true/false)'),
    
  body('typeEvaluation')
    .isIn(['expediteur_vers_conducteur', 'conducteur_vers_expediteur'])
    .withMessage('Type d\'évaluation invalide'),
    
  handleValidationErrors
];

// Validations pour les messages
const validateSendMessage = [
  body('destinataire')
    .isMongoId()
    .withMessage('ID de destinataire invalide'),
    
  body('annonce')
    .isMongoId()
    .withMessage('ID d\'annonce invalide'),
    
  body('contenu')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Contenu du message requis (1-1000 caractères)'),
    
  body('type')
    .optional()
    .isIn(['texte', 'image', 'document', 'localisation'])
    .withMessage('Type de message invalide'),
    
  handleValidationErrors
];

// Validations pour les paramètres d'URL
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} invalide`),
  handleValidationErrors
];

// Validations pour les filtres de recherche
const validateSearchFilters = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numéro de page invalide'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide (1-100)'),
    
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'prix', '-prix', 'date', '-date'])
    .withMessage('Tri invalide'),
    
  query('villeDepart')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ville de départ invalide'),
    
  query('villeDestination')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ville de destination invalide'),
    
  query('dateMin')
    .optional()
    .isISO8601()
    .withMessage('Date minimum invalide'),
    
  query('dateMax')
    .optional()
    .isISO8601()
    .withMessage('Date maximum invalide'),
    
  query('prixMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Prix minimum invalide'),
    
  query('prixMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Prix maximum invalide'),
    
  handleValidationErrors
];

// Validation pour la mise à jour du profil
const validateUpdateProfile = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    
  body('prenom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    
  body('telephone')
    .optional()
    .matches(/^(\+212|0)[5-7][0-9]{8}$/)
    .withMessage('Numéro de téléphone invalide'),
    
  body('adresse.ville')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ville invalide'),
    
  body('adresse.codePostal')
    .optional()
    .matches(/^[0-9]{5}$/)
    .withMessage('Code postal invalide (5 chiffres)'),
    
  handleValidationErrors
];

// Validation pour le changement de mot de passe
const validateChangePassword = [
  body('ancienMotDePasse')
    .notEmpty()
    .withMessage('Ancien mot de passe requis'),
    
  body('nouveauMotDePasse')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le nouveau mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le nouveau mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
    
  body('confirmationMotDePasse')
    .custom((value, { req }) => {
      if (value !== req.body.nouveauMotDePasse) {
        throw new Error('La confirmation du mot de passe ne correspond pas');
      }
      return true;
    }),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCreateAnnonce,
  validateCreateDemande,
  validateCreateEvaluation,
  validateSendMessage,
  validateObjectId,
  validateSearchFilters,
  validateUpdateProfile,
  validateChangePassword
};