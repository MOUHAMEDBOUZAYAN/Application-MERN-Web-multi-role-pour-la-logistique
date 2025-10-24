import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Truck,
  Package
} from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    mode: 'onBlur', 
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Email ou mot de passe incorrect.',
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message:
          error.response?.data?.message ||
          'Une erreur est survenue lors de la connexion.',
      });
    }
  };

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
            Connectez-vous à votre
          </h2>
          <h2 className="text-4xl font-bold text-white mb-6">
            espace professionnel
          </h2>
          
          <p className="text-white/80 text-lg mb-8">
            Gérez vos transports, suivez vos colis et optimisez votre logistique
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
          <h1 className="text-3xl font-bold text-white mb-2">Se connecter</h1>
          <p className="text-gray-400 mb-8">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Créez votre compte
            </Link>
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <input
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Format d\'email invalide'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('motDePasse', {
                    required: 'Le mot de passe est requis',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.motDePasse ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.motDePasse && (
                <p className="text-sm text-red-400 mt-1">{errors.motDePasse.message}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Ou connectez-vous avec</span>
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

export default Login;