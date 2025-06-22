import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Package, 
  Shield, 
  Clock, 
  Star, 
  Users,
  MapPin,
  ArrowRight,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé et Fiable',
      description: 'Tous nos conducteurs sont vérifiés et les transactions sont sécurisées.'
    },
    {
      icon: Clock,
      title: 'Livraison Rapide',
      description: 'Trouvez des conducteurs disponibles pour vos trajets en temps réel.'
    },
    {
      icon: Star,
      title: 'Système d\'Évaluation',
      description: 'Évaluez et soyez évalué pour maintenir la qualité du service.'
    },
    {
      icon: MessageCircle,
      title: 'Communication Directe',
      description: 'Chattez directement avec les conducteurs pour organiser vos transports.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Utilisateurs Actifs' },
    { number: '500+', label: 'Trajets Réalisés' },
    { number: '50+', label: 'Villes Couvertes' },
    { number: '4.8', label: 'Note Moyenne' }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Inscrivez-vous',
      description: 'Créez votre compte en tant que conducteur ou expéditeur'
    },
    {
      step: 2,
      title: 'Publiez ou Trouvez',
      description: 'Publiez votre trajet ou trouvez celui qui vous convient'
    },
    {
      step: 3,
      title: 'Connectez-vous',
      description: 'Entrez en contact et organisez votre transport'
    },
    {
      step: 4,
      title: 'Transportez',
      description: 'Effectuez le transport et évaluez votre expérience'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Connectez-vous pour vos 
                <span className="text-yellow-300"> transports</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                La plateforme qui met en relation conducteurs et expéditeurs pour un transport de marchandises efficace et sécurisé au Maroc.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                    >
                      Commencer Maintenant
                    </Link>
                    <Link
                      to="/announcements"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200 text-center"
                    >
                      Voir les Annonces
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 text-center"
                    >
                      Mon Tableau de Bord
                    </Link>
                    <Link
                      to="/announcements"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200 text-center"
                    >
                      Parcourir les Annonces
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-400 p-3 rounded-full">
                    <Truck className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Pour les Conducteurs</h3>
                    <p className="text-blue-100">Monétisez vos trajets</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-400 p-3 rounded-full">
                    <Package className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Pour les Expéditeurs</h3>
                    <p className="text-blue-100">Envoyez vos colis facilement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir TransportConnect ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme moderne et sécurisée pour tous vos besoins de transport au Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-primary-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-200">
                    <Icon className="h-8 w-8 text-primary-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Quatre étapes simples pour connecter conducteurs et expéditeurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {step.description}
                </p>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-primary-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à TransportConnect pour leurs transports quotidiens.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Créer un Compte
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                Se Connecter
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-block"
            >
              Accéder au Tableau de Bord
            </Link>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce Que Disent Nos Utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmed Ben Ali',
                role: 'Conducteur',
                content: 'TransportConnect m\'a aidé à optimiser mes trajets et à générer des revenus supplémentaires. Interface très intuitive !',
                rating: 5
              },
              {
                name: 'Fatima Zahra',
                role: 'Expéditrice',
                content: 'Service excellent ! J\'ai trouvé rapidement un conducteur fiable pour mes envois. Je recommande vivement.',
                rating: 5
              },
              {
                name: 'Youssef Alami',
                role: 'Conducteur',
                content: 'Plateforme sérieuse avec un bon système de vérification. Les évaluations permettent de maintenir la qualité.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;