// backend/controllers/annonceController.js
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const Demande = require('../models/Demande');
const { sendNotification } = require('../utils/emailService');
const mongoose = require('mongoose');

// @desc    Créer une nouvelle annonce
// @route   POST /api/annonces
// @access  Private (Conducteur)
const createAnnonce = async (req, res) => {
  try {
    const annonceData = {
      ...req.body,
      conducteur: req.user._id
    };
    
    // Vérifier que l'utilisateur est un conducteur
    if (req.user.role !== 'conducteur') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les conducteurs peuvent créer des annonces'
      });
    }

    // Validation manuelle améliorée
    const annonce = new Annonce(annonceData);
    const validationError = annonce.validateSync();
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Certains champs sont manquants ou invalides.",
        errors: errors
      });
    }

    await annonce.save();
    
    // Populer les données du conducteur
    await annonce.populate('conducteur', 'nom prenom photo badges');
    
    // Mettre à jour les statistiques du conducteur
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistiques.nombreAnnonces': 1 }
    });
    
    // ✅ Correction ici
    res.status(201).json({
      success: true,
      message: "Annonce créée avec succès",
      annonce: annonce
    });
    
  } catch (error) {
    console.error('Erreur création annonce:', error);
    // Gérer les erreurs de validation qui ne sont pas attrapées par validateSync (ex: erreurs uniques)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
       return res.status(400).json({
        success: false,
        message: 'Erreur de validation.',
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'annonce',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtenir toutes les annonces avec filtres
// @route   GET /api/annonces
// @access  Public
const getAnnonces = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      villeDepart,
      villeDestination,
      dateMin,
      dateMax,
      prixMin,
      prixMax,
      typesMarchandise,
      statut = 'active'
    } = req.query;
    
    // Construction du filtre
    const filter = { statut };
    
    // Filtres géographiques
    if (villeDepart) {
      filter['trajet.depart.ville'] = new RegExp(villeDepart, 'i');
    }
    if (villeDestination) {
      filter['trajet.destination.ville'] = new RegExp(villeDestination, 'i');
    }
    
    // Filtres de date
    if (dateMin || dateMax) {
      filter['planning.dateDepart'] = {};
      if (dateMin) filter['planning.dateDepart'].$gte = new Date(dateMin);
      if (dateMax) filter['planning.dateDepart'].$lte = new Date(dateMax);
    }
    
    // Filtres de prix
    if (prixMin || prixMax) {
      filter.$or = [
        { 'tarification.prixParKg': {} },
        { 'tarification.prixFixe': {} }
      ];
      
      if (prixMin) {
        filter.$or[0]['tarification.prixParKg'].$gte = parseFloat(prixMin);
        filter.$or[1]['tarification.prixFixe'].$gte = parseFloat(prixMin);
      }
      if (prixMax) {
        filter.$or[0]['tarification.prixParKg'].$lte = parseFloat(prixMax);
        filter.$or[1]['tarification.prixFixe'].$lte = parseFloat(prixMax);
      }
    }
    
    // Filtre par types de marchandise
    if (typesMarchandise) {
      const types = Array.isArray(typesMarchandise) ? typesMarchandise : [typesMarchandise];
      filter.typesMarchandise = { $in: types };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécution de la requête
    const [annonces, total] = await Promise.all([
      Annonce.find(filter)
        .populate('conducteur', 'nom prenom photo badges statistiques')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Annonce.countDocuments(filter)
    ]);
    
    // Calcul des métadonnées de pagination
    const pages = Math.ceil(total / parseInt(limit));
    const hasNext = parseInt(page) < pages;
    const hasPrev = parseInt(page) > 1;
    
    res.json({
      success: true,
      data: {
        annonces,
        pagination: {
          currentPage: parseInt(page),
          totalPages: pages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext,
          hasPrev
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération annonces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces'
    });
  }
};

// @desc    Obtenir une annonce par ID
// @route   GET /api/annonces/:id
// @access  Public
const getAnnonce = async (req, res) => {
  try {
    const annonceId = req.params.id;
    const annonce = await Annonce.findById(annonceId)
      .populate('conducteur', 'nom prenom photo badges statistiques telephone')
      .populate({
        path: 'commentaires.utilisateur',
        select: 'nom prenom photo'
      })
      .lean();

    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // N'incrémente pas les vues si le propriétaire de l'annonce la consulte
    const isOwner = req.user && req.user._id.toString() === annonce.conducteur?._id.toString();

    if (!isOwner) {
      await Annonce.updateOne(
        { _id: annonceId },
        { $inc: { 'statistiques.nombreVues': 1 } }
      );
    }

    res.json({
      success: true,
      data: annonce
    });

  } catch (error) {
    console.error('Erreur récupération annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'annonce'
    });
  }
};

// @desc    Mettre à jour une annonce
// @route   PUT /api/annonces/:id
// @access  Private (Propriétaire ou Admin)
const updateAnnonce = async (req, res) => {
  try {
    const annonceId = req.params.id;
    const { status, ...otherData } = req.body;

    // 1. Vérifier l'existence de l'annonce et les permissions
    const annonce = await Annonce.findById(annonceId).select('conducteur').lean();
    if (!annonce) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }
    if (annonce.conducteur.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // 2. Si seule la mise à jour du statut est demandée, utiliser une méthode directe.
    if (status && Object.keys(otherData).length === 0) {
      await Annonce.updateOne({ _id: annonceId }, { $set: { statut: status } });
    } else {
      // 3. Pour les autres mises à jour, appliquer les données
      await Annonce.updateOne({ _id: annonceId }, { $set: req.body });
    }
    
    // 4. Récupérer l'annonce mise à jour pour la renvoyer
    const updatedAnnonce = await Annonce.findById(annonceId)
      .populate('conducteur', 'nom prenom photo badges')
      .lean();

    res.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      annonce: updatedAnnonce,
    });

  } catch (error) {
    console.error('Erreur mise à jour annonce:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

// @desc    Supprimer une annonce
// @route   DELETE /api/annonces/:id
// @access  Private (Propriétaire ou Admin)
const deleteAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    // Vérifier les permissions
    if (annonce.conducteur.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette annonce'
      });
    }
    
    // Vérifier s'il y a des demandes en cours
    const demandesEnCours = await Demande.countDocuments({
      annonce: annonce._id,
      statut: { $in: ['acceptee', 'en_cours', 'enlevee', 'en_transit'] }
    });
    
    if (demandesEnCours > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une annonce avec des transports en cours'
      });
    }
    
    // Supprimer l'annonce et toutes les demandes associées
    await Promise.all([
      Annonce.findByIdAndDelete(req.params.id),
      Demande.deleteMany({ annonce: req.params.id })
    ]);
    
    // Mettre à jour les statistiques du conducteur
    await User.findByIdAndUpdate(annonce.conducteur, {
      $inc: { 'statistiques.nombreAnnonces': -1 }
    });
    
    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'annonce'
    });
  }
};

// @desc    Obtenir les annonces de l'utilisateur connecté
// @route   GET /api/annonces/mes-annonces/liste
// @access  Private (Conducteur ou Expediteur)
const getMesAnnonces = async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] - getMesAnnonces: Début du traitement pour l'utilisateur ${req.user._id}`);
  try {
    console.log(`[${new Date().toISOString()}] - getMesAnnonces: Interrogation de la base de données...`);
    const annonces = await Annonce.find({ conducteur: req.user._id })
      .populate('conducteur', 'nom prenom photo badges')
      .sort({ createdAt: -1 })
      .lean();
    console.log(`[${new Date().toISOString()}] - getMesAnnonces: Récupération de ${annonces.length} annonces depuis la base de données. Temps écoulé: ${Date.now() - startTime}ms`);
    res.json({
      success: true,
      annonces: annonces,
    });
    console.log(`[${new Date().toISOString()}] - getMesAnnonces: Réponse envoyée. Temps total: ${Date.now() - startTime}ms`);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] - getMesAnnonces: Erreur après ${totalTime}ms.`, error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
};

// @desc    Rechercher des annonces
// @route   GET /api/annonces/rechercher
// @access  Public
const rechercherAnnonces = async (req, res) => {
  try {
    const {
      depart,
      destination,
      date,
      poids,
      longueur,
      largeur,
      hauteur,
      type
    } = req.query;
    
    const filter = { statut: 'active' };
    
    // Filtres obligatoires
    if (depart) {
      filter['trajet.depart.ville'] = new RegExp(depart, 'i');
    }
    if (destination) {
      filter['trajet.destination.ville'] = new RegExp(destination, 'i');
    }
    if (date) {
      const dateRecherche = new Date(date);
      filter['planning.dateDepart'] = {
        $gte: dateRecherche,
        $lte: new Date(dateRecherche.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    let annonces = await Annonce.find(filter)
      .populate('conducteur', 'nom prenom photo badges statistiques')
      .sort({ 'planning.dateDepart': 1 })
      .lean();
    
    // Filtrer par capacité si spécifiée
    if (poids || longueur || largeur || hauteur) {
      annonces = annonces.filter(annonce => {
        const capacite = annonce.capacite;
        
        if (poids && capacite.poidsMax < parseFloat(poids)) return false;
        if (longueur && capacite.dimensionsMax.longueur < parseFloat(longueur)) return false;
        if (largeur && capacite.dimensionsMax.largeur < parseFloat(largeur)) return false;
        if (hauteur && capacite.dimensionsMax.hauteur < parseFloat(hauteur)) return false;
        
        return true;
      });
    }
    
    // Filtrer par type de marchandise
    if (type) {
      annonces = annonces.filter(annonce => 
        annonce.typesMarchandise.includes(type)
      );
    }
    
    res.json({
      success: true,
      data: {
        annonces,
        total: annonces.length
      }
    });
    
  } catch (error) {
    console.error('Erreur recherche annonces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

// @desc    Ajouter un commentaire à une annonce
// @route   POST /api/annonces/:id/commentaires
// @access  Private
const ajouterCommentaire = async (req, res) => {
  try {
    const { message } = req.body;
    const annonce = await Annonce.findById(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    await annonce.ajouterCommentaire(req.user._id, message);
    
    await annonce.populate({
      path: 'commentaires.utilisateur',
      select: 'nom prenom photo'
    });
    
    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: { 
        commentaires: annonce.commentaires 
      }
    });
    
  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire'
    });
  }
};

// @desc    Obtenir les statistiques des annonces
// @route   GET /api/annonces/statistiques
// @access  Private (Admin)
const getStatistiques = async (req, res) => {
  try {
    const stats = await Annonce.statistiquesGlobales();
    const topDestinations = await Annonce.topDestinations(10);
    
    res.json({
      success: true,
      data: {
        statistiques: stats,
        topDestinations
      }
    });
    
  } catch (error) {
    console.error('Erreur statistiques annonces:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

module.exports = {
  createAnnonce,
  getAnnonces,
  getAnnonce,
  updateAnnonce,
  deleteAnnonce,
  getMesAnnonces,
  rechercherAnnonces,
  ajouterCommentaire,
  getStatistiques
};