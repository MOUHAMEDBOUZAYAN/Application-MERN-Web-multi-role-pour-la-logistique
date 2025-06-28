import React from 'react';
import { Star, User, Calendar, MessageCircle } from 'lucide-react';
import { formatDate, getInitials } from '../../utils/helpers';

const EvaluationCard = ({ evaluation, showDetails = true }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAvatarOrInitials = (user) => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={`${user.prenom} ${user.nom}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600">
          {getInitials(`${user?.prenom} ${user?.nom}`)}
        </span>
      </div>
    );
  };

  return (
    <div className="card border-l-4 border-l-yellow-400">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getAvatarOrInitials(evaluation.evaluateur)}
          <div>
            <h4 className="font-medium text-gray-900">
              {evaluation.evaluateur?.prenom} {evaluation.evaluateur?.nom}
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(evaluation.note)}
              </div>
              <span className="text-sm text-gray-600">
                {evaluation.note}/5
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(evaluation.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Rating Details */}
      {showDetails && evaluation.criteres && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Détails de l'évaluation</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {evaluation.criteres.ponctualite && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ponctualité:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(evaluation.criteres.ponctualite)}
                  <span className="text-gray-700 ml-1">{evaluation.criteres.ponctualite}/5</span>
                </div>
              </div>
            )}
            
            {evaluation.criteres.communication && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Communication:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(evaluation.criteres.communication)}
                  <span className="text-gray-700 ml-1">{evaluation.criteres.communication}/5</span>
                </div>
              </div>
            )}
            
            {evaluation.criteres.soin && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Soin du colis:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(evaluation.criteres.soin)}
                  <span className="text-gray-700 ml-1">{evaluation.criteres.soin}/5</span>
                </div>
              </div>
            )}
            
            {evaluation.criteres.professionnalisme && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Professionnalisme:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(evaluation.criteres.professionnalisme)}
                  <span className="text-gray-700 ml-1">{evaluation.criteres.professionnalisme}/5</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment */}
      {evaluation.commentaire && (
        <div className="mb-4">
          <div className="flex items-start space-x-2">
            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Commentaire</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                "{evaluation.commentaire}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transport Info */}
      {evaluation.transport && showDetails && (
        <div className="pt-3 border-t border-gray-100">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Transport concerné</h5>
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">{evaluation.transport.lieuDepart}</span>
              {' → '}
              <span className="font-medium">{evaluation.transport.destination}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(evaluation.transport.dateDepart)}
            </p>
          </div>
        </div>
      )}

      {/* Response from evaluated user */}
      {evaluation.reponse && (
        <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
          <div className="flex items-start space-x-3">
            {getAvatarOrInitials(evaluation.evalue)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h6 className="text-sm font-medium text-gray-900">
                  {evaluation.evalue?.prenom} {evaluation.evalue?.nom}
                </h6>
                <span className="text-xs text-gray-500">a répondu</span>
              </div>
              <p className="text-sm text-gray-700">
                "{evaluation.reponse}"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(evaluation.dateReponse)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationCard;