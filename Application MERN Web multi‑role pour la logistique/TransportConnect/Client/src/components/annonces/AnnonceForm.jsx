import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  Plus, 
  X, 
  Info, 
  Truck, 
  Star, 
  Eye,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Route,
  Weight,
  DollarSign
} from 'lucide-react';

const CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 
  'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'Mohammedia',
  'Khouribga', 'El Jadida', 'Béni Mellal', 'Nador', 'Taza', 'Settat'
];

const CARGO_TYPES = {
  electromenager: 'Électroménager',
  mobilier: 'Mobilier',
  vetements: 'Vêtements',
  alimentation: 'Alimentation',
  electronique: 'Électronique',
  documents: 'Documents',
  medicaments: 'Médicaments',
  fragile: 'Fragile',
  produits_chimiques: 'Produits chimiques',
  materiaux_construction: 'Matériaux de construction',
  autre: 'Autre',
};

const VEHICLE_TYPES = {
  camionnette: 'Camionnette',
  camion: 'Camion',
  fourgon: 'Fourgon',
  voiture: 'Voiture'
};

// Fonction pour mapper les données d'annonce existante
const mapExistingAnnouncement = (announcement) => {
  if (!announcement) return null;

  return {
    lieuDepart: announcement.lieuDepart || announcement.trajet?.depart?.ville || '',
    destination: announcement.destination || announcement.trajet?.destination?.ville || '',
    etapesIntermediaires: announcement.etapesIntermediaires || announcement.trajet?.etapesIntermediaires || [],
    dateDepart: announcement.dateDepart || announcement.planning?.dateDepart 
      ? new Date(announcement.dateDepart || announcement.planning?.dateDepart).toISOString().split('T')[0] 
      : '',
    heureDepart: announcement.heureDepart || announcement.planning?.heureDepart || '',
    typeMarchandise: announcement.typeMarchandise || 
      (Array.isArray(announcement.typesMarchandise) ? announcement.typesMarchandise[0] : announcement.typesMarchandise) || '',
    capaciteDisponible: announcement.capaciteDisponible || announcement.capacite?.poidsMax || '',
    dimensionsMax: announcement.dimensionsMax || 
      (announcement.capacite?.dimensionsMax ? 
        `${announcement.capacite.dimensionsMax.longueur}x${announcement.capacite.dimensionsMax.largeur}x${announcement.capacite.dimensionsMax.hauteur}` : ''),
    prix: announcement.prix || announcement.tarification?.prix || announcement.tarification?.prixFixe || '',
    vehiculeType: announcement.vehicule?.type || 'camionnette',
    vehiculeMarque: announcement.vehicule?.marque || '',
    vehiculeModele: announcement.vehicule?.modele || '',
    description: announcement.description || announcement.details?.description || '',
    instructionsSpeciales: announcement.instructionsSpeciales || announcement.details?.instructionsSpeciales || '',
    status: announcement.status || announcement.statut || 'active'
  };
};

const ImprovedAnnouncementForm = ({ announcement, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const isEditing = !!announcement;

  // Initialiser les données du formulaire
  const [formData, setFormData] = useState(() => {
    if (isEditing) {
      return mapExistingAnnouncement(announcement);
    }
    return {
      lieuDepart: '',
      destination: '',
      etapesIntermediaires: [],
      dateDepart: '',
      heureDepart: '',
      typeMarchandise: '',
      capaciteDisponible: '',
      dimensionsMax: '',
      prix: '',
      vehiculeType: 'camionnette',
      vehiculeMarque: '',
      vehiculeModele: '',
      description: '',
      instructionsSpeciales: '',
      status: 'active'
    };
  });

  const steps = [
    { number: 1, title: 'Itinéraire', icon: MapPin, description: 'Définissez votre trajet' },
    { number: 2, title: 'Planning', icon: Calendar, description: 'Planifiez votre départ' },
    { number: 3, title: 'Transport', icon: Package, description: 'Détails du transport' },
    { number: 4, title: 'Finalisation', icon: CheckCircle, description: 'Vérifiez et publiez' }
  ];

  // Validation par étape
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.lieuDepart) newErrors.lieuDepart = 'Le lieu de départ est requis';
        if (!formData.destination) newErrors.destination = 'La destination est requise';
        if (formData.lieuDepart === formData.destination) {
          newErrors.destination = 'La destination doit être différente du lieu de départ';
        }
        break;
      
      case 2:
        if (!formData.dateDepart) newErrors.dateDepart = 'La date de départ est requise';
        if (formData.dateDepart && new Date(formData.dateDepart) <= new Date()) {
          newErrors.dateDepart = 'La date de départ doit être dans le futur';
        }
        break;
      
      case 3:
        if (!formData.typeMarchandise) newErrors.typeMarchandise = 'Le type de marchandise est requis';
        if (!formData.capaciteDisponible) newErrors.capaciteDisponible = 'La capacité est requise';
        if (formData.capaciteDisponible && (isNaN(formData.capaciteDisponible) || formData.capaciteDisponible <= 0)) {
          newErrors.capaciteDisponible = 'La capacité doit être un nombre positif';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ si elle existe
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Valider toutes les étapes
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    try {
      setLoading(true);

      // Préparer les données au format backend
      const submissionData = {
        titre: `Trajet de ${formData.lieuDepart} à ${formData.destination}`,
        trajet: {
          depart: { ville: formData.lieuDepart },
          destination: { ville: formData.destination },
          etapes: formData.etapesIntermediaires.filter(etape => etape.trim() !== '')
        },
        planning: {
          dateDepart: formData.dateDepart && formData.heureDepart 
            ? new Date(`${formData.dateDepart}T${formData.heureDepart}:00`).toISOString()
            : new Date(`${formData.dateDepart}T12:00:00`).toISOString()
        },
        capacite: {
          poidsMax: Number(formData.capaciteDisponible),
          dimensionsMax: formData.dimensionsMax ? (() => {
            const dims = formData.dimensionsMax.split(/[xX]/).map(d => parseFloat(d.trim()) || 0);
            return {
              longueur: dims[0] || 0,
              largeur: dims[1] || 0,
              hauteur: dims[2] || 0
            };
          })() : { longueur: 0, largeur: 0, hauteur: 0 }
        },
        vehicule: {
          type: formData.vehiculeType,
          marque: formData.vehiculeMarque,
          modele: formData.vehiculeModele
        },
        typesMarchandise: [formData.typeMarchandise],
        tarification: {
          typeTarification: "prix_fixe",
          prix: Number(formData.prix) || 0
        },
        details: {
          description: formData.description,
          instructionsSpeciales: formData.instructionsSpeciales
        },
        statut: formData.status || 'active'
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rendu des étapes
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const IconComponent = step.icon;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg transform scale-110' 
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Route className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Définissez votre itinéraire</h2>
        <p className="text-gray-600 mt-2">Indiquez votre point de départ et votre destination</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Lieu de départ *
          </label>
          <select 
            value={formData.lieuDepart} 
            onChange={(e) => handleInputChange('lieuDepart', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
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
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lieuDepart}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Destination *
          </label>
          <select 
            value={formData.destination} 
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
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
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.destination}
            </p>
          )}
        </div>
      </div>

      {/* Étapes intermédiaires */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Route className="w-5 h-5 mr-2 text-blue-600" />
            Étapes intermédiaires
          </h3>
          <button
            type="button"
            onClick={addIntermediateStep}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {formData.etapesIntermediaires.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Aucune étape intermédiaire. Cliquez sur "Ajouter" pour en créer une.
          </p>
        ) : (
          <div className="space-y-3">
            {formData.etapesIntermediaires.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
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
        )}
      </div>

      {/* Aperçu du trajet */}
      {formData.lieuDepart && formData.destination && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-green-600" />
            Aperçu de votre trajet
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold">{formData.lieuDepart}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            {formData.etapesIntermediaires.filter(e => e).map((etape, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{etape}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </React.Fragment>
            ))}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-semibold">{formData.destination}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Planifiez votre départ</h2>
        <p className="text-gray-600 mt-2">Choisissez la date et l'heure de votre voyage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date de départ *
          </label>
          <input
            type="date"
            value={formData.dateDepart}
            onChange={(e) => handleInputChange('dateDepart', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 ${
              errors.dateDepart ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.dateDepart && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.dateDepart}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Heure de départ (optionnel)
          </label>
          <input
            type="time"
            value={formData.heureDepart}
            onChange={(e) => handleInputChange('heureDepart', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
          />
        </div>
      </div>

      {formData.dateDepart && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Récapitulatif du planning
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Date :</strong> {new Date(formData.dateDepart).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {formData.heureDepart && (
              <p className="text-gray-700">
                <strong>Heure :</strong> {formData.heureDepart}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Package className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Détails du transport</h2>
        <p className="text-gray-600 mt-2">Spécifiez le type et la capacité de transport</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Package className="inline w-4 h-4 mr-1" />
            Type de marchandise *
          </label>
          <select
            value={formData.typeMarchandise}
            onChange={(e) => handleInputChange('typeMarchandise', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 ${
              errors.typeMarchandise ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un type</option>
            {Object.entries(CARGO_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.typeMarchandise && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.typeMarchandise}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Weight className="inline w-4 h-4 mr-1" />
            Capacité disponible (kg) *
          </label>
          <input
            type="number"
            value={formData.capaciteDisponible}
            onChange={(e) => handleInputChange('capaciteDisponible', e.target.value)}
            min="1"
            max="10000"
            placeholder="Ex: 50"
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 ${
              errors.capaciteDisponible ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.capaciteDisponible && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.capaciteDisponible}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dimensions maximales (optionnel)
          </label>
          <input
            type="text"
            value={formData.dimensionsMax}
            onChange={(e) => handleInputChange('dimensionsMax', e.target.value)}
            placeholder="Ex: 100x80x60 cm"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500"
          />
          <p className="mt-1 text-xs text-gray-500">Format: longueur x largeur x hauteur</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Prix indicatif (MAD) (optionnel)
          </label>
          <input
            type="number"
            value={formData.prix}
            onChange={(e) => handleInputChange('prix', e.target.value)}
            min="0"
            placeholder="Ex: 200"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500"
          />
        </div>
      </div>

      {/* Informations sur le véhicule */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2 text-gray-600" />
          Informations sur le véhicule
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de véhicule</label>
            <select
              value={formData.vehiculeType}
              onChange={(e) => handleInputChange('vehiculeType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marque (optionnel)</label>
            <input
              type="text"
              value={formData.vehiculeMarque}
              onChange={(e) => handleInputChange('vehiculeMarque', e.target.value)}
              placeholder="Ex: Renault"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modèle (optionnel)</label>
            <input
              type="text"
              value={formData.vehiculeModele}
              onChange={(e) => handleInputChange('vehiculeModele', e.target.value)}
              placeholder="Ex: Master"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Finalisez votre annonce</h2>
        <p className="text-gray-600 mt-2">Ajoutez des détails pour optimiser votre annonce</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Info className="inline w-4 h-4 mr-1" />
            Description du trajet (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            placeholder="Décrivez votre trajet, vos conditions de transport, etc..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Une description détaillée aide à attirer plus d'expéditeurs
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Instructions spéciales (optionnel)
          </label>
          <textarea
            value={formData.instructionsSpeciales}
            onChange={(e) => handleInputChange('instructionsSpeciales', e.target.value)}
            rows="3"
            placeholder="Ex: Marchandises fragiles acceptées, point de rendez-vous spécifique..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none"
          />
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut de l'annonce
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="active">Active (visible par les expéditeurs)</option>
              <option value="inactive">Inactive (masquée)</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        )}

        {/* Aperçu complet de l'annonce */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-blue-600" />
            Aperçu de votre annonce
          </h3>
          
          <div className="bg-white rounded-lg p-6 space-y-4">
            {/* Trajet */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-bold text-lg">{formData.lieuDepart}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{formData.destination}</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Étapes intermédiaires */}
            {formData.etapesIntermediaires.filter(e => e).length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Route className="w-4 h-4 text-blue-500" />
                <span>via {formData.etapesIntermediaires.filter(e => e).join(', ')}</span>
              </div>
            )}

            {/* Planning */}
            <div className="flex items-center space-x-4">
              {formData.dateDepart && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">
                    {new Date(formData.dateDepart).toLocaleDateString('fr-FR')}
                    {formData.heureDepart && ` à ${formData.heureDepart}`}
                  </span>
                </div>
              )}
            </div>

            {/* Transport */}
            <div className="flex items-center space-x-4">
              {formData.typeMarchandise && (
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">
                    {CARGO_TYPES[formData.typeMarchandise]}
                  </span>
                </div>
              )}
              {formData.capaciteDisponible && (
                <div className="flex items-center space-x-2">
                  <Weight className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {formData.capaciteDisponible} kg disponibles
                  </span>
                </div>
              )}
            </div>

            {/* Prix */}
            {formData.prix && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">
                  {formData.prix} MAD
                </span>
              </div>
            )}

            {/* Véhicule */}
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {VEHICLE_TYPES[formData.vehiculeType]}
                {formData.vehiculeMarque && ` ${formData.vehiculeMarque}`}
                {formData.vehiculeModele && ` ${formData.vehiculeModele}`}
              </span>
            </div>

            {/* Description */}
            {formData.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic">
                  "{formData.description}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conseils pour optimiser l'annonce */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Conseils pour optimiser votre annonce
          </h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Ajoutez une description détaillée pour attirer plus de demandes</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Indiquez un prix compétitif pour vous démarquer</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Répondez rapidement aux demandes pour améliorer votre réputation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isEditing ? 'Modifier votre annonce' : 'Créer une nouvelle annonce'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditing 
              ? 'Mettez à jour les informations de votre trajet' 
              : 'Remplissez les informations étape par étape'
            }
          </p>
        </div>

        {/* Indicateur d'étapes */}
        {renderStepIndicator()}

        {/* Contenu principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : prevStep}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? 'Annuler' : 'Précédent'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Informations de validation */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Veuillez corriger les erreurs suivantes :</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Exemple d'utilisation
const ExampleUsage = () => {
  const handleSubmit = async (data) => {
    console.log('Données soumises:', data);
    // Simuler une soumission
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Annonce créée avec succès!');
  };

  const handleCancel = () => {
    console.log('Annulation');
  };

  // Exemple d'annonce existante pour le mode édition
  const existingAnnouncement = {
    _id: '1',
    trajet: {
      depart: { ville: 'Casablanca' },
      destination: { ville: 'Rabat' },
      etapesIntermediaires: ['Témara']
    },
    planning: {
      dateDepart: '2024-01-15T10:00:00Z',
      heureDepart: '10:00'
    },
    typesMarchandise: ['electronique'],
    capacite: { 
      poidsMax: 50,
      dimensionsMax: { longueur: 100, largeur: 80, hauteur: 60 }
    },
    tarification: { prix: 200 },
    vehicule: {
      type: 'camionnette',
      marque: 'Renault',
      modele: 'Master'
    },
    description: 'Transport sécurisé pour électronique',
    statut: 'active'
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Formulaire d'Annonce Amélioré</h1>
        <p className="text-gray-600 mb-6">
          Version professionnelle avec mapping automatique des données et validation robuste
        </p>
      </div>
      
      <ImprovedAnnouncementForm
        announcement={null} // ou existingAnnouncement pour tester le mode édition
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ExampleUsage;