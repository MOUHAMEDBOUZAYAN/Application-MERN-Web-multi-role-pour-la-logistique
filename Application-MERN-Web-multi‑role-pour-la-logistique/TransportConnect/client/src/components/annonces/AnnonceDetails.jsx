import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  Truck, 
  User,
  Star,
  Shield,
  MessageCircle,
  Phone,
  Mail,
  Navigation,
  Info,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Route,
  Weight,
  Ruler,
  CreditCard,
  Eye,
  Users,
  Timer,
  BadgeCheck,
  Camera,
  FileText,
  Zap
} from 'lucide-react';
import { formatDate, formatTime, getInitials, formatPhoneNumber } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { demandeAPI, annonceAPI } from '../../utils/api';
import { ConfirmationModal } from '../common/Modal';
import toast from 'react-hot-toast';

const AnnonceDetails = ({ annonceId, onClose }) => {
  const { user, isSender } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandMessage, setDemandMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (annonceId) {
      const fetchAnnonce = async () => {
        try {
          setLoading(true);
          const response = await annonceAPI.getById(annonceId);
          // Robust parsing for all possible backend responses
          const ann = response.data.annonce || response.data.data?.annonce || response.data;
          setAnnouncement(ann);
        } catch (error) {
          console.error("Erreur lors de la récupération de l'annonce:", error);
          toast.error("Impossible de charger les détails de l'annonce.");
        } finally {
          setLoading(false);
        }
      };
      fetchAnnonce();
    }
  }, [annonceId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <p className="text-gray-600 text-lg">Chargement de l'annonce...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-medium">
              Impossible de charger les détails de l'annonce.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement.conducteur) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-medium">Erreur : Informations du conducteur manquantes</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSendDemand = async () => {
    try {
      setSending(true);
      await demandeAPI.create({
        annonce: announcement._id,
        expediteur: user._id,
        message: demandMessage || `Demande pour le transport de ${announcement.trajet.depart.ville} vers ${announcement.trajet.destination.ville}`,
        typeColis: 'Colis standard',
        poids: 5,
        dimensions: '30x30x30 cm'
      });
      
      toast.success('Demande envoyée avec succès !');
      setShowDemandModal(false);
      onClose(annonceId);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setSending(false);
    }
  };

  const canSendDemand = () => {
    return isSender() && announcement.conducteur._id !== user._id && announcement.status === 'active';
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'route', label: 'Itinéraire', icon: Route },
    { id: 'transport', label: 'Transport', icon: Package },
    { id: 'driver', label: 'Conducteur', icon: User }
  ];

  const getUrgencyLevel = () => {
    const hoursUntilDeparture = Math.floor((new Date(announcement.planning.dateDepart) - new Date()) / (1000 * 60 * 60));
    if (hoursUntilDeparture <= 24) return { level: 'urgent', color: 'red', label: 'Urgent' };
    if (hoursUntilDeparture <= 72) return { level: 'soon', color: 'orange', label: 'Bientôt' };
    return { level: 'normal', color: 'green', label: 'Planifié' };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${
                  urgency.color === 'red' ? 'bg-red-100 text-red-800' :
                  urgency.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {urgency.level === 'urgent' && <Zap className="h-4 w-4" />}
                  <span>{urgency.label}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  announcement.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {announcement.status === 'active' ? 'Disponible' : 'Non disponible'}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-3">
                Transport Professionnel
              </h1>
              
              {/* Enhanced Route Display */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-lg"></div>
                  <span className="text-2xl font-bold text-white">{announcement.trajet.depart.ville}</span>
                </div>
                
                <div className="flex-1 relative min-w-[100px]">
                  <div className="h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-red-400 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-white">{announcement.trajet.destination.ville}</span>
                  <div className="w-4 h-4 bg-red-400 rounded-full shadow-lg"></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">{formatDate(announcement.planning.dateDepart)}</span>
                </div>
                {announcement.planning.dateDepart && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{formatTime(announcement.planning.dateDepart)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {canSendDemand() && (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowDemandModal(true)}
                  className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Envoyer une demande</span>
                </button>
                
                <div className="text-center">
                  <span className="text-blue-200 text-sm">Réponse sous 24h garantie</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl m-2 shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Type de marchandise</h3>
                </div>
                <p className="text-2xl font-bold text-blue-900">{announcement.typesMarchandise.join(', ')}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Weight className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-emerald-900">Capacité disponible</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-900">
                  {announcement.capacite.poidsMax} <span className="text-lg">kg</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Distance</h3>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {announcement.trajet.distance || 'N/A'} <span className="text-lg">km</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Timer className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900">Durée estimée</h3>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {announcement.trajet.dureeEstimee || 'N/A'} <span className="text-lg">heures</span>
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span>Informations rapides</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publié le</span>
                    <span className="font-medium">{formatDate(announcement.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vues</span>
                    <span className="font-medium">{announcement.statistiques.nombreVues || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demandes</span>
                    <span className="font-medium">{announcement.statistiques.nombreDemandes || 0}</span>
                  </div>
                </div>
              </div>

              {announcement.tarification.prixFixe && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg border border-yellow-200 p-6">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Prix indicatif</span>
                  </h3>
                  <p className="text-3xl font-bold text-yellow-900">{announcement.tarification.prixFixe} MAD</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Route Tab */}
        {activeTab === 'route' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
              <Route className="h-6 w-6 text-blue-500" />
              <span>Itinéraire détaillé</span>
            </h3>
            
            {/* Route Visual */}
            <div className="relative">
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="w-1 h-24 bg-gradient-to-b from-emerald-500 to-blue-500"></div>
                  {announcement.trajet.etapesIntermediaires?.map((_, index) => (
                    <React.Fragment key={index}>
                      <div className="w-4 h-4 bg-blue-400 rounded-full shadow-md"></div>
                      <div className="w-1 h-16 bg-gradient-to-b from-blue-400 to-blue-500"></div>
                    </React.Fragment>
                  ))}
                  <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  {/* Departure */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-emerald-900 mb-2">{announcement.trajet.depart.ville}</h4>
                        <p className="text-emerald-700 font-medium">Point de départ</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-emerald-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(announcement.planning.dateDepart)}</span>
                          </div>
                          {announcement.planning.dateDepart && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(announcement.planning.dateDepart)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-emerald-500">
                        🚀
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Steps */}
                  {announcement.trajet.etapesIntermediaires?.map((etape, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900 mb-1">{etape.ville}</h4>
                          <p className="text-blue-700">Étape intermédiaire {index + 1}</p>
                        </div>
                        <div className="text-blue-500">
                          📍
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Destination */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-red-900 mb-2">{announcement.trajet.destination.ville}</h4>
                        <p className="text-red-700 font-medium">Destination finale</p>
                        {announcement.planning.dateArriveeEstimee && (
                          <div className="flex items-center space-x-1 mt-3 text-sm text-red-600">
                            <Clock className="h-4 w-4" />
                            <span>Arrivée estimée: {formatTime(announcement.planning.dateArriveeEstimee)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-red-500">
                        🏁
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <Truck className="h-6 w-6 text-blue-500" />
                <span>Véhicule</span>
              </h3>
              
              {announcement.vehicule && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{announcement.vehicule.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Marque</p>
                        <p className="text-lg font-semibold text-gray-900">{announcement.vehicule.marque || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Modèle</p>
                        <p className="text-lg font-semibold text-gray-900">{announcement.vehicule.modele || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Immatriculation</p>
                        <p className="text-lg font-semibold text-gray-900">{announcement.vehicule.immatriculation || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {announcement.vehicule.photos && announcement.vehicule.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span>Photos du véhicule</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {announcement.vehicule.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Véhicule ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cargo Details */}
            <div className="space-y-8">
              {/* Capacity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <Package className="h-6 w-6 text-purple-500" />
                  <span>Détails du transport</span>
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Weight className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Poids max</span>
                      </div>
                      <p className="text-xl font-bold text-purple-900">{announcement.capacite.poidsMax} kg</p>
                    </div>
                    
                    {announcement.capacite.dimensionsMax && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Ruler className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Dimensions</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-900">{`${announcement.capacite.dimensionsMax.longueur}x${announcement.capacite.dimensionsMax.largeur}x${announcement.capacite.dimensionsMax.hauteur} cm`}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Types acceptés</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(announcement.typesMarchandise) ? 
                        announcement.typesMarchandise.map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-orange-900 border border-orange-200">
                            {type}
                          </span>
                        )) :
                        <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-orange-900 border border-orange-200">
                          {announcement.typeMarchandise}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              {announcement.conditions && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-green-500" />
                    <span>Conditions</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {announcement.conditions.assuranceIncluse && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>Assurance incluse</span>
                      </div>
                    )}
                    {announcement.conditions.suiviGPS && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span>Suivi GPS disponible</span>
                      </div>
                    )}
                    {announcement.conditions.paiementAccepte && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Modes de paiement acceptés:</p>
                        <div className="flex flex-wrap gap-2">
                          {announcement.conditions.paiementAccepte.map((mode, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {mode}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Driver Tab */}
        {activeTab === 'driver' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Driver Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    {announcement.conducteur.avatar ? (
                      <img
                        src={announcement.conducteur.avatar}
                        alt="Conducteur"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {getInitials(`${announcement.conducteur.prenom} ${announcement.conducteur.nom}`)}
                      </span>
                    )}
                  </div>
                  
                  {announcement.conducteur.verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <BadgeCheck className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {announcement.conducteur.prenom} {announcement.conducteur.nom}
                </h3>
                
                <div className="flex items-center justify-center space-x-3 mb-6">
                  {announcement.conducteur.verified && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Conducteur vérifié</span>
                    </div>
                  )}
                  
                  {announcement.conducteur.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{announcement.conducteur.rating}</span>
                      <span className="text-gray-500 text-sm">
                        ({announcement.conducteur.statistiques?.reviewsCount || 0} avis)
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  {announcement.conducteur.telephone && (
                    <a
                      href={`tel:${announcement.conducteur.telephone}`}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Appeler</span>
                    </a>
                  )}
                  
                  <a
                    href={`mailto:${announcement.conducteur.email}`}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Driver Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-500" />
                  <span>Statistiques</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{announcement.conducteur.statistiques?.totalTrips || 0}</p>
                    <p className="text-sm text-gray-600">Trajets totaux</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{announcement.conducteur.statistiques?.completedTrips || 0}</p>
                    <p className="text-sm text-gray-600">Terminés</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{announcement.conducteur.statistiques?.reviewsCount || 0}</p>
                    <p className="text-sm text-gray-600">Avis clients</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Fiabilité</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact</h3>
                
                <div className="space-y-4">
                  {announcement.conducteur.telephone && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Téléphone</p>
                        <p className="text-gray-600">{formatPhoneNumber(announcement.conducteur.telephone)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{announcement.conducteur.email}</p>
                    </div>
                  </div>
                  
                  {announcement.conducteur.ville && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Localisation</p>
                        <p className="text-gray-600">{announcement.conducteur.ville}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {announcement.details && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
            <Info className="h-6 w-6 text-blue-500" />
            <span>Description détaillée</span>
          </h3>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <p className="text-gray-700 leading-relaxed text-lg">{announcement.details.description}</p>
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-8 mt-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Sécurité et confiance</h3>
            <p className="text-blue-800 leading-relaxed">
              Vérifiez toujours l'identité du conducteur et l'état du véhicule avant le transport. 
              TransportConnect recommande de rencontrer le conducteur avant d'accepter le transport 
              et de vérifier que le véhicule correspond aux spécifications annoncées.
            </p>
          </div>
        </div>
      </div>

      {/* Send Demand Modal */}
      <ConfirmationModal
        isOpen={showDemandModal}
        onClose={() => setShowDemandModal(false)}
        onConfirm={handleSendDemand}
        title="Envoyer une demande de transport"
        message={
          <div className="space-y-6">
            <p className="text-lg">
              Vous allez envoyer une demande à <strong>{announcement.conducteur.prenom} {announcement.conducteur.nom}</strong> pour le trajet:
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 text-lg font-semibold mb-3">
                <span>{announcement.trajet.depart.ville}</span>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <span>{announcement.trajet.destination.ville}</span>
              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(announcement.planning.dateDepart)}</span>
                </div>
                {announcement.planning.dateDepart && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(announcement.planning.dateDepart)}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Message personnalisé (optionnel)
              </label>
              <textarea
                value={demandMessage}
                onChange={(e) => setDemandMessage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                rows="4"
                placeholder="Décrivez votre colis, vos exigences particulières ou toute information utile pour le conducteur..."
              />
            </div>
          </div>
        }
        confirmText={sending ? "Envoi en cours..." : "Envoyer la demande"}
        type="info"
      />
    </div>
  );
};

export default AnnonceDetails;