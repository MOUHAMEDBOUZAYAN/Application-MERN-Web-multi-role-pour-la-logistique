import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  User, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Star,
  Info,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { formatDate, formatTime, getInitials, formatPhoneNumber, getStatusColor, getStatusLabel } from '../../utils/helpers';

const DemandDetails = ({ 
  demand, 
  userRole, 
  onAccept, 
  onReject, 
  onComplete, 
  onClose 
}) => {
  const isConductor = userRole === 'conducteur';
  const canTakeAction = isConductor && demand.status === 'pending';
  const canComplete = isConductor && demand.status === 'accepted';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon(demand.status)}
          <span className={`badge badge-${getStatusColor(demand.status)} text-lg px-4 py-2`}>
            {getStatusLabel(demand.status)}
          </span>
          <span className="text-gray-500">
            Demande créée le {formatDate(demand.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        {canTakeAction && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={onAccept}
              className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Accepter la demande</span>
            </button>
            <button
              onClick={onReject}
              className="btn-danger flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Refuser la demande</span>
            </button>
          </div>
        )}

        {canComplete && (
          <div className="mb-6">
            <button
              onClick={onComplete}
              className="btn-primary bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Marquer comme terminé</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Information */}
          {demand.annonce && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-primary-600" />
                <span>Trajet demandé</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{demand.annonce.lieuDepart}</span>
                        <span className="text-sm text-green-600 font-medium">Départ</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(demand.annonce.dateDepart)}</span>
                        </div>
                        {demand.annonce.heureDepart && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(demand.annonce.heureDepart)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{demand.annonce.destination}</span>
                        <span className="text-sm text-red-600 font-medium">Arrivée</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intermediate Steps */}
                {demand.annonce.etapesIntermediaires && demand.annonce.etapesIntermediaires.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Étapes intermédiaires:</h4>
                    <div className="flex flex-wrap gap-2">
                      {demand.annonce.etapesIntermediaires.map((etape, index) => (
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
          )}

          {/* Package Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-600" />
              <span>Détails du colis</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de colis
                  </label>
                  <p className="text-gray-900">{demand.typeColis || 'Non spécifié'}</p>
                </div>
                
                {demand.poids && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poids
                    </label>
                    <p className="text-gray-900 font-medium">{demand.poids} kg</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {demand.dimensions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <p className="text-gray-900">{demand.dimensions}</p>
                  </div>
                )}
                
                {demand.valeurDeclaree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valeur déclarée
                    </label>
                    <p className="text-gray-900 font-medium">{demand.valeurDeclaree} MAD</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          {demand.message && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary-600" />
                <span>Message de l'expéditeur</span>
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{demand.message}</p>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {(demand.instructionsSpeciales || demand.pointRendezVous) && (
            <div className="card border-yellow-200 bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center space-x-2">
                <Info className="h-5 w-5 text-yellow-600" />
                <span>Instructions spéciales</span>
              </h3>
              
              <div className="space-y-3">
                {demand.instructionsSpeciales && (
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 mb-1">
                      Instructions
                    </label>
                    <p className="text-yellow-800">{demand.instructionsSpeciales}</p>
                  </div>
                )}
                
                {demand.pointRendezVous && (
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 mb-1">
                      Point de rendez-vous
                    </label>
                    <p className="text-yellow-800">{demand.pointRendezVous}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-600" />
              <span>{isConductor ? 'Expéditeur' : 'Conducteur'}</span>
            </h3>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                {isConductor ? (
                  demand.expediteur?.avatar ? (
                    <img
                      src={demand.expediteur.avatar}
                      alt="Expéditeur"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-600">
                      {getInitials(`${demand.expediteur?.prenom} ${demand.expediteur?.nom}`)}
                    </span>
                  )
                ) : (
                  demand.annonce?.conducteur?.avatar ? (
                    <img
                      src={demand.annonce.conducteur.avatar}
                      alt="Conducteur"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-600">
                      {getInitials(`${demand.annonce?.conducteur?.prenom} ${demand.annonce?.conducteur?.nom}`)}
                    </span>
                  )
                )}
              </div>
              
              <h4 className="font-semibold text-gray-900">
                {isConductor 
                  ? `${demand.expediteur?.prenom} ${demand.expediteur?.nom}`
                  : `${demand.annonce?.conducteur?.prenom} ${demand.annonce?.conducteur?.nom}`
                }
              </h4>
              
              {/* Rating */}
              {((isConductor && demand.expediteur?.rating) || (!isConductor && demand.annonce?.conducteur?.rating)) && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {isConductor ? demand.expediteur.rating : demand.annonce.conducteur.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(isConductor ? demand.expediteur.reviewsCount : demand.annonce.conducteur.reviewsCount) || 0} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {isConductor ? demand.expediteur?.email : demand.annonce?.conducteur?.email}
                </span>
              </div>
              
              {((isConductor && demand.expediteur?.telephone) || (!isConductor && demand.annonce?.conducteur?.telephone)) && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatPhoneNumber(isConductor ? demand.expediteur.telephone : demand.annonce.conducteur.telephone)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Demande créée</p>
                  <p className="text-xs text-gray-500">{formatDate(demand.createdAt)}</p>
                </div>
              </div>
              
              {demand.status !== 'pending' && (
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    demand.status === 'accepted' ? 'bg-green-500' : 
                    demand.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Demande {getStatusLabel(demand.status).toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(demand.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          {demand.status === 'accepted' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Ouvrir le chat</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Appeler</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandDetails;