import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Truck,
  Package,
  Shield
} from 'lucide-react';
import { isValidEmail, isValidPhone, getPasswordStrengthMessage } from '../../utils/helpers';
import { InlineLoading } from '../common/Loading';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm();

  const watchPassword = watch('password', '');
  const passwordStrength = getPasswordStrengthMessage(watchPassword);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Les mots de passe ne correspondent pas' });
      return;
    }

    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('root', { message: result.error });
      }
    } catch (error) {
      setError('root', { message: 'Une erreur est survenue' });
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-primary-600 p-3 rounded-lg">
            <Truck className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Je suis un...
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div key={role.value}>
                      <label className="cursor-pointer">
                        <input
                          {...register('role', { required: 'Veuillez sélectionner un rôle' })}
                          type="radio"
                          value={role.value}
                          className="sr-only"
                          onChange={(e) => setSelectedRole(e.target.value)}
                        />
                        <div className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                          selectedRole === role.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-6 w-6 ${
                              selectedRole === role.value ? 'text-primary-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {role.label}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('prenom', {
                      required: 'Le prénom est requis',
                      minLength: { value: 2, message: 'Minimum 2 caractères' }
                    })}
                    type="text"
                    className={`input-field pl-10 ${errors.prenom ? 'border-red-300' : ''}`}
                    placeholder="Votre prénom"
                  />
                </div>
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <div className="mt-1">
                  <input
                    {...register('nom', {
                      required: 'Le nom est requis',
                      minLength: { value: 2, message: 'Minimum 2 caractères' }
                    })}
                    type="text"
                    className={`input-field ${errors.nom ? 'border-red-300' : ''}`}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'L\'email est requis',
                    validate: value => isValidEmail(value) || 'Format d\'email invalide'
                  })}
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('telephone', {
                    required: 'Le téléphone est requis',
                    validate: value => isValidPhone(value) || 'Format de téléphone invalide (ex: +212 6XX XX XX XX)'
                  })}
                  type="tel"
                  className={`input-field pl-10 ${errors.telephone ? 'border-red-300' : ''}`}
                  placeholder="+212 6XX XX XX XX"
                />
              </div>
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {watchPassword && (
                <div className="mt-2">
                  <div className={`text-xs ${
                    passwordStrength.type === 'success' ? 'text-green-600' :
                    passwordStrength.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.message}
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="Confirmer votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                {...register('acceptTerms', {
                  required: 'Vous devez accepter les conditions d\'utilisation'
                })}
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <InlineLoading message="Création du compte..." /> : 'Créer mon compte'}
              </button>
            </div>
          </form>

          {/* Features for Selected Role */}
          {selectedRole && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                En tant que {roleOptions.find(r => r.value === selectedRole)?.label}, vous pourrez :
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {roleOptions.find(r => r.value === selectedRole)?.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Sécurité :</strong> Vos données sont protégées et chiffrées. 
                Nous ne partagerons jamais vos informations personnelles avec des tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;