import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    if (/[@$!%*?&]/.test(password)) score += 1;
    
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
      newErrors.password = 'Le mot de passe doit contenir: min 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial (@$!%*?&)';
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Section gauche - Image décorative */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">TransportConnect</span>
          </div>
              </div>

        {/* Bouton retour */}
        <div className="absolute top-8 right-8">
          <Link 
            to="/" 
            className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-black/30 transition-colors inline-block"
          >
            Retour au site →
          </Link>
              </div>

        {/* Contenu décoratif */}
        <div className="flex flex-col justify-center items-center text-center px-12">
          <div className="mb-8">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <Truck className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Créez votre compte
          </h2>
          <h2 className="text-4xl font-bold text-white mb-6">
            professionnel
          </h2>
          
          <p className="text-white/80 text-lg mb-8">
            Rejoignez notre plateforme et commencez à optimiser votre logistique dès aujourd'hui
          </p>

          {/* Indicateurs */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="flex-1 lg:w-3/5 bg-gray-900 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="max-w-md mx-auto w-full mt-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-gray-400 mb-8">
            Déjà un compte ?{' '}
            <button 
            onClick={() => navigate("/login")}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Connectez-vous
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                  Je suis un...
                </label>
              <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div key={role.value}>
                      <label className="cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={selectedRole === role.value}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="sr-only"
                          />
                        <div className={`border-2 p-3 text-center transition-all duration-300 ${
                          selectedRole === role.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        }`}>
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${
                            role.value === 'conducteur' ? 'text-blue-400' : 'text-green-400'
                          }`} />
                          <div className="text-xs font-medium text-white">{role.label}</div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                    <input
                      id="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.prenom ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                      placeholder="Votre prénom"
                    />
                  {errors.prenom && (
                  <p className="text-sm text-red-400 mt-1">{errors.prenom}</p>
                  )}
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    id="nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.nom ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                    placeholder="Votre nom"
                  />
                  {errors.nom && (
                  <p className="text-sm text-red-400 mt-1">{errors.nom}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                    placeholder="votre@email.com"
                  />
                {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
                </label>
                  <input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.telephone ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                    placeholder="+212 6XX XX XX XX"
                  />
                {errors.telephone && (
                <p className="text-sm text-red-400 mt-1">{errors.telephone}</p>
                )}
              </div>

              {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                    placeholder="Confirmer votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
                />
              <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                  J'accepte les{' '}
                <button className="text-blue-400 hover:text-blue-300 font-medium">
                    conditions d'utilisation
                  </button>{' '}
                  et la{' '}
                <button className="text-blue-400 hover:text-blue-300 font-medium">
                    politique de confidentialité
                  </button>
                </label>
              </div>
              {errors.acceptTerms && (
              <p className="text-sm text-red-400">{errors.acceptTerms}</p>
              )}

              {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
                </button>

              {/* Error Display */}
              {errors.root && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{errors.root}</p>
                </div>
              )}
            </form>

          {/* Social Login */}
          <div className="mt-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Ou inscrivez-vous avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-700 shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-700 shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;