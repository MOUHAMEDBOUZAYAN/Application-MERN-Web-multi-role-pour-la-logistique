import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Package, Plus, X, Info, Truck, Route, Star, Eye } from 'lucide-react';

const AnnouncementForm = ({ announcement, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const isEditing = !!announcement;

  // Mock constants for demo
  const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Meknès', 'Salé', 'Tétouan'];
  const CARGO_TYPES = ['Colis légers', 'Électroménager', 'Meubles', 'Vêtements', 'Produits alimentaires', 'Matériaux de construction', 'Autres'];

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Itinéraire', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { number: 2, title: 'Planning', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { number: 3, title: 'Marchandise', icon: Package, color: 'from-green-500 to-emerald-500' },
    { number: 4, title: 'Finalisation', icon: Info, color: 'from-orange-500 to-red-500' }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.lieuDepart) newErrors.lieuDepart = 'Le lieu de départ est requis';
      if (!formData.destination) newErrors.destination = 'La destination est requise';
    } else if (step === 2) {
      if (!formData.dateDepart) newErrors.dateDepart = 'La date de départ est requise';
    } else if (step === 3) {
      if (!formData.typeMarchandise) newErrors.typeMarchandise = 'Le type de marchandise est requis';
      if (!formData.capaciteDisponible) newErrors.capaciteDisponible = 'La capacité est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addIntermediateStep = () => {
    setFormData(prev => ({
      ...prev,
      etapesIntermediaires: [...prev.etapesIntermediaires, '']
    }));
  };

  const removeIntermediateStep = (index) => {
    setFormData(prev => ({
      ...prev,
      etapesIntermediaires: prev.etapesIntermediaires.filter((_, i) => i !== index)
    }));
  };

  const updateIntermediateStep = (index, value) => {
    setFormData(prev => ({
      ...prev,
      etapesIntermediaires: prev.etapesIntermediaires.map((step, i) => i === index ? value : step)
    }));
  };

  const onFormSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    try {
      setLoading(true);
      
      const formattedData = {
        ...formData,
        dateDepart: new Date(formData.dateDepart).toISOString(),
        capaciteDisponible: Number(formData.capaciteDisponible),
        prix: formData.prix ? Number(formData.prix) : null,
        etapesIntermediaires: formData.etapesIntermediaires.filter(etape => etape.trim() !== '')
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const IconComponent = step.icon;
        
        return (
          <div key={step.number} className="flex items-center">
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              isActive 
                ? `bg-gradient-to-r ${step.color} text-white shadow-lg transform scale-110` 
                : isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              <IconComponent className="w-5 h-5" />
              {isActive && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} opacity-30 animate-pulse`}></div>
              )}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-6 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white mb-4">
          <Route className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Définissez votre itinéraire</h2>
        <p className="text-gray-600 mt-2">Précisez votre point de départ et votre destination</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🚀 Lieu de départ *
          </label>
          <select
            value={formData.lieuDepart}
            onChange={(e) => handleInputChange('lieuDepart', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
              errors.lieuDepart ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une ville</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.lieuDepart && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.lieuDepart}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎯 Destination *
          </label>
          <select
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 ${
              errors.destination ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une ville</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.destination && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.destination}
            </p>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            Étapes intermédiaires (optionnel)
          </label>
          <button
            type="button"
            onClick={addIntermediateStep}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Ajouter</span>
          </button>
        </div>
        
        {formData.etapesIntermediaires.map((step, index) => (
          <div key={index} className="flex items-center space-x-3 mb-3">
            <select
              value={step}
              onChange={(e) => updateIntermediateStep(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner une ville</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeIntermediateStep(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Planifiez votre départ</h2>
        <p className="text-gray-600 mt-2">Choisissez la date et l'heure de votre voyage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Date de départ *
          </label>
          <input
            type="date"
            value={formData.dateDepart}
            onChange={(e) => handleInputChange('dateDepart', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 hover:border-purple-300 ${
              errors.dateDepart ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.dateDepart && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.dateDepart}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🕐 Heure de départ (optionnel)
          </label>
          <input
            type="time"
            value={formData.heureDepart}
            onChange={(e) => handleInputChange('heureDepart', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 hover:border-purple-300"
          />
        </div>
      </div>

      {formData.dateDepart && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Récapitulatif du planning</h4>
              <p className="text-gray-600">
                Départ prévu le {new Date(formData.dateDepart).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {formData.heureDepart && ` à ${formData.heureDepart}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Détails de la marchandise</h2>
        <p className="text-gray-600 mt-2">Spécifiez le type et la capacité de transport</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📦 Type de marchandise *
          </label>
          <select
            value={formData.typeMarchandise}
            onChange={(e) => handleInputChange('typeMarchandise', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-green-300 ${
              errors.typeMarchandise ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un type</option>
            {CARGO_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.typeMarchandise && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.typeMarchandise}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ⚖️ Capacité disponible (kg) *
          </label>
          <input
            type="number"
            value={formData.capaciteDisponible}
            onChange={(e) => handleInputChange('capaciteDisponible', e.target.value)}
            min="1"
            max="10000"
            placeholder="Ex: 50"
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-green-300 ${
              errors.capaciteDisponible ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.capaciteDisponible && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.capaciteDisponible}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📏 Dimensions maximales (optionnel)
          </label>
          <input
            type="text"
            value={formData.dimensionsMax}
            onChange={(e) => handleInputChange('dimensionsMax', e.target.value)}
            placeholder="Ex: 100x80x60 cm"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-green-300"
          />
          <p className="mt-1 text-xs text-gray-500">Format: longueur x largeur x hauteur</p>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💰 Prix indicatif (MAD) (optionnel)
          </label>
          <input
            type="number"
            value={formData.prix}
            onChange={(e) => handleInputChange('prix', e.target.value)}
            min="0"
            placeholder="Ex: 200"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 hover:border-green-300"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Informations complémentaires</h2>
        <p className="text-gray-600 mt-2">Ajoutez des détails pour finaliser votre annonce</p>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 Description du trajet (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            placeholder="Décrivez votre trajet, vos conditions de transport, etc..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">Ajoutez des détails pour attirer plus d'expéditeurs</p>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ⚠️ Instructions spéciales (optionnel)
          </label>
          <textarea
            value={formData.instructionsSpeciales}
            onChange={(e) => handleInputChange('instructionsSpeciales', e.target.value)}
            rows="3"
            placeholder="Ex: Marchandises fragiles acceptées, point de rendez-vous spécifique..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300 resize-none"
          />
        </div>

        {isEditing && (
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔄 Statut de l'annonce
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 hover:border-orange-300"
            >
              <option value="active">Active (visible par les expéditeurs)</option>
              <option value="inactive">Inactive (masquée)</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        )}

        {/* Preview Card */}
        {formData.lieuDepart && formData.destination && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Aperçu de votre annonce</h4>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {formData.lieuDepart} → {formData.destination}
                </span>
                {formData.etapesIntermediaires?.filter(e => e).length > 0 && (
                  <span className="text-sm text-gray-600">
                    (via {formData.etapesIntermediaires.filter(e => e).join(', ')})
                  </span>
                )}
              </div>
              
              {formData.dateDepart && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    {new Date(formData.dateDepart).toLocaleDateString('fr-FR')}
                    {formData.heureDepart && ` à ${formData.heureDepart}`}
                  </span>
                </div>
              )}
              
              {formData.typeMarchandise && formData.capaciteDisponible && (
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">
                    {formData.typeMarchandise} - {formData.capaciteDisponible}kg disponibles
                  </span>
                </div>
              )}
              
              {formData.prix && (
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    {formData.prix} MAD
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isEditing ? 'Modifier votre annonce' : 'Créer une nouvelle annonce'}
          </h1>
          <p className="text-gray-600 text-lg">Remplissez les informations étape par étape</p>
        </div>

        {/* Progress Indicator */}
        {renderStepIndicator()}

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : prevStep}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium transform hover:scale-105"
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={onFormSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? "Mise à jour..." : "Création..."}</span>
                </div>
              ) : (
                isEditing ? 'Mettre à jour' : 'Créer l\'annonce'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;