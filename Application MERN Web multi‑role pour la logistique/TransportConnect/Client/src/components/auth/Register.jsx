import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Truck,
  Package,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { execute: registerUser, loading: isLoading, error: apiError } = useApi(authAPI.register);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    role: ''
  });
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (password) => {
    if (!password) return { type: 'none', message: '', score: 0 };
    
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score < 5) {
      return { type: 'error', message: 'Mot de passe faible', score };
    } else if (score === 5) {
      return { type: 'success', message: 'Mot de passe fort', score };
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^(\+212|0)[6-7][0-9]{8}$/.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'role') {
      setSelectedRole(value);
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedRole) newErrors.role = 'Veuillez sélectionner un rôle';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (formData.prenom.length < 2) newErrors.prenom = 'Minimum 2 caractères';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (formData.nom.length < 2) newErrors.nom = 'Minimum 2 caractères';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!isValidEmail(formData.email)) newErrors.email = 'Format d\'email invalide';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!isValidPhone(formData.telephone)) newErrors.telephone = 'Format de téléphone invalide (ex: +212 6XX XX XX XX)';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (getPasswordStrength(formData.password).score < 5) {
      newErrors.password = 'Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const { prenom, nom, email, telephone, password, role } = formData;
    
    const result = await registerUser({
      prenom,
      nom,
      email,
      telephone,
      motDePasse: password,
      role,
    });

    if (result.success) {
      toast.success('Compte créé avec succès ! Un email de vérification a été envoyé.');
      navigate('/login');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const roleOptions = [
    {
      value: 'conducteur',
      label: 'Conducteur',
      description: 'Je veux proposer mes services de transport',
      icon: Truck,
      features: ['Publier des trajets', 'Recevoir des demandes', 'Gérer mon planning']
    },
    {
      value: 'expediteur',
      label: 'Expéditeur',
      description: 'Je veux envoyer des colis',
      icon: Package,
      features: ['Rechercher des trajets', 'Envoyer des demandes', 'Suivre mes envois']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="mt-8 text-center text-4xl font-bold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-3 text-center text-base text-gray-600">
            Rejoignez TransportConnect et commencez dès aujourd'hui
          </p>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Déjà un compte ? </span>
            <button className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Connectez-vous
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="mt-10 mx-auto w-full max-w-lg">
          <div className="bg-white/90 backdrop-blur-sm py-10 px-6 shadow-2xl rounded-3xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">
                  Je suis un...
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div key={role.value}>
                        <label className="cursor-pointer group">
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={selectedRole === role.value}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`relative border-2 rounded-2xl p-5 transition-all duration-300 transform group-hover:scale-105 ${
                            selectedRole === role.value
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}>
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl shadow-lg ${
                                role.value === 'conducteur' 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                              }`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {role.label}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {role.description}
                                </p>
                              </div>
                              {selectedRole === role.value && (
                                <CheckCircle className="h-6 w-6 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                        errors.prenom 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.prenom && (
                    <p className="text-xs text-red-600">{errors.prenom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    id="nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                      errors.nom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-600">{errors.nom}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                      errors.telephone 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="+212 6XX XX XX XX"
                  />
                </div>
                {errors.telephone && (
                  <p className="text-xs text-red-600">{errors.telephone}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.type === 'error' ? 'bg-red-500' :
                            passwordStrength.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.type === 'error' ? 'text-red-600' :
                        passwordStrength.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                      errors.confirmPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Confirmer votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    conditions d'utilisation
                  </button>{' '}
                  et la{' '}
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    politique de confidentialité
                  </button>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-red-600 ml-7">{errors.acceptTerms}</p>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Créer mon compte</span>
                  )}
                  {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
              </div>

              {/* Error Display */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errors.root}</p>
                </div>
              )}
            </form>

            {/* Features for Selected Role */}
            {selectedRole && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  En tant que {roleOptions.find(r => r.value === selectedRole)?.label}, vous pourrez :
                </h4>
                <div className="grid gap-3">
                  {roleOptions.find(r => r.value === selectedRole)?.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 mb-1">
                  Sécurité garantie
                </h3>
                <p className="text-sm text-emerald-700">
                  Vos données sont protégées par un chiffrement de niveau bancaire. 
                  Nous respectons votre vie privée et ne partagerons jamais vos informations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;