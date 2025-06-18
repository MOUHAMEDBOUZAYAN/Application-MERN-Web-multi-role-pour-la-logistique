// backend/controllers/demandeController.js
const Demande = require('../models/Demande');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const { sendNotification } = require('../utils/emailService');

// @desc    Créer une nouvelle demande
// @route   POST /api/demandes
// @access  Private (Expéditeur)
const createDemande = async (req, res) => {
  try {
    const { annonce: annonceId, ...demandeData } = req.body;
    
    // Vérifier que l'utilisateur est un expéditeur
    if (req.user.role !== 'expediteur') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les expéditeurs peuvent créer des demandes'
      });
    }
    
    // Récupérer l'annonce
    const annonce = await Annonce.findById(annonceId)
      .populate('conducteur', 'nom prenom email preferences');
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier que l'annonce est active
    if (annonce.statut !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cette annonce n\'est plus disponible'
      });
    }
    
    // Vérifier que l'expéditeur ne peut pas faire une demande sur sa propre annonce
    if (annonce.conducteur._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas faire une demande sur votre propre annonce'
      });
    }
    
    // Vérifier que l'expéditeur n'a pas déjà fait une demande pour cette annonce
    const demandeExistante = await Demande.findOne({
      expediteur: req.user._id,
      annonce: annonceId,
      statut: { $in: ['en_attente', 'acceptee', 'en_cours', 'enlevee', 'en_transit'] }
    });
    
    if (demandeExistante) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà une demande en cours pour cette annonce'
      });
    }
    
    // Vérifier la compatibilité du colis avec la capacité de l'annonce
    const { dimensions, poids } = demandeData.colis;
    if (!annonce.peutAccepterColis(dimensions, poids)) {
      return res.status(400).json({
        success: false,
        message: 'Votre colis dépasse la capacité disponible'
      });
    }
    
    // Vérifier la compatibilité du type de marchandise
    if (!annonce.typesMarchandise.includes(demandeData.colis.type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de marchandise non accepté pour cette annonce'
      });
    }
    
    // Créer la demande
    const demande = await Demande.create({
      ...demandeData,
      expediteur: req.user._id,
      conducteur: annonce.conducteur._id,
      annonce: annonceId,
      dates: {
        dateCreation: new Date()
      }
    });
    
    // Mettre à jour les statistiques de l'annonce
    await annonce.ajouterDemande();
    
    // Mettre à jour les statistiques de l'expéditeur
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistiques.nombreDemandesEnvoyees': 1 }
    });
    
    // Populer les données pour la réponse
    await demande.populate([
      { path: 'expediteur', select: 'nom prenom photo' },
      { path: 'conducteur', select: 'nom prenom photo' },
      { path: 'annonce', select: 'titre trajet planning' }
    ]);
    
    // Envoyer une notification au conducteur
    try {
      await sendNotification(annonce.conducteur._id, 'demande_recue', {
        expediteurNom: req.user.nomComplet,
        titreAnnonce: annonce.titre,
        villeDepart: annonce.trajet.depart.ville,
        villeDestination: annonce.trajet.destination.ville,
        descriptionColis: demandeData.colis.description,
        montant: demandeData.tarification.montantPropose,
        lienDemande: `${process.env.FRONTEND_URL}/conducteur/demandes/${demande._id}`
      });
    } catch (emailError) {
      console.error('Erreur envoi notification:', emailError);
      // Ne pas bloquer la création de la demande
    }
    
    res.status(201).json({
      success: true,
      message: 'Demande créée avec succès',
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur création demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la demande'
    });
  }
};

// @desc    Obtenir les demandes du conducteur
// @route   GET /api/demandes/conducteur
// @access  Private (Conducteur)
const getDemandesConducteur = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      statut,
      sort = '-createdAt'
    } = req.query;
    
    const filter = { conducteur: req.user._id };
    if (statut) filter.statut = statut;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [demandes, total] = await Promise.all([
      Demande.find(filter)
        .populate('expediteur', 'nom prenom photo badges statistiques')
        .populate('annonce', 'titre trajet planning')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Demande.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        demandes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération demandes conducteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes'
    });
  }
};

// @desc    Obtenir les demandes de l'expéditeur
// @route   GET /api/demandes/expediteur
// @access  Private (Expéditeur)
const getDemandesExpediteur = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      statut,
      sort = '-createdAt'
    } = req.query;
    
    const filter = { expediteur: req.user._id };
    if (statut) filter.statut = statut;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [demandes, total] = await Promise.all([
      Demande.find(filter)
        .populate('conducteur', 'nom prenom photo badges statistiques')
        .populate('annonce', 'titre trajet planning vehicule')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Demande.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        demandes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération demandes expéditeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos demandes'
    });
  }
};

// @desc    Obtenir une demande par ID
// @route   GET /api/demandes/:id
// @access  Private (Propriétaire)
const getDemande = async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id)
      .populate('expediteur', 'nom prenom telephone photo badges')
      .populate('conducteur', 'nom prenom telephone photo badges')
      .populate('annonce', 'titre trajet planning vehicule tarification');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier les permissions
    const userId = req.user._id.toString();
    if (demande.expediteur._id.toString() !== userId && 
        demande.conducteur._id.toString() !== userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette demande'
      });
    }
    
    res.json({
      success: true,
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur récupération demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la demande'
    });
  }
};

// @desc    Répondre à une demande (accepter/refuser)
// @route   PUT /api/demandes/:id/reponse
// @access  Private (Conducteur propriétaire)
const repondreDemande = async (req, res) => {
  try {
    const { action, commentaire } = req.body; // action: 'accepter' ou 'refuser'
    
    const demande = await Demande.findById(req.params.id)
      .populate('expediteur', 'nom prenom email')
      .populate('annonce', 'titre trajet');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que c'est le conducteur de la demande
    if (demande.conducteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le conducteur peut répondre à cette demande'
      });
    }
    
    // Vérifier que la demande est en attente
    if (demande.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande a déjà reçu une réponse'
      });
    }
    
    let nouveauStatut;
    let message;
    
    if (action === 'accepter') {
      // Mettre à jour les statistiques de l'annonce
      const annonce = await Annonce.findById(demande.annonce);
      await annonce.accepterDemande();
      
      // Mettre à jour les statistiques du conducteur
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'statistiques.nombreDemandesAcceptees': 1 }
      });
      
      // Envoyer notification à l'expéditeur
      try {
        await sendNotification(demande.expediteur._id, 'demande_acceptee', {
          expediteurNom: demande.expediteur.nom,
          conducteurNom: req.user.nomComplet,
          conducteurTelephone: req.user.telephone,
          numeroSuivi: demande.suivi.numeroSuivi,
          datePrevu: demande.annonce.planning.dateDepart,
          lienSuivi: `${process.env.FRONTEND_URL}/expediteur/suivi/${demande._id}`
        });
      } catch (emailError) {
        console.error('Erreur notification acceptation:', emailError);
      }
      
    } else if (action === 'refuser') {
      nouveauStatut = 'refusee';
      message = 'Demande refusée';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action invalide. Utilisez "accepter" ou "refuser"'
      });
    }
    
    // Changer le statut de la demande
    await demande.changerStatut(nouveauStatut, commentaire, req.user._id);
    
    res.json({
      success: true,
      message,
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur réponse demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réponse à la demande'
    });
  }
};

// @desc    Mettre à jour le statut d'une demande
// @route   PUT /api/demandes/:id/statut
// @access  Private (Conducteur)
const updateStatutDemande = async (req, res) => {
  try {
    const { statut, commentaire } = req.body;
    
    const demande = await Demande.findById(req.params.id)
      .populate('expediteur', 'nom prenom email');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que c'est le conducteur
    if (demande.conducteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le conducteur peut mettre à jour le statut'
      });
    }
    
    // Vérifier la progression logique des statuts
    const progressionValide = {
      'acceptee': ['en_cours', 'annulee'],
      'en_cours': ['enlevee', 'annulee'],
      'enlevee': ['en_transit'],
      'en_transit': ['livree'],
      'livree': [], // État final
      'annulee': [] // État final
    };
    
    const statutsAutorises = progressionValide[demande.statut] || [];
    
    if (!statutsAutorises.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Impossible de passer de "${demande.statut}" à "${statut}"`
      });
    }
    
    // Changer le statut
    await demande.changerStatut(statut, commentaire, req.user._id);
    
    // Envoyer notification si livré
    if (statut === 'livree') {
      try {
        await sendNotification(demande.expediteur._id, 'colis_livre', {
          expediteurNom: demande.expediteur.nom,
          numeroSuivi: demande.suivi.numeroSuivi,
          dateLivraison: new Date().toLocaleDateString('fr-FR'),
          lienEvaluation: `${process.env.FRONTEND_URL}/expediteur/evaluation/${demande._id}`
        });
      } catch (emailError) {
        console.error('Erreur notification livraison:', emailError);
      }
    }
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// @desc    Annuler une demande
// @route   PUT /api/demandes/:id/annuler
// @access  Private (Expéditeur propriétaire)
const annulerDemande = async (req, res) => {
  try {
    const { motif } = req.body;
    
    const demande = await Demande.findById(req.params.id);
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que c'est l'expéditeur
    if (demande.expediteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'expéditeur peut annuler cette demande'
      });
    }
    
    // Vérifier si la demande peut être annulée
    if (!demande.peutEtreAnnulee()) {
      return res.status(400).json({
        success: false,
        message: 'Cette demande ne peut plus être annulée'
      });
    }
    
    // Annuler la demande
    await demande.changerStatut('annulee', motif, req.user._id);
    
    res.json({
      success: true,
      message: 'Demande annulée avec succès',
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur annulation demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la demande'
    });
  }
};

// @desc    Ajouter une communication à la demande
// @route   POST /api/demandes/:id/communications
// @access  Private (Propriétaire)
const ajouterCommunication = async (req, res) => {
  try {
    const { message, type = 'message' } = req.body;
    
    const demande = await Demande.findById(req.params.id);
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier les permissions
    const userId = req.user._id.toString();
    if (demande.expediteur.toString() !== userId && 
        demande.conducteur.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    await demande.ajouterCommunication(req.user._id, message, type);
    
    res.json({
      success: true,
      message: 'Communication ajoutée avec succès',
      data: { communications: demande.communications }
    });
    
  } catch (error) {
    console.error('Erreur ajout communication:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la communication'
    });
  }
};

// @desc    Mettre à jour la position du colis
// @route   PUT /api/demandes/:id/position
// @access  Private (Conducteur)
const updatePosition = async (req, res) => {
  try {
    const { latitude, longitude, adresse } = req.body;
    
    const demande = await Demande.findById(req.params.id);
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier que c'est le conducteur
    if (demande.conducteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le conducteur peut mettre à jour la position'
      });
    }
    
    // Vérifier que la demande est en transit
    if (!['enlevee', 'en_transit'].includes(demande.statut)) {
      return res.status(400).json({
        success: false,
        message: 'La position ne peut être mise à jour que pour un colis en transit'
      });
    }
    
    await demande.mettreAJourPosition(latitude, longitude, adresse);
    
    res.json({
      success: true,
      message: 'Position mise à jour avec succès',
      data: { position: demande.suivi.positionActuelle }
    });
    
  } catch (error) {
    console.error('Erreur mise à jour position:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position'
    });
  }
};

// @desc    Rechercher une demande par numéro de suivi
// @route   GET /api/demandes/suivi/:numeroSuivi
// @access  Public
const suivreDemande = async (req, res) => {
  try {
    const { numeroSuivi } = req.params;
    
    const demande = await Demande.findByNumeroSuivi(numeroSuivi);
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Numéro de suivi invalide'
      });
    }
    
    // Retourner seulement les informations publiques
    const infosSuivi = {
      numeroSuivi: demande.suivi.numeroSuivi,
      statut: demande.statut,
      dateCreation: demande.dates.dateCreation,
      dateEnlevement: demande.dates.dateEnlevement,
      dateLivraisonPrevue: demande.dates.dateLivraisonPrevue,
      dateLivraisonReelle: demande.dates.dateLivraisonReelle,
      positionActuelle: demande.suivi.positionActuelle,
      etapes: demande.suivi.etapes,
      trajet: {
        depart: demande.annonce.trajet.depart.ville,
        destination: demande.annonce.trajet.destination.ville
      }
    };
    
    res.json({
      success: true,
      data: { suivi: infosSuivi }
    });
    
  } catch (error) {
    console.error('Erreur suivi demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du suivi de la demande'
    });
  }
};

// @desc    Signaler un litige
// @route   POST /api/demandes/:id/litige
// @access  Private (Propriétaire)
const signalerLitige = async (req, res) => {
  try {
    const { motif } = req.body;
    
    const demande = await Demande.findById(req.params.id);
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    // Vérifier les permissions
    const userId = req.user._id.toString();
    if (demande.expediteur.toString() !== userId && 
        demande.conducteur.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    await demande.signalerLitige(motif, req.user._id);
    
    res.json({
      success: true,
      message: 'Litige signalé avec succès. Un administrateur va examiner le cas.',
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur signalement litige:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement du litige'
    });
  }
};

// @desc    Obtenir les statistiques des demandes
// @route   GET /api/demandes/statistiques
// @access  Private (Admin)
const getStatistiques = async (req, res) => {
  try {
    const stats = await Demande.statistiquesGlobales();
    const parStatut = await Demande.demandesParStatut();
    
    res.json({
      success: true,
      data: {
        statistiques: stats,
        repartitionStatuts: parStatut
      }
    });
    
  } catch (error) {
    console.error('Erreur statistiques demandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

module.exports = {
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
};