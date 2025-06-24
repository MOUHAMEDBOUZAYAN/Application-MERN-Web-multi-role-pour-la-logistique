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
  BadgeCheck
} from 'lucide-react';
import { formatDate, formatTime, getInitials, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { demandeAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../common/Modal';

const AnnouncementCard = ({ announcement, onClick, showActions = false, variant = 'default' }) => {
  const { user, isSender } = useAuth();
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSendDemand = async () => {
    try {
      setSending(true);
      await demandeAPI.create({
        annonce: announcement._id,
        expediteur: user._id,
        message: `Demande pour le transport de ${announcement.lieuDepart} vers ${announcement.destination}`
      });
      
      toast.success('Demande envoyée avec succès !');
      setShowDemandModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setSending(false);
    }
  };

  const canSendDemand = () => {
    return isSender() && announcement.conducteur?._id !== user._id && announcement.status === 'active';
  };

  const getPriorityBadge = () => {
    const hoursUntilDeparture = Math.floor((new Date(announcement.dateDepart) - new Date()) / (1000 * 60 * 60));
    if (hoursUntilDeparture <= 24) {
      return { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200', icon: Zap };
    } else if (hoursUntilDeparture <= 72) {
      return { label: 'Bientôt', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Timer };
    }
    return null;
  };

  const priority = getPriorityBadge();

  return (
    <>
      <div 
        className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 ${
          variant === 'compact' ? 'p-4' : 'p-6'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Priority Badge */}
        {priority && (
          <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${priority.color} backdrop-blur-sm z-10`}>
            <priority.icon className="h-3 w-3" />
            <span>{priority.label}</span>
          </div>
        )}

        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              {/* Route with Enhanced Visual */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                    <span className="font-bold text-gray-900 text-lg truncate">{announcement.lieuDepart}</span>
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
                    <span className="font-bold text-gray-900 text-lg truncate">{announcement.destination}</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  </div>
                </div>

                {/* Distance and Duration */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {announcement.distance && (
                    <div className="flex items-center space-x-1">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{announcement.distance} km</span>
                    </div>
                  )}
                  {announcement.dureeEstimee && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{announcement.dureeEstimee}h</span>
                    </div>
                  )}
                </div>

                {/* Intermediate Steps */}
                {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
                  <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Étapes intermédiaires:</p>
                    <div className="flex flex-wrap gap-1">
                      {announcement.etapesIntermediaires.slice(0, 2).map((etape, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs text-gray-700">
                          {etape}
                        </span>
                      ))}
                      {announcement.etapesIntermediaires.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          +{announcement.etapesIntermediaires.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                announcement.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {announcement.status === 'active' && <CheckCircle className="h-3 w-3" />}
                <span>{getStatusLabel(announcement.status)}</span>
              </span>
              
              {announcement.conducteur?.verified && (
                <div className="flex items-center space-x-1 text-xs">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">Vérifié</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div onClick={onClick} className="space-y-4">
            {/* Date and Time Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(announcement.dateDepart)}</p>
                    <p className="text-xs text-gray-600">Date de départ</p>
                  </div>
                </div>
                
                {announcement.heureDepart && (
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 text-right">{formatTime(announcement.heureDepart)}</p>
                      <p className="text-xs text-gray-600">Heure prévue</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cargo and Capacity Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-800 uppercase tracking-wide">Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{announcement.typeMarchandise}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Weight className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Capacité</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {announcement.capaciteDisponible}
                  <span className="text-xs text-gray-600 ml-1">kg</span>
                </p>
              </div>
            </div>

            {/* Price Information */}
            {announcement.prix && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1">Prix indicatif</p>
                    <p className="text-lg font-bold text-gray-900">{announcement.prix} MAD</p>
                  </div>
                  <div className="text-yellow-600">
                    💰
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            {announcement.vehicule && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Truck className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {announcement.vehicule.marque} {announcement.vehicule.modele}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{announcement.vehicule.type}</p>
                </div>
              </div>
            )}

            {/* Description Preview */}
            {announcement.description && variant !== 'compact' && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  {announcement.description}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {/* Driver Information */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    {announcement.conducteur?.avatar ? (
                      <img
                        src={announcement.conducteur.avatar}
                        alt="Conducteur"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {getInitials(`${announcement.conducteur?.prenom} ${announcement.conducteur?.nom}`)}
                      </span>
                    )}
                  </div>
                  
                  {announcement.conducteur?.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {announcement.conducteur?.prenom} {announcement.conducteur?.nom}
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    {announcement.conducteur?.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700">
                          {announcement.conducteur.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({announcement.conducteur.reviewsCount || 0})
                        </span>
                      </div>
                    )}
                    
                    {announcement.conducteur?.totalTrips && (
                      <span className="text-xs text-gray-500">
                        {announcement.conducteur.totalTrips} trajets
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn"
                  title="Voir les détails"
                >
                  <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                </button>
                
                {showActions && canSendDemand() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDemandModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Demander</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {(announcement.vuesCount || announcement.demandesCount) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{announcement.vuesCount || 0} vues</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{announcement.demandesCount || 0} demandes</span>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  {Math.floor((new Date(announcement.dateDepart) - new Date()) / (1000 * 60 * 60 * 24))} jours restants
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hover Animation Effects */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-2xl transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* Floating Action Hint */}
        {isHovered && showActions && canSendDemand() && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            Cliquez pour demander ce transport
          </div>
        )}
      </div>

      {/* Send Demand Modal */}
      <ConfirmationModal
        isOpen={showDemandModal}
        onClose={() => setShowDemandModal(false)}
        onConfirm={handleSendDemand}
        title="Envoyer une demande"
        message={`Voulez-vous envoyer une demande de transport à ${announcement.conducteur?.prenom} ${announcement.conducteur?.nom} pour le trajet ${announcement.lieuDepart} → ${announcement.destination} ?`}
        confirmText={sending ? "Envoi..." : "Envoyer"}
        type="info"
      />
    </>
  );
};

export default AnnouncementCard;