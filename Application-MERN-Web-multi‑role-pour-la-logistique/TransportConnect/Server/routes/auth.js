// backend/routes/auth.js
const express = require('express');
const {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  changePassword,
  getMe
} = require('../controllers/authController');

const { authenticate, rateLimitLogin } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Routes publiques
router.post('/register', validateRegister, register);

router.post('/login', rateLimitLogin(), validateLogin, login);

router.post('/refresh-token', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requis'),
  handleValidationErrors
], refreshToken);

router.get('/verify-email/:token', [
  require('express-validator').param('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Token de vérification invalide'),
  handleValidationErrors
], verifyEmail);

router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Email valide requis')
    .normalizeEmail(),
  handleValidationErrors
], forgotPassword);

router.put('/reset-password/:token', [
  require('express-validator').param('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Token de réinitialisation invalide'),
  body('motDePasse')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial'),
  body('confirmationMotDePasse')
    .custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('La confirmation du mot de passe ne correspond pas');
      }
      return true;
    }),
  handleValidationErrors
], resetPassword);

// Routes protégées (nécessitent une authentification)
router.use(authenticate);

router.get('/me', getMe);

router.post('/logout', logout);

router.post('/resend-verification', resendVerificationEmail);

router.put('/change-password', validateChangePassword, changePassword);

module.exports = router;