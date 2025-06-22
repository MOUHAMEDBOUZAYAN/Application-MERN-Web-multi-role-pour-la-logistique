import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star, MessageCircle, User, Package } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { InlineLoading } from '../common/Loading';

const EvaluationForm = ({ 
  demand, 
  userToEvaluate, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [ratings, setRatings] = useState({
    ponctualite: 0,
    communication: 0,
    soin: 0,
    professionnalisme: 0
  });
  const [overallRating, setOverallRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      commentaire: '',
      recommande: true
    }
  });

  const watchedComment = watch('commentaire');

  const handleRatingChange = (criterion, rating) => {
    const newRatings = { ...ratings, [criterion]: rating };
    setRatings(newRatings);
    
    // Calculate overall rating as average
    const total = Object.values(newRatings).reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / Object.keys(newRatings).length);
    setOverallRating(average);
  };

  const renderStarRating = (criterion, value) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(criterion, star)}
            className={`p-1 transition-colors duration-200 ${
              star <= value 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star 
              className={`h-6 w-6 ${star <= value ? 'fill-current' : ''}`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : 'Non noté'}
        </span>
      </div>
    );
  };

  const onFormSubmit = async (data) => {
    if (overallRating === 0) {
      alert('Veuillez attribuer au moins une note');
      return;
    }

    const evaluationData = {
      demande: demand._id,
      evalue: userToEvaluate._id,
      note: overallRating,
      criteres: ratings,
      commentaire: data.commentaire,
      recommande: data.recommande
    };

    await onSubmit(evaluationData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Évaluer le transport
        </h2>
        <p className="text-gray-600">
          Votre avis aide à améliorer la qualité de service sur la plateforme
        </p>
      </div>

      {/* Transport Info */}
      <div className="card mb-6">
        <div className="flex items-start space-x-4">
          <Package className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Transport réalisé</h3>
            <p className="text-gray-700">
              <strong>{demand?.annonce?.lieuDepart}</strong> → <strong>{demand?.annonce?.destination}</strong>
            </p>
            <p className="text-sm text-gray-500">
              {new Date(demand?.annonce?.dateDepart).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {userToEvaluate?.avatar ? (
              <img
                src={userToEvaluate.avatar}
                alt={`${userToEvaluate.prenom} ${userToEvaluate.nom}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {getInitials(`${userToEvaluate?.prenom} ${userToEvaluate?.nom}`)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {userToEvaluate?.prenom} {userToEvaluate?.nom}
            </h3>
            <p className="text-sm text-gray-600">{userToEvaluate?.email}</p>
            {userToEvaluate?.rating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {userToEvaluate.rating} ({userToEvaluate.reviewsCount || 0} avis)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Rating Criteria */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notez votre expérience
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Ponctualité</h4>
                <p className="text-sm text-gray-600">Respect des horaires convenus</p>
              </div>
              {renderStarRating('ponctualite', ratings.ponctualite)}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Communication</h4>
                <p className="text-sm text-gray-600">Qualité des échanges et réactivité</p>
              </div>
              {renderStarRating('communication', ratings.communication)}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Soin du colis</h4>
                <p className="text-sm text-gray-600">Manipulation et état de livraison</p>
              </div>
              {renderStarRating('soin', ratings.soin)}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Professionnalisme</h4>
                <p className="text-sm text-gray-600">Attitude et service général</p>
              </div>
              {renderStarRating('professionnalisme', ratings.professionnalisme)}
            </div>
          </div>

          {/* Overall Rating Display */}
          {overallRating > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= overallRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-medium text-yellow-900">
                    Note globale: {overallRating}/5
                  </p>
                  <p className="text-sm text-yellow-700">
                    {overallRating === 5 ? 'Excellent' :
                     overallRating === 4 ? 'Très bien' :
                     overallRating === 3 ? 'Bien' :
                     overallRating === 2 ? 'Passable' : 'Insuffisant'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary-600" />
            <span>Commentaire</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partagez votre expérience (optionnel)
            </label>
            <textarea
              {...register('commentaire')}
              rows="4"
              className="input-field resize-none"
              placeholder="Décrivez votre expérience avec ce conducteur/expéditeur..."
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Votre commentaire sera visible publiquement
              </p>
              <span className="text-xs text-gray-500">
                {watchedComment?.length || 0}/500
              </span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommandation
          </h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                {...register('recommande')}
                type="radio"
                value="true"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Je recommande cette personne
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                {...register('recommande')}
                type="radio"
                value="false"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                Je ne recommande pas cette personne
              </span>
            </label>
          </div>
        </div>

        {/* Guidelines */}
        <div className="card border-blue-200 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">
            Conseils pour une évaluation constructive
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Soyez honnête et objectif dans votre évaluation</li>
            <li>• Mentionnez les points positifs et les axes d'amélioration</li>
            <li>• Évitez les commentaires personnels ou offensants</li>
            <li>• Votre avis aide les autres utilisateurs à faire confiance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || overallRating === 0}
            className="btn-primary"
          >
            {loading ? (
              <InlineLoading message="Publication..." />
            ) : (
              'Publier l\'évaluation'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm;