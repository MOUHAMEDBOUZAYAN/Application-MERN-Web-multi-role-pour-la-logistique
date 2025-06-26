import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck, 
  Star,
  Clock,
  User,
  MessageCircle,
  Eye,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Navigation,
  Weight,
  Timer,
  BadgeCheck,
  Edit,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';

// Fonctions utilitaires
const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

const formatTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5);
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    pending: 'yellow', 
    accepted: 'blue',
    completed: 'purple',
    cancelled: 'red',
    inactive: 'gray'
  };
  return colors[status] || 'gray';
};

const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif',
    pending: 'En attente',
    accepted: 'Accepté', 
    completed: 'Terminé',
    cancelled: 'Annulé',
    inactive: 'Inactif'
  };
  return labels[status] || status;
};

// Types de marchandises
const CARGO_TYPES = {
  electromenager: 'Électroménager',
  mobilier: 'Mobilier',
  vetements: 'Vêtements',
  alimentation: 'Alimentation',
  electronique: 'Électronique',
  documents: 'Documents',
  medicaments: 'Médicaments',
  fragile: 'Fragile',
  produits_chimiques: 'Produits chimiques',
  materiaux_construction: 'Matériaux de construction',
  autre: 'Autre'
};

const VEHICLE_TYPES = {
  camionnette: 'Camionnette',
  camion: 'Camion',
  fourgon: 'Fourgon',
  voiture: 'Voiture'
};

// Fonction pour extraire les données de l'annonce de manière sécurisée
const extractAnnouncementData = (announcement) => {
  return {
    _id: announcement._id,
    // Route
    lieuDepart: announcement.lieuDepart || announcement.trajet?.depart?.ville || '',
    destination: announcement.destination || announcement.trajet?.destination?.ville || '',
    etapesIntermediaires: announcement.etapesIntermediaires || announcement.trajet?.etapesIntermediaires || [],
    
    // Planning
    dateDepart: announcement.dateDepart || announcement.planning?.dateDepart || '',
    heureDepart: announcement.heureDepart || announcement.planning?.heureDepart || '',
    
    // Transport
    typeMarchandise: announcement.typeMarchandise || 
      (Array.isArray(announcement.typesMarchandise) ? announcement.typesMarchandise[0] : announcement.typesMarchandise) || '',
    capaciteDisponible: announcement.capaciteDisponible || announcement.capacite?.poidsMax || 0,
    dimensionsMax: announcement.dimensionsMax || announcement.capacite?.dimensionsMax || null,
    
    // Prix
    prix: announcement.prix || announcement.tarification?.prix || announcement.tarification?.prixFixe || null,
    
    // Véhicule
    vehicule: announcement.vehicule || {},
    
    // Status
    status: announcement.status || announcement.statut || 'active',
    
    // Description
    description: announcement.description || '',
    
    // Conducteur
    conducteur: announcement.conducteur || {},
    
    // Stats
    vuesCount: announcement.vuesCount || announcement.statistiques?.nombreVues || 0,
    demandesCount: announcement.demandesCount || announcement.statistiques?.nombreDemandes || 0,
    
    // Dates
    createdAt: announcement.createdAt || new Date(),
    updatedAt: announcement.updatedAt || null
  };
};

const AnnouncementCard = ({ 
  announcement, 
  onClick, 
  onEdit, 
  onDelete,
  showActions = false, 
  variant = 'default',
  currentUser = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Extraire les données de manière sécurisée
  const data = extractAnnouncementData(announcement);

  const canSendDemand = () => {
    return currentUser && 
           currentUser.role === 'expediteur' && 
           data.conducteur._id !== currentUser._id && 
           data.status === 'active';
  };

  const isOwner = () => {
    return currentUser && data.conducteur._id === currentUser._id;
  };

  const getPriorityBadge = () => {
    if (!data.dateDepart) return null;
    
    const hoursUntilDeparture = Math.floor((new Date(data.dateDepart) - new Date()) / (1000 * 60 * 60));
    if (hoursUntilDeparture <= 24) {
      return { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200', icon: Zap };
    } else if (hoursUntilDeparture <= 72) {
      return { label: 'Bientôt', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Timer };
    }
    return null;
  };

  const priority = getPriorityBadge();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(announcement);
    }
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-1 ${
          variant === 'compact' ? 'p-4' : 'p-6'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Priority Badge */}
        {priority && (
          <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${priority.color} backdrop-blur-sm z-10`}>
            <priority.icon className="h-3 w-3" />
            <span>{priority.label}</span>
          </div>
        )}

        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  data.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {data.status === 'active' && <CheckCircle className="h-3 w-3" />}
                  <span>{getStatusLabel(data.status)}</span>
                </span>
                
                {/* Action Buttons pour le propriétaire */}
                {isOwner() && showActions && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit(announcement);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirmDelete(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Route avec Visual Amélioré */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                    <span className="font-bold text-gray-900 text-lg truncate">{data.lieuDepart}</span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-blue-400 to-red-500 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200">
                        <ArrowRight className="h-3 w-3 text-gray-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-lg truncate">{data.destination}</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  </div>
                </div>

                {/* Étapes intermédiaires */}
                {data.etapesIntermediaires && data.etapesIntermediaires.length > 0 && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Étapes intermédiaires:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.etapesIntermediaires.slice(0, 2).map((etape, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs text-gray-700">
                          {typeof etape === 'string' ? etape : etape.ville}
                        </span>
                      ))}
                      {data.etapesIntermediaires.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          +{data.etapesIntermediaires.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date et Heure */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(data.dateDepart)}</p>
                  <p className="text-xs text-gray-600">Date de départ</p>
                </div>
              </div>
              
              {data.heureDepart && (
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 text-right">{formatTime(data.heureDepart)}</p>
                    <p className="text-xs text-gray-600">Heure prévue</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations Cargo et Capacité */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800 uppercase tracking-wide">Type</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {CARGO_TYPES[data.typeMarchandise] || data.typeMarchandise || 'Non spécifié'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <Weight className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Capacité</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {data.capaciteDisponible}
                <span className="text-xs text-gray-600 ml-1">kg</span>
              </p>
            </div>
          </div>

          {/* Informations Prix */}
          {data.prix && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">Prix indicatif</p>
                  <p className="text-lg font-bold text-gray-900">{data.prix} MAD</p>
                </div>
                <div className="text-yellow-600 text-xl">
                  💰
                </div>
              </div>
            </div>
          )}

          {/* Informations Véhicule */}
          {data.vehicule && data.vehicule.type && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
              <Truck className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {data.vehicule.marque} {data.vehicule.modele}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {VEHICLE_TYPES[data.vehicule.type] || data.vehicule.type}
                </p>
              </div>
            </div>
          )}

          {/* Description Preview */}
          {data.description && variant !== 'compact' && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            </div>
          )}

          {/* Footer Amélioré */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {/* Informations Conducteur */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    {data.conducteur.avatar ? (
                      <img
                        src={data.conducteur.avatar}
                        alt="Conducteur"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {getInitials(`${data.conducteur.prenom} ${data.conducteur.nom}`)}
                      </span>
                    )}
                  </div>
                  
                  {data.conducteur.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {data.conducteur.prenom} {data.conducteur.nom}
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    {data.conducteur.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700">
                          {data.conducteur.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({data.conducteur.reviewsCount || 0})
                        </span>
                      </div>
                    )}
                    
                    {data.conducteur.totalTrips && (
                      <span className="text-xs text-gray-500">
                        {data.conducteur.totalTrips} trajets
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'Action */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(announcement);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn"
                  title="Voir les détails"
                >
                  <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                </button>
                
                {canSendDemand() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Logique d'envoi de demande
                      console.log('Envoyer demande pour:', data._id);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Demander</span>
                  </button>
                )}

                {isOwner() && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (data.conducteur.telephone) {
                          window.open(`tel:${data.conducteur.telephone}`);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Appeler"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (data.conducteur.email) {
                          window.open(`mailto:${data.conducteur.email}`);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barre de Statistiques */}
          {(data.vuesCount > 0 || data.demandesCount > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{data.vuesCount} vues</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{data.demandesCount} demandes</span>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  {data.dateDepart && Math.floor((new Date(data.dateDepart) - new Date()) / (1000 * 60 * 60 * 24))} jours restants
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Effets d'Animation au Survol */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-2xl transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* Hint d'Action Flottant */}
        {isHovered && canSendDemand() && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            Cliquez pour demander ce transport
          </div>
        )}
      </div>

      {/* Modal de Confirmation de Suppression */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Supprimer l'annonce</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer l'annonce "{data.lieuDepart} → {data.destination}" ?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementCard;