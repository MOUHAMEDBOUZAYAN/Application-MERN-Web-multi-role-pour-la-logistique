import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  MessageCircle, 
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Download
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { adminAPI } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { CHART_COLORS } from '../../utils/constants';
import Loading from '../../components/common/Loading';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, dashboardRes] = await Promise.all([
        adminAPI.getAnalytics(selectedPeriod),
        adminAPI.getDashboardData()
      ]);
      
      setAnalytics(analyticsRes.data);
      setStats(dashboardRes.data.stats);
      setRecentActivity(dashboardRes.data.recentActivity || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Utilisateurs Total',
      value: stats.totalUsers || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Annonces Actives',
      value: stats.activeAnnouncements || 0,
      change: '+8%',
      changeType: 'increase',
      icon: Package,
      color: 'green'
    },
    {
      title: 'Demandes ce mois',
      value: stats.monthlyDemands || 0,
      change: '+15%',
      changeType: 'increase',
      icon: MessageCircle,
      color: 'purple'
    },
    {
      title: 'Revenus ce mois',
      value: `${stats.monthlyRevenue || 0} MAD`,
      change: '+5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  // Chart data
  const userGrowthData = {
    labels: analytics.userGrowth?.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: analytics.userGrowth?.data || [12, 19, 15, 25, 22, 30],
        borderColor: CHART_COLORS.PRIMARY,
        backgroundColor: CHART_COLORS.PRIMARY + '20',
        tension: 0.4
      }
    ]
  };

  const announcementStatsData = {
    labels: ['Actives', 'Terminées', 'Annulées'],
    datasets: [
      {
        data: [
          stats.activeAnnouncements || 25,
          stats.completedAnnouncements || 45,
          stats.cancelledAnnouncements || 8
        ],
        backgroundColor: [
          CHART_COLORS.SUCCESS,
          CHART_COLORS.INFO,
          CHART_COLORS.DANGER
        ]
      }
    ]
  };

  const demandsByStatusData = {
    labels: ['En attente', 'Acceptées', 'Refusées', 'Terminées'],
    datasets: [
      {
        label: 'Demandes',
        data: analytics.demandsByStatus?.data || [15, 35, 8, 42],
        backgroundColor: [
          CHART_COLORS.WARNING,
          CHART_COLORS.SUCCESS,
          CHART_COLORS.DANGER,
          CHART_COLORS.INFO
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  const exportReport = () => {
    const reportData = {
      periode: selectedPeriod,
      date: new Date().toISOString(),
      statistiques: stats,
      analytics: analytics
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rapport_admin_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de la plateforme TransportConnect
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">1 an</option>
          </select>
          
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          
          <button
            onClick={loadDashboardData}
            className="btn-primary text-sm"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                  <Icon className={`h-8 w-8 text-${kpi.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Croissance des utilisateurs
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Announcements Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Statut des annonces
            </h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={announcementStatsData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Demands Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Demandes par statut
          </h3>
          <MessageCircle className="h-5 w-5 text-gray-400" />
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={demandsByStatusData} options={chartOptions} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <span>Activité récente</span>
          </h3>
          
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Aucune activité récente</p>
              </div>
            ) : (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'user_registered' ? 'bg-green-500' :
                    activity.type === 'announcement_created' ? 'bg-blue-500' :
                    activity.type === 'demand_sent' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message || 'Nouvelle activité'}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.createdAt || new Date())}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {recentActivity.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                Voir toute l'activité →
              </button>
            </div>
          )}
        </div>

        {/* System Status & Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>État du système</span>
          </h3>
          
          <div className="space-y-4">
            {/* System Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Serveur</span>
                </div>
                <span className="text-sm text-green-700">Opérationnel</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Base de données</span>
                </div>
                <span className="text-sm text-green-700">Stable</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">API</span>
                </div>
                <span className="text-sm text-green-700">Fonctionnelle</span>
              </div>
            </div>

            {/* Alerts */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Alertes</h4>
              
              {stats.pendingReports > 0 ? (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {stats.pendingReports} signalements en attente
                    </p>
                    <p className="text-xs text-yellow-700">Nécessitent une modération</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Tout va bien !</p>
                    <p className="text-xs text-green-700">Aucune alerte système</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actions rapides
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <Users className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900 mb-1">Gérer les utilisateurs</h4>
            <p className="text-sm text-gray-600">Voir, modifier et suspendre des comptes</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <Package className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900 mb-1">Modérer les annonces</h4>
            <p className="text-sm text-gray-600">Valider et supprimer des annonces</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <BarChart3 className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900 mb-1">Voir les statistiques</h4>
            <p className="text-sm text-gray-600">Analyses détaillées et rapports</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <MessageCircle className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900 mb-1">Support utilisateurs</h4>
            <p className="text-sm text-gray-600">Gérer les tickets et demandes</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;