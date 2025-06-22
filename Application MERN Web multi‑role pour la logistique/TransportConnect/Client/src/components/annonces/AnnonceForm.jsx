import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { MapPin, Calendar, Clock, Package, Plus, X, Info } from 'lucide-react';
import { CITIES, CARGO_TYPES } from '../../utils/constants';
import { InlineLoading } from '../common/Loading';

const AnnouncementForm = ({ announcement, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!announcement;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      lieuDepart: announcement?.lieuDepart || '',
      destination: announcement?.destination || '',
      etapesIntermediaires: announcement?.etapesIntermediaires || [],
      dateDepart: announcement?.dateDepart ? new Date(announcement.dateDepart).toISOString().split('T')[0] : '',
      heureDepart: announcement?.heureDepart || '',
      typeMarchandise: announcement?.typeMarchandise || '',
      capaciteDisponible: announcement?.capaciteDisponible || '',
      dimensionsMax: announcement?.dimensionsMax || '',
      prix: announcement?.prix || '',
      description: announcement?.description || '',
      instructionsSpeciales: announcement?.instructionsSpeciales || '',
      status: announcement?.status || 'active'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'etapesIntermediaires'
  });

  const watchedFields = watch();

  const onFormSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert date to proper format
      const formattedData = {
        ...data,
        dateDepart: new Date(data.dateDepart).toISOString(),
        capaciteDisponible: Number(data.capaciteDisponible),
        prix: data.prix ? Number(data.prix) : null,
        etapesIntermediaires: data.etapesIntermediaires.filter(etape => etape.trim() !== '')
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIntermediateStep = () => {
    append('');
  };

  const removeIntermediateStep = (index) => {
    remove(index);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Route Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary-600" />
          <span>Itinéraire</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu de départ *
            </label>
            <select
              {...register('lieuDepart', { required: 'Le lieu de départ est requis' })}
              className={`input-field ${errors.lieuDepart ? 'border-red-300' : ''}`}
            >
              <option value="">Sélectionner une ville</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.lieuDepart && (
              <p className="mt-1 text-sm text-red-600">{errors.lieuDepart.message}</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <select
              {...register('destination', { required: 'La destination est requise' })}
              className={`input-field ${errors.destination ? 'border-red-300' : ''}`}
            >
              <option value="">Sélectionner une ville</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
            )}
          </div>
        </div>

        {/* Intermediate Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Étapes intermédiaires (optionnel)
            </label>
            <button
              type="button"
              onClick={addIntermediateStep}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une étape</span>
            </button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <select
                {...register(`etapesIntermediaires.${index}`)}
                className="input-field flex-1"
              >
                <option value="">Sélectionner une ville</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIntermediateStep(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Date and Time Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          <span>Date et heure</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de départ *
            </label>
            <input
              {...register('dateDepart', { 
                required: 'La date de départ est requise',
                validate: value => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return selectedDate >= today || 'La date doit être aujourd\'hui ou dans le futur';
                }
              })}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.dateDepart ? 'border-red-300' : ''}`}
            />
            {errors.dateDepart && (
              <p className="mt-1 text-sm text-red-600">{errors.dateDepart.message}</p>
            )}
          </div>

          {/* Departure Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de départ (optionnel)
            </label>
            <input
              {...register('heureDepart')}
              type="time"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Cargo Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary-600" />
          <span>Marchandise</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cargo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de marchandise *
            </label>
            <select
              {...register('typeMarchandise', { required: 'Le type de marchandise est requis' })}
              className={`input-field ${errors.typeMarchandise ? 'border-red-300' : ''}`}
            >
              <option value="">Sélectionner un type</option>
              {CARGO_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.typeMarchandise && (
              <p className="mt-1 text-sm text-red-600">{errors.typeMarchandise.message}</p>
            )}
          </div>

          {/* Available Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité disponible (kg) *
            </label>
            <input
              {...register('capaciteDisponible', { 
                required: 'La capacité est requise',
                min: { value: 1, message: 'La capacité doit être supérieure à 0' },
                max: { value: 10000, message: 'La capacité ne peut pas dépasser 10000 kg' }
              })}
              type="number"
              min="1"
              max="10000"
              className={`input-field ${errors.capaciteDisponible ? 'border-red-300' : ''}`}
              placeholder="Ex: 50"
            />
            {errors.capaciteDisponible && (
              <p className="mt-1 text-sm text-red-600">{errors.capaciteDisponible.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions maximales (optionnel)
            </label>
            <input
              {...register('dimensionsMax')}
              type="text"
              className="input-field"
              placeholder="Ex: 100x80x60 cm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format recommandé: longueur x largeur x hauteur
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix indicatif (MAD) (optionnel)
            </label>
            <input
              {...register('prix', {
                min: { value: 0, message: 'Le prix ne peut pas être négatif' }
              })}
              type="number"
              min="0"
              className={`input-field ${errors.prix ? 'border-red-300' : ''}`}
              placeholder="Ex: 200"
            />
            {errors.prix && (
              <p className="mt-1 text-sm text-red-600">{errors.prix.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Info className="h-5 w-5 text-primary-600" />
          <span>Informations complémentaires</span>
        </h3>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description du trajet (optionnel)
          </label>
          <textarea
            {...register('description')}
            rows="3"
            className="input-field resize-none"
            placeholder="Décrivez votre trajet, vos conditions de transport, etc..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Ajoutez des détails pour attirer plus d'expéditeurs
          </p>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions spéciales (optionnel)
          </label>
          <textarea
            {...register('instructionsSpeciales')}
            rows="2"
            className="input-field resize-none"
            placeholder="Ex: Marchandises fragiles acceptées, point de rendez-vous spécifique..."
          />
        </div>
      </div>

      {/* Status (for editing) */}
      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut de l'annonce
          </label>
          <select
            {...register('status')}
            className="input-field"
          >
            <option value="active">Active (visible par les expéditeurs)</option>
            <option value="inactive">Inactive (masquée)</option>
            <option value="completed">Terminée</option>
          </select>
        </div>
      )}

      {/* Preview */}
      {watchedFields.lieuDepart && watchedFields.destination && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Aperçu de votre annonce:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Trajet:</strong> {watchedFields.lieuDepart} → {watchedFields.destination}
              {watchedFields.etapesIntermediaires?.filter(e => e).length > 0 && 
                ` (via ${watchedFields.etapesIntermediaires.filter(e => e).join(', ')})`
              }
            </p>
            {watchedFields.dateDepart && (
              <p>
                <strong>Date:</strong> {new Date(watchedFields.dateDepart).toLocaleDateString('fr-FR')}
                {watchedFields.heureDepart && ` à ${watchedFields.heureDepart}`}
              </p>
            )}
            {watchedFields.typeMarchandise && watchedFields.capaciteDisponible && (
              <p>
                <strong>Transport:</strong> {watchedFields.typeMarchandise} - {watchedFields.capaciteDisponible}kg disponibles
              </p>
            )}
            {watchedFields.prix && (
              <p><strong>Prix indicatif:</strong> {watchedFields.prix} MAD</p>
            )}
          </div>
        </div>
      )}

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
            <InlineLoading message={isEditing ? "Mise à jour..." : "Création..."} />
          ) : (
            isEditing ? 'Mettre à jour' : 'Créer l\'annonce'
          )}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;