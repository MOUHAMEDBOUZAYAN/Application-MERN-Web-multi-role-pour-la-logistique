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
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe
} from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-xl">
              <Truck className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Bienvenue sur TransportConnect
          </h2>
          <p className="mt-3 text-center text-lg text-gray-600">
            Connectez-vous à votre espace professionnel
          </p>
          
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Rapide</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-8 shadow-2xl border border-white/20 rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Adresse email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
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
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                  } focus:ring-4 text-gray-900 placeholder-gray-500`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  </span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  {...register('motDePasse', {
                    required: 'Le mot de passe est requis',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-300 ${
                    errors.motDePasse 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                  } focus:ring-4 text-gray-900 placeholder-gray-500`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.motDePasse && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  </span>
                  <span>{errors.motDePasse.message}</span>
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{errors.root.message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <ArrowRight className={`h-6 w-6 transform transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                  )}
                </span>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>

            {/* Social Login */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou connectez-vous avec</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <img className="h-5 w-5" src="https://www.svgrepo.com/show/506498/google.svg" alt="" />
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <img className="h-5 w-5" src="https://www.svgrepo.com/show/506500/facebook.svg" alt="" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>

            {/* Demo Accounts */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">Comptes de démonstration</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="bg-white/50 rounded-lg p-2">
                        <strong>Conducteur :</strong> conducteur@demo.com / demo123
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <strong>Expéditeur :</strong> expediteur@demo.com / demo123
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <strong>Admin :</strong> admin@demo.com / admin123
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Créez votre compte gratuitement
            </Link>
          </p>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Besoin d'aide ?{' '}
            <Link 
              to="/support" 
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center space-x-1"
            >
              <span>Contactez notre support</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} TransportConnect. Tous droits réservés.</p>
        <p className="mt-1">
          <Link to="/privacy" className="hover:underline">Politique de confidentialité</Link> &middot; <Link to="/terms" className="hover:underline">Conditions d'utilisation</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;