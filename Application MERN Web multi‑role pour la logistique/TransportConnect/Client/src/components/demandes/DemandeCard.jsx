import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Package, 
  User, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowRight
} from 'lucide-react';
import { formatDate, formatTime, getInitials, getStatusColor, getStatusLabel } from '../../utils/helpers';

const DemandCard = ({ 
  demand, 
  userRole, 
  onAccept, 
  onReject, 
  onComplete, 
  onViewDetails 
}) => {
  const isConductor = userRole === 'conducteur';
  const canTakeAction = isConductor && demand.status === 'pending';
  const canComplete = isConductor && demand.status === 'accepted';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow border-l-4 border-l-primary-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Status and Date */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(demand.status)}
              <span className={`badge badge-${getStatusColor(demand.status)}`}>
                {getStatusLabel(demand.status)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(demand.createdAt)}
            </span>
          </div>

          {/* Route */}
          {demand.annonce && (
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                <span>{demand.annonce.lieuDepart}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span>{demand.annonce.destination}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(demand.annonce.dateDepart)}</span>
                {demand.annonce.heureDepart && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(demand.annonce.heureDepart)}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="text-gray-400 hover:text-primary-600 transition-colors"
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Package className="h-4 w-4 text-primary-600" />
            <span>Colis</span>
          </h4>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium text-gray-900">
                {demand.typeColis || 'Non spécifié'}
              </span>
            </div>
            
            {demand.poids && (
              <div>
                <span className="text-gray-600">Poids:</span>
                <span className="ml-2 font-medium text-gray-900">{demand.poids} kg</span>
              </div>
            )}
            
            {demand.dimensions && (
              <div>
                <span className="text-gray-600">Dimensions:</span>
                <span className="ml-2 font-medium text-gray-900">{demand.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sender/Recipient Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <User className="h-4 w-4 text-primary-600" />
            <span>{isConductor ? 'Expéditeur' : 'Conducteur'}</span>
          </h4>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {isConductor ? (
                demand.expediteur?.avatar ? (
                  <img
                    src={demand.expediteur.avatar}
                    alt="Expéditeur"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {getInitials(`${demand.expediteur?.prenom} ${demand.expediteur?.nom}`)}
                  </span>
                )
              ) : (
                demand.annonce?.conducteur?.avatar ? (
                  <img
                    src={demand.annonce.conducteur.avatar}
                    alt="Conducteur"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {getInitials(`${demand.annonce?.conducteur?.prenom} ${demand.annonce?.conducteur?.nom}`)}
                  </span>
                )
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isConductor 
                  ? `${demand.expediteur?.prenom} ${demand.expediteur?.nom}`
                  : `${demand.annonce?.conducteur?.prenom} ${demand.annonce?.conducteur?.nom}`
                }
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isConductor ? demand.expediteur?.email : demand.annonce?.conducteur?.email}
              </p>
              
              {/* Rating */}
              {((isConductor && demand.expediteur?.rating) || (!isConductor && demand.annonce?.conducteur?.rating)) && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(isConductor ? demand.expediteur.rating : demand.annonce.conducteur.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {isConductor ? demand.expediteur.rating : demand.annonce.conducteur.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message and Actions */}
        <div className="space-y-3">
          {/* Message */}
          {demand.message && (
            <div>
              <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                <MessageCircle className="h-4 w-4 text-primary-600" />
                <span>Message</span>
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {demand.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            {canTakeAction && (
              <div className="flex space-x-2">
                <button
                  onClick={onAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accepter</span>
                </button>
                <button
                  onClick={onReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Refuser</span>
                </button>
              </div>
            )}

            {canComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Marquer terminé</span>
              </button>
            )}

            {/* Contact Button */}
            {demand.status === 'accepted' && (
              <button className="w-full btn-secondary text-sm py-2 flex items-center justify-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>Contacter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(demand.instructionsSpeciales || demand.pointRendezVous) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {demand.instructionsSpeciales && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">Instructions spéciales:</span>
              <p className="text-sm text-gray-600 mt-1">{demand.instructionsSpeciales}</p>
            </div>
          )}
          
          {demand.pointRendezVous && (
            <div>
              <span className="text-sm font-medium text-gray-700">Point de rendez-vous:</span>
              <p className="text-sm text-gray-600 mt-1">{demand.pointRendezVous}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer with timestamps */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Demande envoyée le {formatDate(demand.createdAt)}</span>
        {demand.updatedAt !== demand.createdAt && (
          <span>Mis à jour le {formatDate(demand.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default DemandCard;