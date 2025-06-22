import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { formatDate, formatTime, getInitials, formatPhoneNumber } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { demandeAPI } from '../../utils/api';
import { ConfirmationModal } from '../common/Modal';
import toast from 'react-hot-toast';

const AnnouncementDetails = ({ announcement, onClose }) => {
  const { user, isSender } = useAuth();
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandMessage, setDemandMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendDemand = async () => {
    try {
      setSending(true);
      await demandeAPI.create({
        annonce: announcement._id,
        expediteur: user._id,
        message: demandMessage || `Demande pour le transport de ${announcement.lieuDepart} vers ${announcement.destination}`,
        typeColis: 'Colis standard',
        poids: 5,
        dimensions: '30x30x30 cm'
      });
      
      toast.success('Demande envoyée avec succès !');
      setShowDemandModal(false);
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setSending(false);
    }
  };

  const canSendDemand = () => {
    return isSender() && announcement.conducteur._id !== user._id && announcement.status === 'active';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Transport disponible
            </h1>
            <div className="flex items-center space-x-3">
              <span className={`badge badge-${announcement.status === 'active' ? 'success' : 'warning'}`}>
                {announcement.status === 'active' ? 'Disponible' : 'Non disponible'}
              </span>
              <span className="text-sm text-gray-500">
                Publié le {formatDate(announcement.createdAt)}
              </span>
            </div>
          </div>
          
          {canSendDemand() && (
            <button
              onClick={() => setShowDemandModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Envoyer une demande</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-primary-600" />
              <span>Itinéraire</span>
            </h3>
            
            <div className="space-y-4">
              {/* Route Visual */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{announcement.lieuDepart}</span>
                      <span className="text-sm text-green-600 font-medium">Départ</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.dateDepart)}</span>
                      </div>
                      {announcement.heureDepart && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(announcement.heureDepart)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{announcement.destination}</span>
                      <span className="text-sm text-red-600 font-medium">Arrivée</span>
                    </div>
                    {announcement.heureArriveeEstimee && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Arrivée estimée: {formatTime(announcement.heureArriveeEstimee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Intermediate Steps */}
              {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Étapes intermédiaires:</h4>
                  <div className="flex flex-wrap gap-2">
                    {announcement.etapesIntermediaires.map((etape, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700">
                        <MapPin className="h-3 w-3 mr-1" />
                        {etape}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transport Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-600" />
              <span>Détails du transport</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de marchandise acceptée
                  </label>
                  <p className="text-gray-900">{announcement.typeMarchandise}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité disponible
                  </label>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{announcement.capaciteDisponible} kg</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {announcement.dimensionsMax && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions maximales
                    </label>
                    <p className="text-gray-900">{announcement.dimensionsMax}</p>
                  </div>
                )}
                
                {announcement.prix && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix indicatif
                    </label>
                    <p className="text-gray-900 font-medium">{announcement.prix} MAD</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {announcement.description && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary-600" />
                <span>Description</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">{announcement.description}</p>
            </div>
          )}

          {/* Special Instructions */}
          {announcement.instructionsSpeciales && (
            <div className="card border-yellow-200 bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Instructions spéciales
              </h3>
              <p className="text-yellow-800">{announcement.instructionsSpeciales}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Driver Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-600" />
              <span>Conducteur</span>
            </h3>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                {announcement.conducteur.avatar ? (
                  <img
                    src={announcement.conducteur.avatar}
                    alt="Conducteur"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-600">
                    {getInitials(`${announcement.conducteur.prenom} ${announcement.conducteur.nom}`)}
                  </span>
                )}
              </div>
              
              <h4 className="font-semibold text-gray-900">
                {announcement.conducteur.prenom} {announcement.conducteur.nom}
              </h4>
              
              <div className="flex items-center justify-center space-x-2 mt-2">
                {announcement.conducteur.verified && (
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Vérifié</span>
                  </div>
                )}
                
                {announcement.conducteur.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{announcement.conducteur.rating}</span>
                    <span className="text-sm text-gray-500">
                      ({announcement.conducteur.reviewsCount || 0} avis)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-4 border-t">
              {announcement.conducteur.telephone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatPhoneNumber(announcement.conducteur.telephone)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{announcement.conducteur.email}</span>
              </div>
              
              {announcement.conducteur.ville && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{announcement.conducteur.ville}</span>
                </div>
              )}
            </div>

            {/* Driver Stats */}
            {announcement.conducteur.stats && (
              <div className="pt-4 border-t mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {announcement.conducteur.stats.totalTrips || 0}
                    </p>
                    <p className="text-xs text-gray-600">Trajets</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {announcement.conducteur.stats.completedTrips || 0}
                    </p>
                    <p className="text-xs text-gray-600">Terminés</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canSendDemand() && (
                <button
                  onClick={() => setShowDemandModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Envoyer une demande</span>
                </button>
              )}
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span>Voir le profil</span>
              </button>
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Voir les avis</span>
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="card border-blue-200 bg-blue-50">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Sécurité</h4>
                <p className="text-sm text-blue-800">
                  Vérifiez toujours l'identité du conducteur et l'état du véhicule avant le transport.
                </p>
              </div>
            </div>
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
          <div className="space-y-4">
            <p>
              Vous allez envoyer une demande à <strong>{announcement.conducteur.prenom} {announcement.conducteur.nom}</strong> pour le trajet:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">{announcement.lieuDepart}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium">{announcement.destination}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDate(announcement.dateDepart)}
                {announcement.heureDepart && ` à ${formatTime(announcement.heureDepart)}`}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={demandMessage}
                onChange={(e) => setDemandMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
                placeholder="Ajoutez un message personnalisé..."
              />
            </div>
          </div>
        }
        confirmText={sending ? "Envoi..." : "Envoyer la demande"}
        type="info"
      />
    </div>
  );
};

export default AnnouncementDetails;