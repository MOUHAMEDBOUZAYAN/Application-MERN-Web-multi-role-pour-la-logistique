import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Truck,
  Package,
  BarChart3,
  Home,
  MessageCircle,
  ChevronDown,
  Search,
  HelpCircle
} from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  
  const { user, isAuthenticated, logout, isAdmin, isConductor } = useAuth();
  const { notifications, getUnreadCount, markNotificationAsRead } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const unreadCount = getUnreadCount();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home, public: true },
    { path: '/annonces', label: 'Annonces', icon: Package, auth: true },
    { path: '/my-annonces', label: 'Mes Annonces', icon: Truck, roles: ['conducteur'] },
    { path: '/demandes', label: 'Demandes', icon: MessageCircle, auth: true },
    { path: '/admin', label: 'Administration', icon: BarChart3, roles: ['admin'] }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.public) return true;
    if (item.auth && !isAuthenticated) return false;
    if (item.roles && (!user || !item.roles.includes(user.role))) return false;
    return true;
  });

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrateur',
      'conducteur': 'Conducteur',
      'expediteur': 'Expéditeur'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'admin': 'bg-red-100 text-red-800',
      'conducteur': 'bg-blue-100 text-blue-800',
      'expediteur': 'bg-green-100 text-green-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/20' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo amélioré */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-400 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 group-hover:text-yellow-400 transition-colors">
                  TransportConnect
                </span>
                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                  Plateforme de transport
                </span>
              </div>
            </Link>

            {/* Navigation Desktop améliorée */}
            <nav className="hidden lg:flex items-center space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-yellow-400 bg-yellow-50 shadow-sm'
                        : 'text-gray-700 hover:text-yellow-400 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions côté droit */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Barre de recherche (optionnelle) */}
                  <div className="hidden xl:flex items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
                      />
                    </div>
                  </div>

                  {/* Notifications améliorées */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2.5 text-gray-600 hover:text-yellow-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-xl transition-all duration-200"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Notifications amélioré */}
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune notification</p>
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                  !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${
                                    !notification.read ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {notifications.length > 5 && (
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button className="w-full text-center text-sm text-yellow-400 hover:text-yellow-500 font-medium">
                              Voir toutes les notifications
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Menu Profil amélioré */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                        {getInitials(`${user?.prenom} ${user?.nom}`)}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.prenom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRoleDisplayName(user?.role)}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown Profil amélioré */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                              {getInitials(`${user?.prenom} ${user?.nom}`)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.prenom} {user?.nom}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role)}`}>
                                {getRoleDisplayName(user?.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          {[
                            { to: '/dashboard', icon: BarChart3, label: 'Tableau de bord' },
                            { to: '/profile', icon: User, label: 'Mon Profil' },
                            { to: '/settings', icon: Settings, label: 'Paramètres' },
                            { to: '/help', icon: HelpCircle, label: 'Aide & Support' }
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                        
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left transition-colors duration-150"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-yellow-400 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Inscription
                  </Link>
                </div>
              )}

              {/* Menu Mobile Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:text-yellow-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Navigation Mobile améliorée */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 animate-in slide-in-from-top-2 duration-200">
              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-yellow-400 bg-yellow-50'
                          : 'text-gray-700 hover:text-yellow-400 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Actions mobiles pour utilisateurs non connectés */}
              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:text-yellow-400 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-medium text-center transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Spacer pour compenser le header fixe */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;