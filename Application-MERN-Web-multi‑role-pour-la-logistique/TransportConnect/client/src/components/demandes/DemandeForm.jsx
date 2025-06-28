import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Package, MessageCircle, MapPin, Info, AlertCircle } from 'lucide-react';
import { CARGO_TYPES } from '../../utils/constants';
import { InlineLoading } from '../common/Loading';

const DemandForm = ({ 
  announcement, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      typeColis: '',
      poids: '',
      dimensions: '',
      valeurDeclaree: '',
      message: `Bonjour, je souhaite envoyer un colis de ${announcement?.lieuDepart} vers ${announcement?.destination}. Merci.`,
      instructionsSpeciales: '',
      pointRendezVous: '',
      urgence: false,
      fragile: false,
      assurance: false
    }
  });

  const watchedFields = watch();

  // Calculate estimated price based on weight and distance
  React.useEffect(() => {
    if (watchedFields.poids && announcement) {
      const basePrice = 10; // Base price per kg
      const weightMultiplier = parseFloat(watchedFields.poids) || 0;
      const urgencyMultiplier = watchedFields.urgence ? 1.5 : 1;
      const fragileMultiplier = watchedFields.fragile ? 1.2 : 1;
      
      const estimated = basePrice * weightMultiplier * urgencyMultiplier * fragileMultiplier;
      setEstimatedPrice(Math.round(estimated));
    } else {
      setEstimatedPrice(null);
    }
  }, [watchedFields.poids, watchedFields.urgence, watchedFields.fragile, announcement]);

  const onFormSubmit = async (data) => {
    const demandData = {
      ...data,
      annonce: announcement._id,
      poids: parseFloat(data.poids),
      valeurDeclaree: data.valeurDeclaree ? parseFloat(data.valeurDeclaree) : null,
      estimatedPrice
    };
    
    await onSubmit(demandData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Envoyer une demande de transport
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Trajet sélectionné</h3>
              <p className="text-blue-800">
                <strong>{announcement?.lieuDepart}</strong> → <strong>{announcement?.destination}</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Date: {new Date(announcement?.dateDepart).toLocaleDateString('fr-FR')}
                {announcement?.heureDepart && ` à ${announcement.heureDepart}`}
              </p>
              <p className="text-sm text-blue-700">
                Capacité disponible: {announcement?.capaciteDisponible} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Package Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary-600" />
            <span>Détails du colis</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de colis *
              </label>
              <select
                {...register('typeColis', { required: 'Le type de colis est requis' })}
                className={`input-field ${errors.typeColis ? 'border-red-300' : ''}`}
              >
                <option value="">Sélectionner un type</option>
                {CARGO_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.typeColis && (
                <p className="mt-1 text-sm text-red-600">{errors.typeColis.message}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids (kg) *
              </label>
              <input
                {...register('poids', {
                  required: 'Le poids est requis',
                  min: { value: 0.1, message: 'Le poids doit être supérieur à 0' },
                  max: { 
                    value: announcement?.capaciteDisponible || 1000, 
                    message: `Le poids ne peut pas dépasser ${announcement?.capaciteDisponible} kg` 
                  }
                })}
                type="number"
                step="0.1"
                min="0.1"
                max={announcement?.capaciteDisponible || 1000}
                className={`input-field ${errors.poids ? 'border-red-300' : ''}`}
                placeholder="Ex: 5.5"
              />
              {errors.poids && (
                <p className="mt-1 text-sm text-red-600">{errors.poids.message}</p>
              )}
              {announcement?.capaciteDisponible && (
                <p className="mt-1 text-xs text-gray-500">
                  Capacité maximum: {announcement.capaciteDisponible} kg
                </p>
              )}
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions (optionnel)
              </label>
              <input
                {...register('dimensions')}
                type="text"
                className="input-field"
                placeholder="Ex: 30x25x15 cm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: longueur x largeur x hauteur
              </p>
            </div>

            {/* Declared Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valeur déclarée (MAD) (optionnel)
              </label>
              <input
                {...register('valeurDeclaree', {
                  min: { value: 0, message: 'La valeur ne peut pas être négative' }
                })}
                type="number"
                min="0"
                className={`input-field ${errors.valeurDeclaree ? 'border-red-300' : ''}`}
                placeholder="Ex: 500"
              />
              {errors.valeurDeclaree && (
                <p className="mt-1 text-sm text-red-600">{errors.valeurDeclaree.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Pour l'assurance en cas de perte ou dommage
              </p>
            </div>
          </div>

          {/* Package Options */}
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-gray-900">Options du colis</h4>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  {...register('fragile')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Colis fragile (+20% sur le prix)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  {...register('urgence')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Transport urgent (+50% sur le prix)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  {...register('assurance')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Assurance complémentaire</span>
              </label>
            </div>
          </div>

          {/* Price Estimation */}
          {estimatedPrice && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Prix estimé</h4>
                  <p className="text-2xl font-bold text-green-800">{estimatedPrice} MAD</p>
                  <p className="text-sm text-green-700">
                    Estimation basée sur le poids et les options sélectionnées
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary-600" />
            <span>Message au conducteur</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              {...register('message', {
                required: 'Un message est requis',
                minLength: { value: 10, message: 'Le message doit contenir au moins 10 caractères' }
              })}
              rows="4"
              className={`input-field resize-none ${errors.message ? 'border-red-300' : ''}`}
              placeholder="Décrivez votre demande et vos besoins spécifiques..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Soyez précis sur vos besoins pour augmenter vos chances d'acceptation
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary-600" />
            <span>Informations complémentaires</span>
          </h3>

          <div className="space-y-4">
            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions spéciales (optionnel)
              </label>
              <textarea
                {...register('instructionsSpeciales')}
                rows="2"
                className="input-field resize-none"
                placeholder="Ex: Manipulation délicate requise, emballage spécifique..."
              />
            </div>

            {/* Meeting Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point de rendez-vous préféré (optionnel)
              </label>
              <input
                {...register('pointRendezVous')}
                type="text"
                className="input-field"
                placeholder="Ex: Gare routière, Centre commercial..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Proposez un lieu de rendez-vous pratique pour les deux parties
              </p>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Conditions de transport</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Vérifiez l'identité du conducteur avant remise du colis</li>
                <li>• Assurez-vous que votre colis est bien emballé</li>
                <li>• Le conducteur peut refuser un colis non conforme à l'annonce</li>
                <li>• TransportConnect n'est pas responsable des dommages</li>
              </ul>
              
              <label className="flex items-center mt-4">
                <input
                  {...register('acceptTerms', {
                    required: 'Vous devez accepter les conditions'
                  })}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-yellow-900">
                  J'accepte les conditions de transport
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>
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
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <InlineLoading message="Envoi de la demande..." />
            ) : (
              'Envoyer la demande'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemandForm;