// backend/controllers/evaluationController.js
const Evaluation = require('../models/Evaluation');
const Demande = require('../models/Demande');
const User = require('../models/User');

// @desc    Créer une nouvelle évaluation
// @route   POST /api/evaluations
// @access  Private
const createEvaluation = async (req, res) => {
  try {
    const { demande: demandeId, evalue, ...evaluationData } = req.body;
    
    // Récupérer la demande
    const demande = await Demande.findById(demandeId)
      .populate('expediteur conducteur');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que la demande est terminée
    if (demande.statut !== 'livree') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer qu\'une demande livrée'
      });
    }
    
    // Vérifier que l'utilisateur fait partie de la transaction
    const userId = req.user._id.toString();
    const expediteurId = demande.expediteur._id.toString();
    const conducteurId = demande.conducteur._id.toString();
    
    if (userId !== expediteurId && userId !== conducteurId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à évaluer cette transaction'
      });
    }
    
    // Déterminer le type d'évaluation et la personne évaluée
    let typeEvaluation;
    let evalueId;
    
    if (userId === expediteurId) {
      typeEvaluation = 'expediteur_vers_conducteur';
      evalueId = conducteurId;
    } else {
      typeEvaluation = 'conducteur_vers_expediteur';
      evalueId = expediteurId;
    }
    
    // Vérifier si l'évaluation n'existe pas déjà
    const evaluationExistante = await Evaluation.findOne({
      evaluateur: userId,
      evalue: evalueId,
      demande: demandeId
    });
    
    if (evaluationExistante) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cette transaction'
      });
    }
    
    // Créer l'évaluation
    const evaluation = await Evaluation.create({
      ...evaluationData,
      evaluateur: userId,
      evalue: evalueId,
      demande: demandeId,
      annonce: demande.annonce,
      typeEvaluation
    });
    
    // Mettre à jour la référence dans la demande
    if (typeEvaluation === 'expediteur_vers_conducteur') {
      demande.evaluation.expediteurVersConduteur = evaluation._id;
    } else {
      demande.evaluation.conducteurVersExpediteur = evaluation._id;
    }
    await demande.save();
    
    // Populer les données pour la réponse
    await evaluation.populate([
      { path: 'evaluateur', select: 'nom prenom photo' },
      { path: 'evalue', select: 'nom prenom photo' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      data: { evaluation }
    });
    
  } catch (error) {
    console.error('Erreur création évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'évaluation'
    });
  }
};

// @desc    Obtenir les évaluations d'un utilisateur
// @route   GET /api/evaluations/utilisateur/:userId
// @access  Public
const getEvaluationsUtilisateur = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      typeEvaluation,
      sort = '-createdAt'
    } = req.query;
    
    // Vérifier que l'utilisateur existe
    const utilisateur = await User.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const filter = {
      evalue: userId,
      'moderationAdmin.approuvee': true
    };
    
    if (typeEvaluation) {
      filter.typeEvaluation = typeEvaluation;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [evaluations, total, statistiques] = await Promise.all([
      Evaluation.find(filter)
        .populate('evaluateur', 'nom prenom photo badges')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Evaluation.countDocuments(filter),
      Evaluation.statistiquesUtilisateur(userId)
    ]);
    
    res.json({
      success: true,
      data: {
        evaluations,
        statistiques,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération évaluations utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des évaluations'
    });
  }
};

// @desc    Obtenir mes évaluations données
// @route   GET /api/evaluations/mes-evaluations
// @access  Private
const getMesEvaluations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [evaluations, total] = await Promise.all([
      Evaluation.find({ evaluateur: req.user._id })
        .populate('evalue', 'nom prenom photo')
        .populate('demande', 'colis statut')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Evaluation.countDocuments({ evaluateur: req.user._id })
    ]);
    
    res.json({
      success: true,
      data: {
        evaluations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération mes évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos évaluations'
    });
  }
};

// @desc    Obtenir une évaluation par ID
// @route   GET /api/evaluations/:id
// @access  Public
const getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('evaluateur', 'nom prenom photo badges')
      .populate('evalue', 'nom prenom photo')
      .populate('demande', 'colis trajet')
      .populate('annonce', 'titre trajet');
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Vérifier si l'évaluation est approuvée (sauf pour les propriétaires et admins)
    if (!evaluation.moderationAdmin.approuvee) {
      const userId = req.user?._id?.toString();
      const isOwner = userId === evaluation.evaluateur._id.toString() || 
                     userId === evaluation.evalue._id.toString();
      const isAdmin = req.user?.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Évaluation non trouvée'
        });
      }
    }
    
    // Incrémenter le nombre de vues
    await evaluation.incrementerVues();
    
    res.json({
      success: true,
      data: { evaluation }
    });
    
  } catch (error) {
    console.error('Erreur récupération évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'évaluation'
    });
  }
};

// @desc    Répondre à une évaluation
// @route   POST /api/evaluations/:id/reponse
// @access  Private
const repondreEvaluation = async (req, res) => {
  try {
    const { commentaire } = req.body;
    
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Vérifier que c'est la personne évaluée qui répond
    if (evaluation.evalue.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seule la personne évaluée peut répondre'
      });
    }
    
    // Vérifier qu'il n'y a pas déjà une réponse
    if (evaluation.reponse.commentaire) {
      return res.status(400).json({
        success: false,
        message: 'Une réponse a déjà été donnée à cette évaluation'
      });
    }
    
    await evaluation.ajouterReponse(commentaire, req.user._id);
    
    res.json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: { evaluation }
    });
    
  } catch (error) {
    console.error('Erreur réponse évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réponse'
    });
  }
};

// @desc    Marquer une évaluation comme utile
// @route   POST /api/evaluations/:id/utile
// @access  Private
const marquerUtile = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    await evaluation.marquerUtile(req.user._id);
    
    res.json({
      success: true,
      message: 'Évaluation marquée comme utile',
      data: { 
        nombreLikes: evaluation.statistiques.nombreLikes,
        scoreUtilite: evaluation.scoreUtilite
      }
    });
    
  } catch (error) {
    if (error.message === 'Déjà marqué comme utile') {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà marqué cette évaluation comme utile'
      });
    }
    
    console.error('Erreur marquer utile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de l\'évaluation'
    });
  }
};

// @desc    Signaler une évaluation
// @route   POST /api/evaluations/:id/signaler
// @access  Private
const signalerEvaluation = async (req, res) => {
  try {
    const { motif } = req.body;
    
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur n'est pas l'auteur de l'évaluation
    if (evaluation.evaluateur.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas signaler votre propre évaluation'
      });
    }
    
    await evaluation.signaler(motif, req.user._id);
    
    res.json({
      success: true,
      message: 'Évaluation signalée avec succès. Elle sera examinée par notre équipe.'
    });
    
  } catch (error) {
    console.error('Erreur signalement évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement de l\'évaluation'
    });
  }
};

// @desc    Obtenir les évaluations en attente de modération
// @route   GET /api/evaluations/moderation/en-attente
// @access  Private (Admin)
const getEvaluationsEnAttenteModeation = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [evaluations, total] = await Promise.all([
      Evaluation.find({
        $or: [
          { 'moderationAdmin.approuvee': false },
          { 'signalement.signale': true, 'signalement.traite': false }
        ]
      })
        .populate('evaluateur', 'nom prenom photo')
        .populate('evalue', 'nom prenom photo')
        .populate('signalement.signalePar', 'nom prenom')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Evaluation.countDocuments({
        $or: [
          { 'moderationAdmin.approuvee': false },
          { 'signalement.signale': true, 'signalement.traite': false }
        ]
      })
    ]);
    
    res.json({
      success: true,
      data: {
        evaluations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur évaluations modération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des évaluations en modération'
    });
  }
};

// @desc    Modérer une évaluation
// @route   PUT /api/evaluations/:id/moderation
// @access  Private (Admin)
const modererEvaluation = async (req, res) => {
  try {
    const { action, raisonRejet } = req.body; // action: 'approuver', 'rejeter', 'traiter_signalement'
    
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    switch (action) {
      case 'approuver':
        evaluation.moderationAdmin.approuvee = true;
        evaluation.moderationAdmin.dateModeration = new Date();
        evaluation.moderationAdmin.moderateur = req.user._id;
        break;
        
      case 'rejeter':
        evaluation.moderationAdmin.approuvee = false;
        evaluation.moderationAdmin.dateModeration = new Date();
        evaluation.moderationAdmin.moderateur = req.user._id;
        evaluation.moderationAdmin.raisonRejet = raisonRejet;
        break;
        
      case 'traiter_signalement':
        if (evaluation.signalement.signale) {
          await evaluation.traiterSignalement(req.body.decision, req.user._id);
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Action de modération invalide'
        });
    }
    
    await evaluation.save();
    
    res.json({
      success: true,
      message: 'Évaluation modérée avec succès',
      data: { evaluation }
    });
    
  } catch (error) {
    console.error('Erreur modération évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modération de l\'évaluation'
    });
  }
};

// @desc    Obtenir les statistiques globales des évaluations
// @route   GET /api/evaluations/statistiques
// @access  Private (Admin)
const getStatistiquesEvaluations = async (req, res) => {
  try {
    const [statsGlobales, topUtilisateurs] = await Promise.all([
      Evaluation.statistiquesGlobales(),
      Evaluation.topUtilisateurs(10)
    ]);
    
    res.json({
      success: true,
      data: {
        statistiques: statsGlobales,
        topUtilisateurs
      }
    });
    
  } catch (error) {
    console.error('Erreur statistiques évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

// @desc    Vérifier si l'utilisateur peut évaluer une demande
// @route   GET /api/evaluations/peut-evaluer/:demandeId
// @access  Private
const peutEvaluer = async (req, res) => {
  try {
    const { demandeId } = req.params;
    
    const demande = await Demande.findById(demandeId)
      .populate('expediteur conducteur');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    const userId = req.user._id.toString();
    const expediteurId = demande.expediteur._id.toString();
    const conducteurId = demande.conducteur._id.toString();
    
    // Vérifier que l'utilisateur fait partie de la transaction
    if (userId !== expediteurId && userId !== conducteurId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à évaluer cette transaction'
      });
    }
    
    // Vérifier que la demande est terminée
    if (demande.statut !== 'livree') {
      return res.json({
        success: true,
        data: {
          peutEvaluer: false,
          raison: 'La demande n\'est pas encore terminée'
        }
      });
    }
    
    // Déterminer qui peut être évalué
    let evalueId;
    if (userId === expediteurId) {
      evalueId = conducteurId;
    } else {
      evalueId = expediteurId;
    }
    
    // Vérifier si l'évaluation n'existe pas déjà
    const evaluationExistante = await Evaluation.findOne({
      evaluateur: userId,
      evalue: evalueId,
      demande: demandeId
    });
    
    if (evaluationExistante) {
      return res.json({
        success: true,
        data: {
          peutEvaluer: false,
          raison: 'Vous avez déjà évalué cette transaction',
          evaluationId: evaluationExistante._id
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        peutEvaluer: true,
        evalueId,
        demande: {
          id: demande._id,
          statut: demande.statut,
          colis: demande.colis,
          expediteur: demande.expediteur,
          conducteur: demande.conducteur
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur vérification évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

// @desc    Obtenir le résumé des évaluations pour un utilisateur
// @route   GET /api/evaluations/resume/:userId
// @access  Public
const getResumeEvaluations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const utilisateur = await User.findById(userId);
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const statistiques = await Evaluation.statistiquesUtilisateur(userId);
    
    // Obtenir les 3 dernières évaluations
    const dernieresEvaluations = await Evaluation.find({
      evalue: userId,
      'moderationAdmin.approuvee': true
    })
      .populate('evaluateur', 'nom prenom photo')
      .sort({ createdAt: -1 })
      .limit(3)
      .select('note commentaire avantages createdAt');
    
    res.json({
      success: true,
      data: {
        statistiques,
        dernieresEvaluations,
        utilisateur: {
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          photo: utilisateur.photo,
          badges: utilisateur.badges,
          statistiques: utilisateur.statistiques
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur résumé évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du résumé'
    });
  }
};

// @desc    Rechercher des évaluations
// @route   GET /api/evaluations/rechercher
// @access  Public
const rechercherEvaluations = async (req, res) => {
  try {
    const {
      q, // terme de recherche
      note,
      typeEvaluation,
      recommande,
      page = 1,
      limit = 10
    } = req.query;
    
    const filter = { 'moderationAdmin.approuvee': true };
    
    // Recherche textuelle
    if (q) {
      filter.$text = { $search: q };
    }
    
    // Filtres
    if (note) {
      filter.note = { $gte: parseFloat(note) };
    }
    
    if (typeEvaluation) {
      filter.typeEvaluation = typeEvaluation;
    }
    
    if (recommande !== undefined) {
      filter.recommande = recommande === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [evaluations, total] = await Promise.all([
      Evaluation.find(filter)
        .populate('evaluateur', 'nom prenom photo')
        .populate('evalue', 'nom prenom photo')
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Evaluation.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        evaluations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur recherche évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

// @desc    Supprimer une évaluation
// @route   DELETE /api/evaluations/:id
// @access  Private
const supprimerEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est l'auteur de l'évaluation ou un admin
    const userId = req.user._id.toString();
    const isAuthor = evaluation.evaluateur.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cette évaluation'
      });
    }
    
    await evaluation.remove();
    
    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'évaluation'
    });
  }
};

// @desc    Mettre à jour une évaluation
// @route   PUT /api/evaluations/:id
// @access  Private
const mettreAJourEvaluation = async (req, res) => {
  try {
    const { note, commentaire, avantages, inconvenients, recommande } = req.body;
    
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est l'auteur de l'évaluation
    if (evaluation.evaluateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette évaluation'
      });
    }
    
    // Vérifier que l'évaluation n'a pas encore été approuvée par l'admin
    if (evaluation.moderationAdmin.approuvee) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez plus modifier une évaluation approuvée'
      });
    }
    
    // Mettre à jour les champs
    if (note !== undefined) evaluation.note = note;
    if (commentaire !== undefined) evaluation.commentaire = commentaire;
    if (avantages !== undefined) evaluation.avantages = avantages;
    if (inconvenients !== undefined) evaluation.inconvenients = inconvenients;
    if (recommande !== undefined) evaluation.recommande = recommande;
    
    evaluation.dateModification = new Date();
    
    await evaluation.save();
    
    // Populer les données pour la réponse
    await evaluation.populate([
      { path: 'evaluateur', select: 'nom prenom photo' },
      { path: 'evalue', select: 'nom prenom photo' }
    ]);
    
    res.json({
      success: true,
      message: 'Évaluation mise à jour avec succès',
      data: { evaluation }
    });
    
  } catch (error) {
    console.error('Erreur mise à jour évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'évaluation'
    });
  }
};

module.exports = {
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
  rechercherEvaluations,
  supprimerEvaluation,
  mettreAJourEvaluation
};