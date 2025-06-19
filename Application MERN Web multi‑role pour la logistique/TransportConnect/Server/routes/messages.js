// backend/routes/messages.js
const express = require('express');
const Message = require('../models/Message');
const { authenticate, authorizeConversation } = require('../middleware/auth');
const { authorizeChatAccess } = require('../middleware/roleCheck');
const { validateSendMessage, validateObjectId, handleValidationErrors } = require('../middleware/validation');
const { body, query } = require('express-validator');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(authorizeChatAccess);

// @desc    Obtenir les conversations de l'utilisateur
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const conversations = await Message.findConversationsUtilisateur(
      req.user._id,
      { page: parseInt(page), limit: parseInt(limit) }
    );
    
    res.json({
      success: true,
      data: { conversations }
    });
    
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
});

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/messages/conversation/:expediteurId/:destinataireId/:annonceId
// @access  Private
router.get('/conversation/:expediteurId/:destinataireId/:annonceId', [
  validateObjectId('expediteurId'),
  validateObjectId('destinataireId'), 
  validateObjectId('annonceId'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('depuisDate').optional().isISO8601().withMessage('Date invalide'),
  query('avantDate').optional().isISO8601().withMessage('Date invalide'),
  handleValidationErrors
], authorizeConversation, async (req, res) => {
  try {
    const { expediteurId, destinataireId, annonceId } = req.params;
    const { page = 1, limit = 50, depuisDate, avantDate } = req.query;
    
    const options = {
      limite: parseInt(limit),
      page: parseInt(page)
    };
    
    if (depuisDate) options.depuisDate = new Date(depuisDate);
    if (avantDate) options.avantDate = new Date(avantDate);
    
    const messages = await Message.findConversation(
      expediteurId,
      destinataireId, 
      annonceId,
      options
    );
    
    // Marquer les messages comme lus
    await Message.marquerConversationCommeLue(
      Message.genererConversationId(expediteurId, destinataireId, annonceId),
      req.user._id
    );
    
    res.json({
      success: true,
      data: { messages }
    });
    
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
});

// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private
router.post('/', validateSendMessage, async (req, res) => {
  try {
    const { destinataire, annonce, contenu, type = 'texte', localisation } = req.body;
    
    // Vérifier que l'utilisateur ne s'envoie pas un message à lui-même
    if (destinataire === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous envoyer un message à vous-même'
      });
    }
    
    // Créer le message
    const message = await Message.create({
      expediteur: req.user._id,
      destinataire,
      annonce,
      contenu,
      type,
      localisation,
      statut: 'envoye'
    });
    
    // Populer les données pour la réponse
    await message.populate([
      { path: 'expediteur', select: 'nom prenom photo' },
      { path: 'destinataire', select: 'nom prenom photo' },
      { path: 'annonce', select: 'titre trajet' }
    ]);
    
    // Émettre le message via Socket.IO si connecté
    const io = req.app.get('io');
    if (io) {
      io.to(message.conversation).emit('nouveau-message', {
        message,
        timestamp: new Date()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: { message }
    });
    
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
});

// @desc    Marquer un message comme lu
// @route   PUT /api/messages/:id/lu
// @access  Private
router.put('/:id/lu', validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier que c'est le destinataire qui marque comme lu
    if (message.destinataire.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le destinataire peut marquer un message comme lu'
      });
    }
    
    await message.marquerCommeL();
    
    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
    
  } catch (error) {
    console.error('Erreur marquage message lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du message'
    });
  }
});

// @desc    Marquer toute une conversation comme lue
// @route   PUT /api/messages/conversation/:expediteurId/:destinataireId/:annonceId/lu
// @access  Private
router.put('/conversation/:expediteurId/:destinataireId/:annonceId/lu', [
  validateObjectId('expediteurId'),
  validateObjectId('destinataireId'),
  validateObjectId('annonceId'),
  handleValidationErrors
], authorizeConversation, async (req, res) => {
  try {
    const { expediteurId, destinataireId, annonceId } = req.params;
    
    const conversationId = Message.genererConversationId(expediteurId, destinataireId, annonceId);
    
    const result = await Message.marquerConversationCommeLue(conversationId, req.user._id);
    
    res.json({
      success: true,
      message: 'Conversation marquée comme lue',
      data: { 
        messagesMarques: result.modifiedCount 
      }
    });
    
  } catch (error) {
    console.error('Erreur marquage conversation lue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la conversation'
    });
  }
});

// @desc    Ajouter une réaction à un message
// @route   POST /api/messages/:id/reaction
// @access  Private
router.post('/:id/reaction', [
  validateObjectId('id'),
  body('emoji')
    .isIn(['👍', '👎', '❤️', '😂', '😮', '😢', '😡'])
    .withMessage('Emoji de réaction invalide'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { emoji } = req.body;
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier que l'utilisateur fait partie de la conversation
    if (!message.estAccessiblePar(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce message'
      });
    }
    
    await message.ajouterReaction(req.user._id, emoji);
    
    res.json({
      success: true,
      message: 'Réaction ajoutée',
      data: { reactions: message.reactions }
    });
    
  } catch (error) {
    console.error('Erreur ajout réaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réaction'
    });
  }
});

// @desc    Supprimer une réaction
// @route   DELETE /api/messages/:id/reaction
// @access  Private
router.delete('/:id/reaction', validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    if (!message.estAccessiblePar(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce message'
      });
    }
    
    await message.supprimerReaction(req.user._id);
    
    res.json({
      success: true,
      message: 'Réaction supprimée'
    });
    
  } catch (error) {
    console.error('Erreur suppression réaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réaction'
    });
  }
});

// @desc    Rechercher dans les messages
// @route   GET /api/messages/rechercher
// @access  Private
router.get('/rechercher', [
  query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères'),
  query('annonceId')
    .optional()
    .isMongoId()
    .withMessage('ID d\'annonce invalide'),
  query('depuisDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('avantDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { q, annonceId, depuisDate, avantDate, limite = 50 } = req.query;
    
    const options = { limite: parseInt(limite) };
    if (annonceId) options.annonceId = annonceId;
    if (depuisDate) options.depuisDate = new Date(depuisDate);
    if (avantDate) options.avantDate = new Date(avantDate);
    
    const messages = await Message.rechercherMessages(req.user._id, q, options);
    
    res.json({
      success: true,
      data: { messages }
    });
    
  } catch (error) {
    console.error('Erreur recherche messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
});

// @desc    Obtenir le nombre de messages non lus
// @route   GET /api/messages/non-lus/count
// @access  Private
router.get('/non-lus/count', async (req, res) => {
  try {
    const count = await Message.compterMessagesNonLus(req.user._id);
    
    res.json({
      success: true,
      data: { count }
    });
    
  } catch (error) {
    console.error('Erreur comptage messages non lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des messages non lus'
    });
  }
});

// @desc    Obtenir les statistiques de messagerie
// @route   GET /api/messages/statistiques
// @access  Private
router.get('/statistiques', [
  query('periode')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Période invalide (1-365 jours)'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { periode = 30 } = req.query;
    
    const stats = await Message.statistiquesMessages(req.user._id, parseInt(periode));
    
    res.json({
      success: true,
      data: { statistiques: stats }
    });
    
  } catch (error) {
    console.error('Erreur statistiques messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
});

module.exports = router;