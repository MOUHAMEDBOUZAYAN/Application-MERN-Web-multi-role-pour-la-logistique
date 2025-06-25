import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck, 
  Star,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Share2,
  MoreVertical,
  Timer,
  Weight,
  DollarSign
} from 'lucide-react';

// Utilitaires pour le formatage
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (time) => {
  if (!time) return '';
  return time.includes(':') ? time : new Date(time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusInfo = (status) => {
  const statusMap = {
    'active': { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    'inactive': { label: 'Inactive', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Timer },
    'completed': { label: 'Terminée', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Star },
    'cancelled': { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
  };
  return statusMap[status] || statusMap['active'];
};

const getUrgencyLevel = (dateDepart) => {
  const hoursUntil = (new Date(dateDepart) - new Date()) / (1000 * 60 * 60);
  if (hoursUntil <= 24) return { level: 'urgent', color: 'bg-red-500', label: 'URGENT' };
  if (hoursUntil <= 72) return { level: 'soon', color: 'bg-orange-500', label: 'BIENTÔT' };
  return null;
};

// Fonction pour mapper les données d'annonce
const mapAnnouncementData = (announcement) => {
  // Support pour différentes structures de données backend
  return {
    _id: announcement._id,
    // Trajet - gestion des différentes structures possibles
    lieuDepart: announcement.lieuDepart || 
                announcement.trajet?.depart?.ville || 
                announcement.depart || '',
    destination: announcement.destination || 
                 announcement.trajet?.destination?.ville || 
                 announcement.arrivee || '',
    etapesIntermediaires: announcement.etapesIntermediaires || 
                          announcement.trajet?.etapesIntermediaires || 
                          announcement.etapes || [],
    
    // Planning
    dateDepart: announcement.dateDepart || 
                announcement.planning?.dateDepart || 
                announcement.date || '',
    heureDepart: announcement.heureDepart || 
                 announcement.planning?.heureDepart || 
                 announcement.heure || '',
    
    // Capacité et marchandise
    typeMarchandise: announcement.typeMarchandise || 
                     (Array.isArray(announcement.typesMarchandise) ? 
                      announcement.typesMarchandise[0] : 
                      announcement.typesMarchandise) || '',
    capaciteDisponible: announcement.capaciteDisponible || 
                        announcement.capacite?.poidsMax || 
                        announcement.poids || '',
    dimensionsMax: announcement.dimensionsMax || 
                   (announcement.capacite?.dimensionsMax ? 
                    `${announcement.capacite.dimensionsMax.longueur}x${announcement.capacite.dimensionsMax.largeur}x${announcement.capacite.dimensionsMax.hauteur}` : 
                    '') || '',
    
    // Prix et véhicule
    prix: announcement.prix || 
          announcement.tarification?.prix || 
          announcement.tarification?.prixFixe || '',
    vehicule: announcement.vehicule || {},
    
    // Statut et description
    status: announcement.status || announcement.statut || 'active',
    description: announcement.description || 
                 announcement.details?.description || '',
    
    // Statistiques
    vuesCount: announcement.vuesCount || 
               announcement.statistiques?.nombreVues || 0,
    demandesCount: announcement.demandesCount || 
                   announcement.statistiques?.nombreDemandes || 0,
    
    // Conducteur
    conducteur: announcement.conducteur || {},
    
    // Métadonnées
    createdAt: announcement.createdAt || announcement.dateCreation || '',
    distance: announcement.distance || announcement.trajet?.distance || '',
    dureeEstimee: announcement.dureeEstimee || announcement.trajet?.dureeEstimee || ''
  };
};

const AnnouncementCard = ({ 
  announcement: rawAnnouncement, 
  onEdit, 
  onDelete, 
  onView, 
  onShare,
  showActions = true,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Mapper les données d'annonce
  const announcement = mapAnnouncementData(rawAnnouncement);
  
  const statusInfo = getStatusInfo(announcement.status);
  const urgency = getUrgencyLevel(announcement.dateDepart);
  const StatusIcon = statusInfo.icon;

  // Validation des données essentielles
  if (!announcement.lieuDepart || !announcement.destination) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Données d'annonce incomplètes</span>
        </div>
        <p className="text-red-500 text-sm mt-2">
          Informations de trajet manquantes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Badge d'urgence */}
      {urgency && (
        <div className={`absolute top-4 right-4 ${urgency.color} text-white px-2 py-1 rounded-full text-xs font-bold z-10 flex items-center space-x-1`}>
          <Timer className="h-3 w-3" />
          <span>{urgency.label}</span>
        </div>
      )}

      <div className="p-6">
        {/* En-tête avec statut et actions */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusInfo.label}</span>
          </div>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                  <button
                    onClick={() => { onView?.(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Voir détails</span>
                  </button>
                  <button
                    onClick={() => { onEdit?.(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => { onShare?.(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Partager</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => { onDelete?.(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trajet principal */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-gray-900 truncate">
                {announcement.lieuDepart}
              </span>
            </div>
            
            <div className="flex-shrink-0 px-3">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2 flex-1 justify-end">
              <span className="font-semibold text-gray-900 truncate">
                {announcement.destination}
              </span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {/* Étapes intermédiaires */}
          {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
            <div className="mt-2 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600">
                via {announcement.etapesIntermediaires.slice(0, 2).join(', ')}
                {announcement.etapesIntermediaires.length > 2 && 
                  ` +${announcement.etapesIntermediaires.length - 2}`
                }
              </span>
            </div>
          )}
        </div>

        {/* Informations de planning */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(announcement.dateDepart)}
                </p>
                <p className="text-xs text-gray-500">Date de départ</p>
              </div>
            </div>
            
            {announcement.heureDepart && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatTime(announcement.heureDepart)}
                  </p>
                  <p className="text-xs text-gray-500">Heure prévue</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Détails du transport */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">MARCHANDISE</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {announcement.typeMarchandise || 'Non spécifié'}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center space-x-2 mb-1">
              <Weight className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">CAPACITÉ</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {announcement.capaciteDisponible || 'N/A'} 
              <span className="text-xs text-gray-600 ml-1">kg</span>
            </p>
          </div>
        </div>

        {/* Prix et véhicule */}
        <div className="flex items-center justify-between mb-4">
          {announcement.prix && (
            <div className="bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-bold text-gray-900">
                  {announcement.prix} MAD
                </span>
              </div>
            </div>
          )}
          
          {announcement.vehicule?.type && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Truck className="h-4 w-4" />
              <span className="text-sm capitalize">
                {announcement.vehicule.type}
              </span>
            </div>
          )}
        </div>

        {/* Description (version tronquée) */}
        {announcement.description && variant !== 'compact' && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {announcement.description}
            </p>
          </div>
        )}

        {/* Informations du conducteur et statistiques */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {announcement.conducteur?.avatar ? (
                <img
                  src={announcement.conducteur.avatar}
                  alt="Conducteur"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {announcement.conducteur?.prenom} {announcement.conducteur?.nom}
              </p>
              {announcement.conducteur?.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {announcement.conducteur.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{announcement.vuesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>{announcement.demandesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de performance */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Performance</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (announcement.vuesCount * 2 + announcement.demandesCount * 10))}%` 
                }}
              ></div>
            </div>
            <span className="text-gray-700 font-medium">
              {Math.min(100, (announcement.vuesCount * 2 + announcement.demandesCount * 10))}%
            </span>
          </div>
        </div>
      </div>

      {/* Overlay d'animation au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

// Composant de liste d'annonces amélioré
const AnnouncementList = ({ announcements = [], onEdit, onDelete, onView, onShare }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateDepart');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtrage et tri des annonces
  const filteredAnnouncements = announcements
    .filter(ann => {
      const mappedAnn = mapAnnouncementData(ann);
      const matchesSearch = !searchTerm || 
        mappedAnn.lieuDepart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mappedAnn.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mappedAnn.typeMarchandise?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || mappedAnn.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aData = mapAnnouncementData(a);
      const bData = mapAnnouncementData(b);
      
      switch (sortBy) {
        case 'dateDepart':
          return new Date(aData.dateDepart) - new Date(bData.dateDepart);
        case 'vues':
          return bData.vuesCount - aData.vuesCount;
        case 'demandes':
          return bData.demandesCount - aData.demandesCount;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ville, marchandise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dateDepart">Date de départ</option>
              <option value="vues">Nombre de vues</option>
              <option value="demandes">Nombre de demandes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['all', 'active', 'inactive', 'completed'].map(status => {
          const count = status === 'all' 
            ? announcements.length 
            : announcements.filter(ann => mapAnnouncementData(ann).status === status).length;
          
          return (
            <div key={status} className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status === 'all' ? 'Total' : status === 'active' ? 'Actives' : 
                 status === 'inactive' ? 'Inactives' : 'Terminées'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des annonces */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune annonce trouvée
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première annonce'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onShare={onShare}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Exemple d'utilisation
const ExampleUsage = () => {
  // Données d'exemple avec différentes structures
  const sampleAnnouncements = [
    {
      _id: '1',
      // Structure backend moderne
      trajet: {
        depart: { ville: 'Casablanca' },
        destination: { ville: 'Rabat' },
        etapesIntermediaires: ['Témara']
      },
      planning: {
        dateDepart: '2024-01-15T10:00:00Z',
        heureDepart: '10:00'
      },
      typesMarchandise: ['electronique'],
      capacite: { poidsMax: 50 },
      tarification: { prix: 200 },
      statut: 'active',
      conducteur: {
        prenom: 'Ahmed',
        nom: 'Bennani',
        rating: 4.5
      },
      statistiques: {
        nombreVues: 25,
        nombreDemandes: 3
      }
    },
    {
      _id: '2',
      // Structure backend ancienne
      lieuDepart: 'Marrakech',
      destination: 'Agadir',
      dateDepart: '2024-01-20T14:00:00Z',
      typeMarchandise: 'mobilier',
      capaciteDisponible: 100,
      prix: 350,
      status: 'active',
      vuesCount: 15,
      demandesCount: 2,
      conducteur: {
        prenom: 'Fatima',
        nom: 'El Ouali'
      }
    }
  ];

  const handleEdit = (announcement) => {
    console.log('Modifier annonce:', announcement._id);
  };

  const handleDelete = (announcement) => {
    console.log('Supprimer annonce:', announcement._id);
  };

  const handleView = (announcement) => {
    console.log('Voir annonce:', announcement._id);
  };

  const handleShare = (announcement) => {
    console.log('Partager annonce:', announcement._id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Annonces
          </h1>
          <p className="text-gray-600">
            Gérez vos {sampleAnnouncements.length} annonces de transport
          </p>
        </div>

        <AnnouncementList
          announcements={sampleAnnouncements}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

export default ExampleUsage;