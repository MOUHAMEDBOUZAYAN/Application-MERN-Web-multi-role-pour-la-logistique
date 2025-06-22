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
  ArrowRight
} from 'lucide-react';
import { formatDate, formatTime, getInitials, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { demandsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../common/Modal';

const AnnouncementCard = ({ announcement, onClick, showActions = false, variant = 'default' }) => {
  const { user, isSender } = useAuth();
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendDemand = async () => {
    try {
      setSending(true);
      await demandsAPI.create({
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
    return isSender() && announcement.conducteur._id !== user._id && announcement.status === 'active';
  };

  return (
    <>
      <div className={`card hover:shadow-lg transition-all duration-200 cursor-pointer group ${
        variant === 'compact' ? 'p-4' : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Route */}
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 min-w-0">
                <span className="truncate">{announcement.lieuDepart}</span>
                <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">{announcement.destination}</span>
              </div>
            </div>

            {/* Intermediate Steps */}
            {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Via: {announcement.etapesIntermediaires.slice(0, 2).join(', ')}
                {announcement.etapesIntermediaires.length > 2 && ` +${announcement.etapesIntermediaires.length - 2}`}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <span className={`badge badge-${getStatusColor(announcement.status)} flex-shrink-0`}>
            {getStatusLabel(announcement.status)}
          </span>
        </div>

        {/* Main Content */}
        <div onClick={onClick} className="space-y-3">
          {/* Date and Time */}
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

          {/* Cargo Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{announcement.typeMarchandise}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Truck className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {announcement.capaciteDisponible}kg
              </span>
            </div>
          </div>

          {/* Dimensions */}
          {announcement.dimensionsMax && (
            <div className="text-xs text-gray-500">
              Dimensions max: {announcement.dimensionsMax}
            </div>
          )}

          {/* Description Preview */}
          {announcement.description && variant !== 'compact' && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {announcement.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Driver Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {announcement.conducteur.avatar ? (
                  <img
                    src={announcement.conducteur.avatar}
                    alt="Conducteur"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {getInitials(`${announcement.conducteur.prenom} ${announcement.conducteur.nom}`)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {announcement.conducteur.prenom} {announcement.conducteur.nom}
                </p>
                <div className="flex items-center space-x-2">
                  {announcement.conducteur.verified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Vérifié
                    </span>
                  )}
                  {announcement.conducteur.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {announcement.conducteur.rating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="Voir les détails"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              {showActions && canSendDemand() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDemandModal(true);
                  }}
                  className="btn-primary text-xs px-3 py-1"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Demander
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-200 rounded-lg pointer-events-none transition-colors duration-200"></div>
      </div>

      {/* Send Demand Modal */}
      <ConfirmationModal
        isOpen={showDemandModal}
        onClose={() => setShowDemandModal(false)}
        onConfirm={handleSendDemand}
        title="Envoyer une demande"
        message={`Voulez-vous envoyer une demande de transport à ${announcement.conducteur.prenom} ${announcement.conducteur.nom} pour le trajet ${announcement.lieuDepart} → ${announcement.destination} ?`}
        confirmText={sending ? "Envoi..." : "Envoyer"}
        type="info"
      />
    </>
  );
};

export default AnnouncementCard;