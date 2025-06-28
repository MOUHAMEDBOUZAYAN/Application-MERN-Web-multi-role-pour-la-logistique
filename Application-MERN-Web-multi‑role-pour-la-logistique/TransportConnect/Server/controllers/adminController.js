// backend/controllers/adminController.js
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const Demande = require('../models/Demande');
const Evaluation = require('../models/Evaluation');
const { sendWelcomeAdmin } = require('../utils/emailService');
const { generateToken } = require('../config/jwt');

// @desc    Obtenir les statistiques globales de la plateforme
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res) => {
  try {
    const [
      statsUtilisateurs,
      statsAnnonces,
      statsDemandes,
      statsEvaluations,
      croissanceUtilisateurs,
      revenus
    ] = await Promise.all([
      // Statistiques utilisateurs
      User.statistiquesGlobales(),
      
      // Statistiques annonces
      Annonce.statistiquesGlobales(),
      
      // Statistiques demandes
      Demande.statistiquesGlobales(),
      
      // Statistiques évaluations
      Evaluation.statistiquesGlobales(),
      
      // Croissance utilisateurs (12 derniers mois)
      User.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
          }
        },
        {
          $group: {
            _id: {
              annee: { $year: '$createdAt' },
              mois: { $month: '$createdAt' }
            },
            nouveauxUtilisateurs: { $sum: 1 }
          }
        },
        { $sort: { '_id.annee': 1, '_id.mois': 1 } }
      ]),
      
      // Revenus mensuels
      Demande.aggregate([
        {
          $match: {
            statut: 'livree',
            'dates.dateLivraisonReelle': { 
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
          }
        },
        {
          $group: {
            _id: {
              annee: { $year: '$dates.dateLivraisonReelle' },
              mois: { $month: '$dates.dateLivraisonReelle' }
            },
            revenus: { $sum: '$tarification.montantAccepte' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.annee': 1, '_id.mois': 1 } }
      ])
    ]);
    
    // Activité récente
    const activiteRecente = await Promise.all([
      User.find({ statut: 'actif' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('nom prenom email role createdAt'),
      
      Annonce.find({ statut: 'active' })
        .populate('conducteur', 'nom prenom')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('titre trajet conducteur createdAt'),
      
      Demande.find()
        .populate('expediteur', 'nom prenom')
        .populate('conducteur', 'nom prenom')
        .sort({ 'dates.dateCreation': -1 })
        .limit(5)
        .select('statut expediteur conducteur dates')
    ]);
    
    res.json({
      success: true,
      data: {
        statistiques: {
          utilisateurs: statsUtilisateurs,
          annonces: statsAnnonces,
          demandes: statsDemandes,
          evaluations: statsEvaluations
        },
        croissance: {
          utilisateurs: croissanceUtilisateurs,
          revenus: revenus
        },
        activiteRecente: {
          nouveauxUtilisateurs: activiteRecente[0],
          nouvellesAnnonces: activiteRecente[1],
          dernieresDemandes: activiteRecente[2]
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du tableau de bord'
    });
  }
};

// @desc    Gestion des utilisateurs
// @route   GET /api/admin/utilisateurs
// @access  Private (Admin)
const getUtilisateurs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      statut,
      role,
      recherche,
      sort = '-createdAt'
    } = req.query;
    
    const filter = {};
    
    if (statut) filter.statut = statut;
    if (role) filter.role = role;
    if (recherche) {
      filter.$or = [
        { nom: { $regex: recherche, $options: 'i' } },
        { prenom: { $regex: recherche, $options: 'i' } },
        { email: { $regex: recherche, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [utilisateurs, total] = await Promise.all([
      User.find(filter)
        .select('nom prenom email telephone role statut badges createdAt derniereConnexion')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        utilisateurs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// @desc    Modifier le statut d'un utilisateur
// @route   PUT /api/admin/utilisateurs/:id/statut
// @access  Private (Admin)
const modifierStatutUtilisateur = async (req, res) => {
  try {
    const { statut, raison } = req.body;
    
    if (!['actif', 'suspendu', 'en_attente'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const utilisateur = await User.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Empêcher la modification d'un autre admin
    if (utilisateur.role === 'admin' && utilisateur._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de modifier le statut d\'un autre administrateur'
      });
    }
    
    const ancienStatut = utilisateur.statut;
    utilisateur.statut = statut;
    
    // Ajouter un historique de modération (vous pouvez créer un modèle dédié)
    if (!utilisateur.moderationHistorique) {
      utilisateur.moderationHistorique = [];
    }
    
    utilisateur.moderationHistorique.push({
      action: `Statut changé de ${ancienStatut} vers ${statut}`,
      raison: raison,
      moderateur: req.user._id,
      date: new Date()
    });
    
    await utilisateur.save();
    
    res.json({
      success: true,
      message: `Statut utilisateur modifié vers "${statut}" avec succès`,
      data: { utilisateur }
    });
    
  } catch (error) {
    console.error('Erreur modification statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
};

// @desc    Attribuer ou retirer un badge
// @route   PUT /api/admin/utilisateurs/:id/badges
// @access  Private (Admin)
const gererBadge = async (req, res) => {
  try {
    const { action, typeBadge } = req.body; // action: 'ajouter' ou 'retirer'
    
    const utilisateur = await User.findById(req.params.id);
    
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const badgesValides = ['verifie', 'conducteur_experimente', 'expediteur_fiable'];
    
    if (!badgesValides.includes(typeBadge)) {
      return res.status(400).json({
        success: false,
        message: 'Type de badge invalide'
      });
    }
    
    if (action === 'ajouter') {
      await utilisateur.ajouterBadge(typeBadge);
    } else if (action === 'retirer') {
      await utilisateur.supprimerBadge(typeBadge);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action invalide. Utilisez "ajouter" ou "retirer"'
      });
    }
    
    res.json({
      success: true,
      message: `Badge ${typeBadge} ${action === 'ajouter' ? 'attribué' : 'retiré'} avec succès`,
      data: { badges: utilisateur.badges }
    });
    
  } catch (error) {
    console.error('Erreur gestion badge:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion du badge'
    });
  }
};

// @desc    Gestion des annonces
// @route   GET /api/admin/annonces
// @access  Private (Admin)
const getAnnonces = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      statut,
      recherche,
      sort = '-createdAt'
    } = req.query;
    
    const filter = {};
    
    if (statut) filter.statut = statut;
    if (recherche) {
      filter.$or = [
        { titre: { $regex: recherche, $options: 'i' } },
        { 'trajet.depart.ville': { $regex: recherche, $options: 'i' } },
        { 'trajet.destination.ville': { $regex: recherche, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [annonces, total] = await Promise.all([
      Annonce.find(filter)
        .populate('conducteur', 'nom prenom email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Annonce.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        annonces,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération annonces admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces'
    });
  }
};

// @desc    Modifier le statut d'une annonce
// @route   PUT /api/admin/annonces/:id/statut
// @access  Private (Admin)
const modifierStatutAnnonce = async (req, res) => {
  try {
    const { statut, raison } = req.body;
    
    const annonce = await Annonce.findById(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }
    
    annonce.statut = statut;
    annonce.moderationAdmin.verifie = statut === 'active';
    annonce.moderationAdmin.dateVerification = new Date();
    annonce.moderationAdmin.adminVerificateur = req.user._id;
    
    if (statut === 'suspendue') {
      annonce.moderationAdmin.raisonSuspension = raison;
    }
    
    await annonce.save();
    
    res.json({
      success: true,
      message: `Statut de l'annonce modifié vers "${statut}" avec succès`,
      data: { annonce }
    });
    
  } catch (error) {
    console.error('Erreur modification statut annonce:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut de l\'annonce'
    });
  }
};

// @desc    Supprimer une annonce
// @route   DELETE /api/admin/annonces/:id
// @access  Private (Admin)
const supprimerAnnonce = async (req, res) => {
  try {
    const { raison } = req.body;
    
    const annonce = await Annonce.findById(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
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
    
    // Archiver l'annonce au lieu de la supprimer complètement
    annonce.statut = 'supprimee';
    annonce.moderationAdmin.raisonSuspension = `Supprimée par admin: ${raison}`;
    annonce.moderationAdmin.dateVerification = new Date();
    annonce.moderationAdmin.adminVerificateur = req.user._id;
    
    await annonce.save();
    
    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression annonce admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'annonce'
    });
  }
};

// @desc    Gestion des demandes
// @route   GET /api/admin/demandes
// @access  Private (Admin)
const getDemandes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      statut,
      recherche,
      sort = '-dates.dateCreation'
    } = req.query;
    
    const filter = {};
    
    if (statut) filter.statut = statut;
    if (recherche) {
      filter['suivi.numeroSuivi'] = { $regex: recherche, $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [demandes, total] = await Promise.all([
      Demande.find(filter)
        .populate('expediteur', 'nom prenom email')
        .populate('conducteur', 'nom prenom email')
        .populate('annonce', 'titre')
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes'
    });
  }
};

// @desc    Résoudre un litige
// @route   PUT /api/admin/demandes/:id/resoudre-litige
// @access  Private (Admin)
const resoudreLitige = async (req, res) => {
  try {
    const { resolution, decision } = req.body; // decision: 'faveur_expediteur', 'faveur_conducteur', 'partage'
    
    const demande = await Demande.findById(req.params.id)
      .populate('expediteur', 'nom prenom email')
      .populate('conducteur', 'nom prenom email');
    
    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    if (!demande.litige.signale) {
      return res.status(400).json({
        success: false,
        message: 'Aucun litige signalé pour cette demande'
      });
    }
    
    if (demande.litige.resolu) {
      return res.status(400).json({
        success: false,
        message: 'Ce litige a déjà été résolu'
      });
    }
    
    // Résoudre le litige
    await demande.resoudreLitige(resolution);
    
    // Mettre à jour le statut selon la décision
    switch (decision) {
      case 'faveur_expediteur':
        demande.statut = 'annulee';
        break;
      case 'faveur_conducteur':
        if (demande.statut === 'litige') {
          demande.statut = 'livree';
        }
        break;
      case 'partage':
        // Garder le statut actuel ou définir un statut spécial
        break;
    }
    
    await demande.save();
    
    res.json({
      success: true,
      message: 'Litige résolu avec succès',
      data: { demande }
    });
    
  } catch (error) {
    console.error('Erreur résolution litige:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la résolution du litige'
    });
  }
};

// @desc    Obtenir les litiges en cours
// @route   GET /api/admin/litiges
// @access  Private (Admin)
const getLitiges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      resolu = false
    } = req.query;
    
    const filter = {
      'litige.signale': true,
      'litige.resolu': resolu === 'true'
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [litiges, total] = await Promise.all([
      Demande.find(filter)
        .populate('expediteur', 'nom prenom email')
        .populate('conducteur', 'nom prenom email')
        .populate('litige.signalePar', 'nom prenom')
        .populate('annonce', 'titre trajet')
        .sort({ 'litige.dateSignalement': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Demande.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        litiges,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération litiges:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des litiges'
    });
  }
};

// @desc    Créer un nouvel administrateur
// @route   POST /api/admin/utilisateurs/admin
// @access  Private (Admin)
const creerAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, telephone } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Générer un mot de passe temporaire
    const motDePasseTemporaire = Math.random().toString(36).slice(-8) + 
                                Math.random().toString(36).slice(-8).toUpperCase() + 
                                Math.floor(Math.random() * 100);
    
    // Créer l'administrateur
    const admin = await User.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      motDePasse: motDePasseTemporaire,
      role: 'admin',
      statut: 'actif',
      emailVerifie: true
    });
    
    // Ajouter le badge vérifié
    await admin.ajouterBadge('verifie');
    
    // Envoyer l'email de bienvenue avec les identifiants
    try {
      await sendWelcomeAdmin({
        nom: admin.nomComplet,
        email: admin.email,
        motDePasseTemporaire
      });
    } catch (emailError) {
      console.error('Erreur envoi email admin:', emailError);
      // Ne pas bloquer la création même si l'email échoue
    }
    
    res.status(201).json({
      success: true,
      message: 'Administrateur créé avec succès. Un email avec les identifiants a été envoyé.',
      data: {
        admin: {
          id: admin._id,
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          role: admin.role,
          motDePasseTemporaire // À afficher une seule fois
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'administrateur'
    });
  }
};

// @desc    Obtenir les logs d'activité admin
// @route   GET /api/admin/logs
// @access  Private (Admin)
const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type, // 'user', 'annonce', 'demande', 'evaluation'
      admin,
      dateDebut,
      dateFin
    } = req.query;
    
    // Ici vous pourriez avoir un modèle Log dédié
    // Pour l'instant, on simule avec les données existantes
    
    const logs = [];
    const dateFilter = {};
    
    if (dateDebut) dateFilter.$gte = new Date(dateDebut);
    if (dateFin) dateFilter.$lte = new Date(dateFin);
    
    // Récupérer les modifications récentes sur les utilisateurs
    if (!type || type === 'user') {
      const usersModifies = await User.find({
        'moderationHistorique.date': dateFilter.length > 0 ? dateFilter : { $exists: true }
      })
        .select('nom prenom moderationHistorique')
        .limit(20);
      
      usersModifies.forEach(user => {
        user.moderationHistorique?.forEach(hist => {
          logs.push({
            type: 'user',
            action: hist.action,
            cible: `${user.prenom} ${user.nom}`,
            admin: hist.moderateur,
            date: hist.date,
            details: hist.raison
          });
        });
      });
    }
    
    // Trier par date décroissante
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Paginer
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalItems: logs.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs'
    });
  }
};

// @desc    Exporter des données
// @route   GET /api/admin/export/:type
// @access  Private (Admin)
const exporterDonnees = async (req, res) => {
  try {
    const { type } = req.params; // 'users', 'annonces', 'demandes', 'evaluations'
    const { format = 'json', dateDebut, dateFin } = req.query;
    
    let data = [];
    const dateFilter = {};
    
    if (dateDebut) dateFilter.$gte = new Date(dateDebut);
    if (dateFin) dateFilter.$lte = new Date(dateFin);
    
    switch (type) {
      case 'users':
        data = await User.find({
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
          .select('-motDePasse -tokenVerificationEmail -tokenResetMotDePasse')
          .lean();
        break;
        
      case 'annonces':
        data = await Annonce.find({
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
          .populate('conducteur', 'nom prenom email')
          .lean();
        break;
        
      case 'demandes':
        data = await Demande.find({
          ...(Object.keys(dateFilter).length > 0 && { 'dates.dateCreation': dateFilter })
        })
          .populate('expediteur', 'nom prenom email')
          .populate('conducteur', 'nom prenom email')
          .lean();
        break;
        
      case 'evaluations':
        data = await Evaluation.find({
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
          .populate('evaluateur', 'nom prenom')
          .populate('evalue', 'nom prenom')
          .lean();
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Type d\'export invalide'
        });
    }
    
    if (format === 'csv') {
      // Ici vous pourriez utiliser une bibliothèque comme csv-writer
      // Pour l'instant, on retourne du JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.json`);
    }
    
    res.json({
      success: true,
      data: data,
      metadata: {
        type: type,
        count: data.length,
        exportDate: new Date(),
        filter: { dateDebut, dateFin }
      }
    });
    
  } catch (error) {
    console.error('Erreur export données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des données'
    });
  }
};

// @desc    Obtenir les métriques en temps réel
// @route   GET /api/admin/metriques
// @access  Private (Admin)
const getMetriques = async (req, res) => {
  try {
    const maintenant = new Date();
    const hier = new Date(maintenant - 24 * 60 * 60 * 1000);
    const semaineDerniere = new Date(maintenant - 7 * 24 * 60 * 60 * 1000);
    
    const [
      utilisateursAujourdhui,
      annoncesAujourdhui,
      demandesAujourdhui,
      utilisateursConnectes,
      demandesEnCours,
      litiges,
      evaluationsEnAttente
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: hier } }),
      Annonce.countDocuments({ createdAt: { $gte: hier } }),
      Demande.countDocuments({ 'dates.dateCreation': { $gte: hier } }),
      User.countDocuments({ 
        derniereConnexion: { $gte: new Date(maintenant - 30 * 60 * 1000) } // 30 min
      }),
      Demande.countDocuments({ 
        statut: { $in: ['acceptee', 'en_cours', 'enlevee', 'en_transit'] }
      }),
      Demande.countDocuments({ 
        'litige.signale': true, 
        'litige.resolu': false 
      }),
      Evaluation.countDocuments({ 
        'moderationAdmin.approuvee': false 
      })
    ]);
    
    res.json({
      success: true,
      data: {
        temps_reel: {
          utilisateursConnectes,
          demandesEnCours,
          litigesOverts: litiges,
          evaluationsEnAttenteModeation: evaluationsEnAttente
        },
        aujourd_hui: {
          nouveauxUtilisateurs: utilisateursAujourdhui,
          nouvellesAnnonces: annoncesAujourdhui,
          nouvellesDemandes: demandesAujourdhui
        },
        timestamp: maintenant
      }
    });
    
  } catch (error) {
    console.error('Erreur métriques temps réel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des métriques'
    });
  }
};

// @desc    Créer un compte administrateur (réservé aux super admins)
// @route   POST /api/admin/create-admin
// @access  Private (Admin only)
const createAdminAccount = async (req, res) => {
  try {
    // Vérifier que l'utilisateur actuel est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent créer des comptes admin.'
      });
    }

    const { nom, prenom, email, telephone, motDePasse } = req.body;

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Un compte administrateur existe déjà. Seul un admin est autorisé.'
      });
    }

    // Créer le compte admin
    const admin = await User.create({
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      motDePasse,
      role: 'admin',
      statut: 'actif',
      emailVerifie: true
    });

    res.status(201).json({
      success: true,
      message: 'Compte administrateur créé avec succès',
      data: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Erreur création admin:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte administrateur'
    });
  }
};

// @desc    Obtenir les informations de l'admin actuel
// @route   GET /api/admin/profile
// @access  Private (Admin only)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-motDePasse');
    
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Compte administrateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Erreur récupération profil admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// @desc    Modifier le profil admin
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
const updateAdminProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body;
    
    const admin = await User.findById(req.user.id);
    
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Compte administrateur non trouvé'
      });
    }

    // Mettre à jour les champs autorisés
    if (nom) admin.nom = nom;
    if (prenom) admin.prenom = prenom;
    if (telephone) admin.telephone = telephone;
    if (adresse) admin.adresse = adresse;

    await admin.save();

    res.json({
      success: true,
      message: 'Profil administrateur mis à jour avec succès',
      data: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        telephone: admin.telephone,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour profil admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// @desc    Obtenir les détails d'une annonce (admin)
// @route   GET /api/admin/annonces/:id
// @access  Private (Admin only)
const getAnnonceByIdAdmin = async (req, res) => {
  try {
    const rawAnnonce = await Annonce.findById(req.params.id);
    console.log('Annonce brute:', rawAnnonce);
    if (!rawAnnonce) {
      return res.status(404).json({ success: false, message: "Annonce non trouvée" });
    }
    const annonce = await Annonce.findById(req.params.id)
      .populate('conducteur', '-motDePasse');
    if (!annonce) {
      return res.status(404).json({ success: false, message: "Annonce non trouvée après populate" });
    }
    if (!annonce.conducteur) {
      return res.status(500).json({ success: false, message: "Conducteur introuvable ou supprimé pour cette annonce" });
    }
    res.json({ success: true, annonce });
  } catch (error) {
    console.error('Erreur récupération annonce admin:', error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'annonce", error: error.message });
  }
};

module.exports = {
  getDashboard,
  getUtilisateurs,
  modifierStatutUtilisateur,
  gererBadge,
  getAnnonces,
  modifierStatutAnnonce,
  supprimerAnnonce,
  getDemandes,
  resoudreLitige,
  getLitiges,
  creerAdmin,
  getLogs,
  exporterDonnees,
  getMetriques,
  createAdminAccount,
  getAdminProfile,
  updateAdminProfile,
  getAnnonceByIdAdmin
};