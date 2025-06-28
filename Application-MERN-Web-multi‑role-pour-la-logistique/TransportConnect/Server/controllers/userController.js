// backend/controllers/userController.js
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const Demande = require('../models/Demande');
const Evaluation = require('../models/Evaluation');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration Multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/photos');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `user-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
    }
  }
});

// @desc    Obtenir le profil d'un utilisateur
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Obtenir les statistiques détaillées
    const [annonces, evaluations, statistiquesEvaluations] = await Promise.all([
      Annonce.countDocuments({ conducteur: user._id, statut: 'active' }),
      Evaluation.countDocuments({ evalue: user._id, 'moderationAdmin.approuvee': true }),
      Evaluation.statistiquesUtilisateur(user._id)
    ]);
    
    // Informations publiques du profil
    const profileData = {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      photo: user.photo,
      role: user.role,
      badges: user.badges,
      statistiques: {
        ...user.statistiques,
        nombreAnnoncesActives: annonces,
        nombreEvaluations: evaluations,
        ...statistiquesEvaluations
      },
      adresse: {
        ville: user.adresse?.ville,
        pays: user.adresse?.pays
      },
      createdAt: user.createdAt
    };
    
    res.json({
      success: true,
      data: { user: profileData }
    });
    
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'nom', 'prenom', 'telephone', 'adresse', 'preferences'
    ];
    
    const updates = {};
    
    // Filtrer les champs autorisés
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user }
    });
    
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// @desc    Upload photo de profil
// @route   POST /api/users/upload-photo
// @access  Private
const uploadPhoto = [
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucune image fournie'
        });
      }
      
      // Supprimer l'ancienne photo si elle existe
      const user = await User.findById(req.user._id);
      if (user.photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads/photos', path.basename(user.photo));
        try {
          await fs.unlink(oldPhotoPath);
        } catch (error) {
          console.warn('Impossible de supprimer l\'ancienne photo:', error.message);
        }
      }
      
      // Mettre à jour l'URL de la photo
      const photoUrl = `/uploads/photos/${req.file.filename}`;
      user.photo = photoUrl;
      await user.save();
      
      res.json({
        success: true,
        message: 'Photo de profil mise à jour avec succès',
        data: { photoUrl }
      });
      
    } catch (error) {
      console.error('Erreur upload photo:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement de la photo'
      });
    }
  }
];

// @desc    Obtenir les statistiques d'un utilisateur
// @route   GET /api/users/:id/statistiques
// @access  Public
const getUserStatistiques = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const [
      annoncesStats,
      demandesStats,
      evaluationsStats,
      activiteRecente
    ] = await Promise.all([
      // Statistiques des annonces (pour les conducteurs)
      user.role === 'conducteur' ? Annonce.aggregate([
        { $match: { conducteur: user._id } },
        {
          $group: {
            _id: null,
            totalAnnonces: { $sum: 1 },
            annoncesActives: {
              $sum: { $cond: [{ $eq: ['$statut', 'active'] }, 1, 0] }
            },
            annoncesCompletes: {
              $sum: { $cond: [{ $eq: ['$statut', 'complete'] }, 1, 0] }
            },
            vuesMoyennes: { $avg: '$statistiques.nombreVues' },
            tauxAcceptationMoyen: { $avg: '$statistiques.tauxAcceptation' }
          }
        }
      ]) : Promise.resolve([]),
      
      // Statistiques des demandes
      Demande.aggregate([
        {
          $match: user.role === 'conducteur' 
            ? { conducteur: user._id }
            : { expediteur: user._id }
        },
        {
          $group: {
            _id: null,
            totalDemandes: { $sum: 1 },
            demandesReussies: {
              $sum: { $cond: [{ $eq: ['$statut', 'livree'] }, 1, 0] }
            },
            demandesEnCours: {
              $sum: { 
                $cond: [
                  { $in: ['$statut', ['acceptee', 'en_cours', 'enlevee', 'en_transit']] }, 
                  1, 0
                ]
              }
            },
            montantTotal: { $sum: '$tarification.montantAccepte' },
            poidsTotal: { $sum: '$colis.poids' }
          }
        }
      ]),
      
      // Statistiques des évaluations
      Evaluation.statistiquesUtilisateur(user._id),
      
      // Activité récente (30 derniers jours)
      Promise.all([
        user.role === 'conducteur' 
          ? Annonce.find({ 
              conducteur: user._id,
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }).countDocuments()
          : Promise.resolve(0),
        Demande.find({
          [user.role === 'conducteur' ? 'conducteur' : 'expediteur']: user._id,
          'dates.dateCreation': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).countDocuments()
      ])
    ]);
    
    const [annoncesRecentes, demandesRecentes] = activiteRecente;
    
    res.json({
      success: true,
      data: {
        utilisateur: {
          id: user._id,
          nom: user.nomComplet,
          role: user.role,
          photo: user.photo
        },
        annonces: annoncesStats[0] || {},
        demandes: demandesStats[0] || {},
        evaluations: evaluationsStats,
        activiteRecente: {
          annoncesRecentes,
          demandesRecentes
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur statistiques utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

// @desc    Rechercher des utilisateurs
// @route   GET /api/users/rechercher
// @access  Public
const rechercherUtilisateurs = async (req, res) => {
  try {
    const {
      q, // terme de recherche
      role,
      ville,
      noteMin,
      badges,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;
    
    const filter = { statut: 'actif' };
    
    // Recherche textuelle sur nom et prénom
    if (q) {
      filter.$or = [
        { nom: { $regex: q, $options: 'i' } },
        { prenom: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filtres
    if (role) {
      filter.role = role;
    }
    
    if (ville) {
      filter['adresse.ville'] = { $regex: ville, $options: 'i' };
    }
    
    if (noteMin) {
      filter['statistiques.noteMoyenne'] = { $gte: parseFloat(noteMin) };
    }
    
    if (badges) {
      const badgesList = Array.isArray(badges) ? badges : [badges];
      filter['badges.type'] = { $in: badgesList };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('nom prenom photo role badges statistiques adresse.ville createdAt')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

// @desc    Obtenir les meilleurs utilisateurs
// @route   GET /api/users/top
// @access  Public
const getTopUtilisateurs = async (req, res) => {
  try {
    const { categorie = 'note', limite = 10 } = req.query;
    
    let sortField;
    let minEvaluations = 3;
    
    switch (categorie) {
      case 'note':
        sortField = { 'statistiques.noteMoyenne': -1, 'statistiques.nombreEvaluations': -1 };
        break;
      case 'activite':
        sortField = { 'statistiques.nombreAnnonces': -1, 'statistiques.nombreDemandesEnvoyees': -1 };
        minEvaluations = 1;
        break;
      case 'experience':
        sortField = { createdAt: 1, 'statistiques.nombreEvaluations': -1 };
        break;
      default:
        sortField = { 'statistiques.noteMoyenne': -1 };
    }
    
    const users = await User.find({
      statut: 'actif',
      'statistiques.nombreEvaluations': { $gte: minEvaluations }
    })
      .select('nom prenom photo role badges statistiques adresse.ville')
      .sort(sortField)
      .limit(parseInt(limite));
    
    res.json({
      success: true,
      data: { users }
    });
    
  } catch (error) {
    console.error('Erreur top utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du classement'
    });
  }
};

// @desc    Supprimer le compte utilisateur
// @route   DELETE /api/users/compte
// @access  Private
const supprimerCompte = async (req, res) => {
  try {
    const { motDePasse, confirmation } = req.body;
    
    if (confirmation !== 'SUPPRIMER MON COMPTE') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation incorrecte'
      });
    }
    
    // Vérifier le mot de passe
    const user = await User.findById(req.user._id).select('+motDePasse');
    const isValidPassword = await user.comparerMotDePasse(motDePasse);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }
    
    // Vérifier qu'il n'y a pas de transactions en cours
    const transactionsEnCours = await Demande.countDocuments({
      $or: [
        { expediteur: user._id },
        { conducteur: user._id }
      ],
      statut: { $in: ['acceptee', 'en_cours', 'enlevee', 'en_transit'] }
    });
    
    if (transactionsEnCours > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le compte avec des transactions en cours'
      });
    }
    
    // Anonymiser les données au lieu de supprimer complètement
    await User.findByIdAndUpdate(user._id, {
      nom: 'Utilisateur',
      prenom: 'Supprimé',
      email: `deleted_${user._id}@example.com`,
      telephone: '0000000000',
      statut: 'suspendu',
      photo: null,
      adresse: {},
      motDePasse: Math.random().toString(36),
      tokenVerificationEmail: null,
      tokenResetMotDePasse: null
    });
    
    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte'
    });
  }
};

// @desc    Obtenir l'historique d'activité
// @route   GET /api/users/historique
// @access  Private
const getHistoriqueActivite = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type, // 'annonces', 'demandes', 'evaluations'
      periode = 30 // jours
    } = req.query;
    
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - parseInt(periode));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let activites = [];
    
    if (!type || type === 'annonces') {
      if (req.user.role === 'conducteur') {
        const annonces = await Annonce.find({
          conducteur: req.user._id,
          createdAt: { $gte: dateDebut }
        })
          .select('titre statut createdAt updatedAt')
          .sort({ createdAt: -1 })
          .limit(parseInt(limit));
        
        activites.push(...annonces.map(a => ({
          type: 'annonce',
          action: 'créée',
          titre: a.titre,
          statut: a.statut,
          date: a.createdAt,
          id: a._id
        })));
      }
    }
    
    if (!type || type === 'demandes') {
      const demandes = await Demande.find({
        [req.user.role === 'conducteur' ? 'conducteur' : 'expediteur']: req.user._id,
        'dates.dateCreation': { $gte: dateDebut }
      })
        .populate('annonce', 'titre')
        .select('statut dates colis')
        .sort({ 'dates.dateCreation': -1 })
        .limit(parseInt(limit));
      
      activites.push(...demandes.map(d => ({
        type: 'demande',
        action: req.user.role === 'conducteur' ? 'reçue' : 'envoyée',
        titre: d.annonce?.titre || 'Annonce supprimée',
        statut: d.statut,
        date: d.dates.dateCreation,
        id: d._id
      })));
    }
    
    if (!type || type === 'evaluations') {
      const evaluations = await Evaluation.find({
        evaluateur: req.user._id,
        createdAt: { $gte: dateDebut }
      })
        .populate('evalue', 'nom prenom')
        .select('note commentaire createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      
      activites.push(...evaluations.map(e => ({
        type: 'evaluation',
        action: 'donnée',
        titre: `Évaluation de ${e.evalue.prenom} ${e.evalue.nom}`,
        note: e.note,
        date: e.createdAt,
        id: e._id
      })));
    }
    
    // Trier par date
    activites.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Paginer
    const paginatedActivites = activites.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        activites: paginatedActivites,
        pagination: {
          currentPage: parseInt(page),
          totalItems: activites.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur historique activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// @desc    Obtenir les notifications de l'utilisateur
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      nonLues = false
    } = req.query;
    
    // Pour l'instant, on simule des notifications basées sur l'activité récente
    // Dans une implémentation complète, vous auriez un modèle Notification
    
    const notifications = [];
    
    // Notifications de demandes pour les conducteurs
    if (req.user.role === 'conducteur') {
      const demandesRecentes = await Demande.find({
        conducteur: req.user._id,
        statut: 'en_attente',
        'dates.dateCreation': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .populate('expediteur', 'nom prenom')
        .populate('annonce', 'titre')
        .sort({ 'dates.dateCreation': -1 });
      
      notifications.push(...demandesRecentes.map(d => ({
        type: 'demande_recue',
        titre: 'Nouvelle demande de transport',
        message: `${d.expediteur.prenom} ${d.expediteur.nom} souhaite envoyer un colis`,
        date: d.dates.dateCreation,
        lien: `/conducteur/demandes/${d._id}`,
        lu: false
      })));
    }
    
    // Notifications d'évaluations en attente
    const demandesLivrees = await Demande.find({
      [req.user.role === 'conducteur' ? 'conducteur' : 'expediteur']: req.user._id,
      statut: 'livree',
      'dates.dateLivraisonReelle': { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    });
    
    for (const demande of demandesLivrees) {
      const evalueId = req.user.role === 'conducteur' 
        ? demande.expediteur 
        : demande.conducteur;
      
      const evaluationExiste = await Evaluation.findOne({
        evaluateur: req.user._id,
        evalue: evalueId,
        demande: demande._id
      });
      
      if (!evaluationExiste) {
        notifications.push({
          type: 'evaluation_en_attente',
          titre: 'Évaluation en attente',
          message: 'N\'oubliez pas d\'évaluer votre dernière transaction',
          date: demande.dates.dateLivraisonReelle,
          lien: `/evaluation/${demande._id}`,
          lu: false
        });
      }
    }
    
    // Trier par date
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Filtrer les non lues si demandé
    const filteredNotifications = nonLues === 'true' 
      ? notifications.filter(n => !n.lu)
      : notifications;
    
    // Paginer
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        nombreNonLues: notifications.filter(n => !n.lu).length,
        pagination: {
          currentPage: parseInt(page),
          totalItems: filteredNotifications.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

// @desc    Obtenir le tableau de bord utilisateur
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    // Données communes
    const [evaluationsRecues, evaluationsMoyenne] = await Promise.all([
      Evaluation.countDocuments({ 
        evalue: userId, 
        'moderationAdmin.approuvee': true 
      }),
      Evaluation.aggregate([
        { 
          $match: { 
            evalue: userId, 
            'moderationAdmin.approuvee': true 
          } 
        },
        { 
          $group: { 
            _id: null, 
            moyenne: { $avg: '$note' } 
          } 
        }
      ])
    ]);
    
    let dashboardData = {
      utilisateur: {
        nom: req.user.nomComplet,
        role: role,
        photo: req.user.photo,
        badges: req.user.badges,
        evaluations: {
          nombre: evaluationsRecues,
          moyenne: evaluationsMoyenne[0]?.moyenne || 0
        }
      }
    };
    
    if (role === 'conducteur') {
      // Dashboard conducteur
      const [
        annonces,
        annoncesPrecedent,
        demandes,
        demandesPrecedent,
        revenus,
        revenusPrecedent
      ] = await Promise.all([
        // Annonces ce mois
        Annonce.countDocuments({
          conducteur: userId,
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
        // Annonces mois précédent
        Annonce.countDocuments({
          conducteur: userId,
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        // Demandes reçues ce mois
        Demande.countDocuments({
          conducteur: userId,
          'dates.dateCreation': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
        // Demandes mois précédent
        Demande.countDocuments({
          conducteur: userId,
          'dates.dateCreation': { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        // Revenus ce mois
        Demande.aggregate([
          {
            $match: {
              conducteur: userId,
              statut: 'livree',
              'dates.dateLivraisonReelle': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            }
          },
          { $group: { _id: null, total: { $sum: '$tarification.montantAccepte' } } }
        ]),
        // Revenus mois précédent
        Demande.aggregate([
          {
            $match: {
              conducteur: userId,
              statut: 'livree',
              'dates.dateLivraisonReelle': { 
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$tarification.montantAccepte' } } }
        ])
      ]);
      
      dashboardData.conducteur = {
        annonces: {
          total: annonces,
          evolution: annoncesPrecedent > 0 ? ((annonces - annoncesPrecedent) / annoncesPrecedent * 100) : 0
        },
        demandes: {
          total: demandes,
          evolution: demandesPrecedent > 0 ? ((demandes - demandesPrecedent) / demandesPrecedent * 100) : 0
        },
        revenus: {
          total: revenus[0]?.total || 0,
          evolution: revenusPrecedent[0]?.total > 0 ? 
            ((revenus[0]?.total || 0) - revenusPrecedent[0]?.total) / revenusPrecedent[0]?.total * 100 : 0
        }
      };
      
      // Demandes en attente
      dashboardData.conducteur.demandesEnAttente = await Demande.find({
        conducteur: userId,
        statut: 'en_attente'
      })
        .populate('expediteur', 'nom prenom photo')
        .populate('annonce', 'titre')
        .sort({ 'dates.dateCreation': -1 })
        .limit(5);
      
    } else if (role === 'expediteur') {
      // Dashboard expéditeur
      const [
        envois,
        envoisPrecedent,
        montantDepense,
        montantPrecedent
      ] = await Promise.all([
        // Envois ce mois
        Demande.countDocuments({
          expediteur: userId,
          'dates.dateCreation': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
        // Envois mois précédent
        Demande.countDocuments({
          expediteur: userId,
          'dates.dateCreation': { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        // Montant dépensé ce mois
        Demande.aggregate([
          {
            $match: {
              expediteur: userId,
              statut: 'livree',
              'dates.dateLivraisonReelle': { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            }
          },
          { $group: { _id: null, total: { $sum: '$tarification.montantAccepte' } } }
        ]),
        // Montant mois précédent
        Demande.aggregate([
          {
            $match: {
              expediteur: userId,
              statut: 'livree',
              'dates.dateLivraisonReelle': { 
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$tarification.montantAccepte' } } }
        ])
      ]);
      
      dashboardData.expediteur = {
        envois: {
          total: envois,
          evolution: envoisPrecedent > 0 ? ((envois - envoisPrecedent) / envoisPrecedent * 100) : 0
        },
        montantDepense: {
          total: montantDepense[0]?.total || 0,
          evolution: montantPrecedent[0]?.total > 0 ? 
            ((montantDepense[0]?.total || 0) - montantPrecedent[0]?.total) / montantPrecedent[0]?.total * 100 : 0
        }
      };
      
      // Envois en cours
      dashboardData.expediteur.envoiEnCours = await Demande.find({
        expediteur: userId,
        statut: { $in: ['acceptee', 'en_cours', 'enlevee', 'en_transit'] }
      })
        .populate('conducteur', 'nom prenom photo')
        .populate('annonce', 'titre trajet')
        .sort({ 'dates.dateCreation': -1 })
        .limit(5);
    }
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du tableau de bord'
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadPhoto,
  getUserStatistiques,
  rechercherUtilisateurs,
  getTopUtilisateurs,
  supprimerCompte,
  getHistoriqueActivite,
  getNotifications,
  getDashboard
};