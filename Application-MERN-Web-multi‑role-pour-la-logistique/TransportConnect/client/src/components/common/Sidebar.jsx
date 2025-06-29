import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Package, 
  Truck, 
  MessageCircle, 
  BarChart3, 
  Users,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isConductor, isSender } = useAuth();
  const location = useLocation();

  // Hide sidebar on home page
  if (location.pathname === '/') {
    return null;
  }

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      icon: Home,
      roles: ['admin', 'conducteur', 'expediteur']
    },
    {
      label: 'Annonces',
      path: '/announcements',
      icon: Package,
      roles: ['conducteur', 'expediteur']
    },
    {
      label: 'Mes Annonces',
      path: '/my-announcements',
      icon: Truck,
      roles: ['conducteur']
    },
    {
      label: 'Demandes',
      path: '/demands',
      icon: MessageCircle,
      roles: ['conducteur', 'expediteur']
    },
    {
      label: 'Administration',
      path: '/admin',
      icon: BarChart3,
      roles: ['admin']
    }
  ];

  const secondaryItems = [
    {
      label: 'Mon Profil',
      path: '/profile',
      icon: User,
      roles: ['admin', 'conducteur', 'expediteur']
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['admin', 'conducteur', 'expediteur']
    },
    {
      label: 'Paramètres',
      path: '/settings',
      icon: Settings,
      roles: ['admin', 'conducteur', 'expediteur']
    },
    {
      label: 'Aide',
      path: '/help',
      icon: HelpCircle,
      roles: ['admin', 'conducteur', 'expediteur']
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const filteredSecondaryItems = secondaryItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`z-50 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto pt-0 fixed left-0 top-0 min-h-full w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed lg:left-0 lg:top-0 lg:min-h-full lg:w-64`}>
        {/* If you use custom colors like bg-primary-100, ensure they're defined in your Tailwind config */}
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">TransportConnect</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'conducteur' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 
                 user?.role === 'conducteur' ? 'Conducteur' : 'Expéditeur'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Primary Navigation */}
          <div className="px-3 mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActivePath(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Secondary Navigation */}
          <div className="px-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Compte
            </h3>
            <ul className="space-y-1">
              {filteredSecondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActivePath(item.path)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActivePath(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;