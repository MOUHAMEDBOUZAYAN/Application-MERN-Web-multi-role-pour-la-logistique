// backend/controllers/authController.js
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { telephone }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }
      if (existingUser.telephone === telephone) {
        return res.status(400).json({
          success: false,
          message: 'Un compte avec ce numéro de téléphone existe déjà'
        });
      }
    }
    
    // Créer le nouvel utilisateur
    const user = await User.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      motDePasse,
      role,
      tokenVerificationEmail: crypto.randomBytes(32).toString('hex')
    });
    
    // Générer les tokens
    const token = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      id: user._id 
    });
    
    // Envoyer l'email de vérification
    try {
      await sendEmail({
        to: user.email,
        subject: 'Vérification de votre compte TransportConnect',
        template: 'verification',
        data: {
          nom: user.nomComplet,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${user.tokenVerificationEmail}`
        }
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas bloquer l'inscription si l'email échoue
    }
    
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          emailVerifie: user.emailVerifie
        },
        token,
        refreshToken
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    
    // Gestion des erreurs spécifiques MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} déjà utilisé`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+motDePasse');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier si l'utilisateur est bloqué
    if (user.estBloque()) {
      return res.status(401).json({
        success: false,
        message: 'Compte temporairement bloqué suite à plusieurs tentatives échouées'
      });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await user.comparerMotDePasse(motDePasse);
    
    if (!isValidPassword) {
      // Gérer la tentative de connexion échouée
      await user.gererTentativeConnexion(false);
      
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le statut du compte
    if (user.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte suspendu ou inactif'
      });
    }
    
    // Connexion réussie - réinitialiser les tentatives
    await user.gererTentativeConnexion(true);
    
    // Générer les tokens
    const token = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = generateRefreshToken({ 
      id: user._id 
    });
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          photo: user.photo,
          badges: user.badges,
          emailVerifie: user.emailVerifie,
          statistiques: user.statistiques
        },
        token,
        refreshToken
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

// @desc    Déconnexion utilisateur
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Dans une implémentation complète, vous pourriez blacklister le token
    // ou le stocker dans une base de données Redis pour invalidation
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};

// @desc    Vérification email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ tokenVerificationEmail: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification invalide ou expiré'
      });
    }
    
    // Marquer l'email comme vérifié
    user.emailVerifie = true;
    user.tokenVerificationEmail = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
    
  } catch (error) {
    console.error('Erreur vérification email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

// @desc    Renvoyer email de vérification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.emailVerifie) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié'
      });
    }
    
    // Générer un nouveau token
    user.tokenVerificationEmail = crypto.randomBytes(32).toString('hex');
    await user.save();
    
    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: 'Vérification de votre compte TransportConnect',
      template: 'verification',
      data: {
        nom: user.nomComplet,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${user.tokenVerificationEmail}`
      }
    });
    
    res.json({
      success: true,
      message: 'Email de vérification renvoyé'
    });
    
  } catch (error) {
    console.error('Erreur renvoi email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi de l\'email'
    });
  }
};

// @desc    Demande de réinitialisation mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Pour des raisons de sécurité, on retourne toujours un succès
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }
    
    // Générer le token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.tokenResetMotDePasse = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.dateExpirationResetMotDePasse = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();
    
    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'resetPassword',
      data: {
        nom: user.nomComplet,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      }
    });
    
    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
    
  } catch (error) {
    console.error('Erreur mot de passe oublié:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
};

// @desc    Réinitialisation mot de passe
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { motDePasse } = req.body;
    
    // Hasher le token pour le comparer
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      tokenResetMotDePasse: hashedToken,
      dateExpirationResetMotDePasse: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    // Mettre à jour le mot de passe
    user.motDePasse = motDePasse;
    user.tokenResetMotDePasse = undefined;
    user.dateExpirationResetMotDePasse = undefined;
    
    // Réinitialiser les tentatives de connexion
    user.tentativesConnexion.nombre = 0;
    user.tentativesConnexion.bloque = false;
    user.tentativesConnexion.dateBlocage = null;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation'
    });
  }
};

// @desc    Rafraîchir le token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant'
      });
    }
    
    // Vérifier le refresh token
    const { verifyRefreshToken } = require('../config/jwt');
    const decoded = verifyRefreshToken(refreshToken);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);
    
    if (!user || user.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur invalide'
      });
    }
    
    // Générer un nouveau token
    const newToken = generateToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    const newRefreshToken = generateRefreshToken({ 
      id: user._id 
    });
    
    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token invalide'
    });
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await User.findById(req.user._id).select('+motDePasse');
    
    // Vérifier l'ancien mot de passe
    const isValidPassword = await user.comparerMotDePasse(ancienMotDePasse);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien mot de passe incorrect'
      });
    }
    
    // Mettre à jour le mot de passe
    user.motDePasse = nouveauMotDePasse;
    await user.save();
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
    
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
};

// @desc    Obtenir le profil utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          photo: user.photo,
          adresse: user.adresse,
          badges: user.badges,
          emailVerifie: user.emailVerifie,
          statistiques: user.statistiques,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

module.exports = {
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
};