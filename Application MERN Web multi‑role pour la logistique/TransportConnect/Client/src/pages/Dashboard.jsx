import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { announcementsAPI, demandsAPI, usersAPI } from '../utils/api';
import { 
  Truck, 
  Package, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import Loading, { CardLoading } from '../components/common/Loading';

const Dashboard = () => {
  const { user, isConductor, isSender, isAdmin } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const [stats, setStats] = useState({});
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentDemands, setRecentDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load different data based on user role
      if (isConductor()) {
        await loadConductorData();
      } else if (isSender()) {
        await loadSenderData();
      } else if (isAdmin()) {
        await loadAdminData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConductorData = async () => {
    const [announcementsRes, demandsRes] = await Promise.all([
      announcementsAPI.getUserAnnouncements(),
      demandsAPI.getAll({ conducteur: user._id, limit: 5 })
    ]);

    setRecentAnnouncements(announcementsRes.data.slice(0, 5));
    setRecentDemands(demandsRes.data.data || demandsRes.data);
    
    setStats({
      totalAnnouncements: announcementsRes.data.length,
      activeAnnouncements: announcementsRes.data.filter(a => a.status === 'active').length,
      totalDemands: demandsRes.data.total || demandsRes.data.length,
      pendingDemands: (demandsRes.data.data || demandsRes.data).filter(d => d.status === 'pending').length
    });
  };

  const loadSenderData = async () => {
    const [announcementsRes, demandsRes] = await Promise.all([
      announcementsAPI.getAll({ limit: 5 }),
      demandsAPI.getUserDemands()
    ]);

    setRecentAnnouncements(announcementsRes.data.data || announcementsRes.data);
    setRecentDemands(demandsRes.data.slice(0, 5));
    
    setStats({
      availableAnnouncements: (announcementsRes.data.data || announcementsRes.data).length,
      totalDemands: demandsRes.data.length,
      acceptedDemands: demandsRes.data.filter(d => d.status === 'accepted').length,
      completedDemands: demandsRes.data.filter(d => d.status === 'completed').length
    });
  };

  const loadAdminData = async () => {
    const [announcementsRes, demandsRes, usersRes] = await Promise.all([
      announcementsAPI.getAll({ limit: 5 }),
      demandsAPI.getAll({ limit: 5 }),
      usersAPI.getAll({ limit: 10 })
    ]);

    setRecentAnnouncements(announcementsRes.data.data || announcementsRes.data);
    setRecentDemands(demandsRes.data.data || demandsRes.data);
    
    setStats({
      totalUsers: usersRes.data.total || usersRes.data.length,
      totalAnnouncements: (announcementsRes.data.data || announcementsRes.data).length,
      totalDemands: (demandsRes.data.data || demandsRes.data).length,
      onlineUsers: onlineUsers.length
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardLoading count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.prenom} !
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité sur TransportConnect
        </p>
        
        {/* Connection Status */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {onlineUsers.length} utilisateurs en ligne
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderStatsCards()}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Announcements */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isConductor() ? 'Mes Annonces Récentes' : 'Annonces Disponibles'}
            </h2>
            <Link
              to={isConductor() ? '/my-announcements' : '/announcements'}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          {recentAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune annonce trouvée</p>
              {isConductor() && (
                <Link
                  to="/my-announcements"
                  className="mt-2 inline-block text-primary-600 hover:text-primary-500"
                >
                  Créer une annonce
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {announcement.lieuDepart} → {announcement.destination}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">
                        {announcement.typeMarchandise} - {announcement.capaciteDisponible}kg
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(announcement.dateDepart)}</span>
                        </span>
                        <span className={`badge badge-${getStatusColor(announcement.status)}`}>
                          {getStatusLabel(announcement.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Demands */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isConductor() ? 'Demandes Reçues' : 'Mes Demandes'}
            </h2>
            <Link
              to="/demands"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          {recentDemands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune demande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDemands.map((demand) => (
                <div key={demand._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-2">
                        {demand.typeColis} - {demand.poids}kg
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {demand.dimensions}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(demand.createdAt)}</span>
                        </span>
                        <span className={`badge badge-${getStatusColor(demand.status)}`}>
                          {getStatusLabel(demand.status)}
                        </span>
                      </div>
                    </div>
                    {demand.status === 'pending' && isConductor() && (
                      <div className="flex space-x-2">
                        <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Accepter
                        </button>
                        <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderQuickActions()}
        </div>
      </div>
    </div>
  );

  function renderStatsCards() {
    const cards = [];
    
    if (isConductor()) {
      cards.push(
        <div key="announcements" className="card text-center">
          <Truck className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements || 0}</p>
          <p className="text-sm text-gray-600">Mes Annonces</p>
        </div>,
        <div key="active" className="card text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.activeAnnouncements || 0}</p>
          <p className="text-sm text-gray-600">Actives</p>
        </div>,
        <div key="demands" className="card text-center">
          <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalDemands || 0}</p>
          <p className="text-sm text-gray-600">Demandes Reçues</p>
        </div>,
        <div key="pending" className="card text-center">
          <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingDemands || 0}</p>
          <p className="text-sm text-gray-600">En Attente</p>
        </div>
      );
    } else if (isSender()) {
      cards.push(
        <div key="available" className="card text-center">
          <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.availableAnnouncements || 0}</p>
          <p className="text-sm text-gray-600">Annonces Disponibles</p>
        </div>,
        <div key="mydemands" className="card text-center">
          <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalDemands || 0}</p>
          <p className="text-sm text-gray-600">Mes Demandes</p>
        </div>,
        <div key="accepted" className="card text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.acceptedDemands || 0}</p>
          <p className="text-sm text-gray-600">Acceptées</p>
        </div>,
        <div key="completed" className="card text-center">
          <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.completedDemands || 0}</p>
          <p className="text-sm text-gray-600">Terminées</p>
        </div>
      );
    } else if (isAdmin()) {
      cards.push(
        <div key="users" className="card text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
          <p className="text-sm text-gray-600">Utilisateurs</p>
        </div>,
        <div key="announcements" className="card text-center">
          <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements || 0}</p>
          <p className="text-sm text-gray-600">Annonces</p>
        </div>,
        <div key="demands" className="card text-center">
          <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalDemands || 0}</p>
          <p className="text-sm text-gray-600">Demandes</p>
        </div>,
        <div key="online" className="card text-center">
          <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.onlineUsers || 0}</p>
          <p className="text-sm text-gray-600">En Ligne</p>
        </div>
      );
    }
    
    return cards;
  }

  function renderQuickActions() {
    const actions = [];
    
    if (isConductor()) {
      actions.push(
        <Link key="create" to="/my-announcements" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <Truck className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Créer une Annonce</h3>
            <p className="text-sm text-gray-600">Publier un nouveau trajet</p>
          </div>
        </Link>,
        <Link key="demands" to="/demands" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Voir les Demandes</h3>
            <p className="text-sm text-gray-600">Gérer vos demandes reçues</p>
          </div>
        </Link>
      );
    } else if (isSender()) {
      actions.push(
        <Link key="search" to="/announcements" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Chercher un Transport</h3>
            <p className="text-sm text-gray-600">Trouver un trajet disponible</p>
          </div>
        </Link>,
        <Link key="mydemands" to="/demands" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Mes Demandes</h3>
            <p className="text-sm text-gray-600">Suivre vos envois</p>
          </div>
        </Link>
      );
    } else if (isAdmin()) {
      actions.push(
        <Link key="admin" to="/admin" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Administration</h3>
            <p className="text-sm text-gray-600">Gérer la plateforme</p>
          </div>
        </Link>
      );
    }
    
    actions.push(
      <Link key="profile" to="/profile" className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-center">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900">Mon Profil</h3>
          <p className="text-sm text-gray-600">Modifier vos informations</p>
        </div>
      </Link>
    );
    
    return actions;
  }
};

export default Dashboard;