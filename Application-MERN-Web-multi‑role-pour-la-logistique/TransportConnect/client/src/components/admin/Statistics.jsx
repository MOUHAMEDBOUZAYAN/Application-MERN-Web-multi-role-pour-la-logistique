import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
  RadialLinearScale,
} from 'chart.js';
import { adminAPI } from '../../utils/api';
import { CHART_COLORS } from '../../utils/constants';
import Loading from '../common/Loading';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics(selectedPeriod);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistiques de la plateforme'
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
        position: 'right',
      }
    }
  };

  // User Growth Chart
  const userGrowthData = {
    labels: analytics.userGrowth?.labels || [],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: analytics.userGrowth?.data || [],
        borderColor: CHART_COLORS.PRIMARY,
        backgroundColor: CHART_COLORS.PRIMARY + '20',
        tension: 0.4
      },
      {
        label: 'Utilisateurs actifs',
        data: analytics.activeUsers?.data || [],
        borderColor: CHART_COLORS.SUCCESS,
        backgroundColor: CHART_COLORS.SUCCESS + '20',
        tension: 0.4
      }
    ]
  };

  // Revenue Chart
  const revenueData = {
    labels: analytics.revenue?.labels || [],
    datasets: [
      {
        label: 'Revenus (MAD)',
        data: analytics.revenue?.data || [],
        backgroundColor: CHART_COLORS.WARNING,
        borderColor: CHART_COLORS.WARNING,
        borderWidth: 1
      }
    ]
  };

  // Users by Role
  const usersByRoleData = {
    labels: ['Conducteurs', 'Expéditeurs', 'Administrateurs'],
    datasets: [
      {
        data: [
          analytics.usersByRole?.conducteur || 0,
          analytics.usersByRole?.expediteur || 0,
          analytics.usersByRole?.admin || 0
        ],
        backgroundColor: [
          CHART_COLORS.PRIMARY,
          CHART_COLORS.SUCCESS,
          CHART_COLORS.PURPLE
        ]
      }
    ]
  };

  // Announcements by Status
  const announcementsByStatusData = {
    labels: ['Actives', 'Terminées', 'Annulées'],
    datasets: [
      {
        data: [
          analytics.announcementsByStatus?.active || 0,
          analytics.announcementsByStatus?.completed || 0,
          analytics.announcementsByStatus?.cancelled || 0
        ],
        backgroundColor: [
          CHART_COLORS.SUCCESS,
          CHART_COLORS.INFO,
          CHART_COLORS.DANGER
        ]
      }
    ]
  };

  // Popular Routes
  const popularRoutesData = {
    labels: analytics.popularRoutes?.map(route => `${route.from} → ${route.to}`) || [],
    datasets: [
      {
        label: 'Nombre de trajets',
        data: analytics.popularRoutes?.map(route => route.count) || [],
        backgroundColor: CHART_COLORS.INFO,
        borderColor: CHART_COLORS.INFO,
        borderWidth: 1
      }
    ]
  };

  // Performance Metrics Radar
  const performanceData = {
    labels: [
      'Taux d\'acceptation',
      'Satisfaction utilisateur',
      'Temps de réponse',
      'Fiabilité',
      'Croissance',
      'Rétention'
    ],
    datasets: [
      {
        label: 'Performance',
        data: [
          analytics.performance?.acceptanceRate || 0,
          analytics.performance?.userSatisfaction || 0,
          analytics.performance?.responseTime || 0,
          analytics.performance?.reliability || 0,
          analytics.performance?.growth || 0,
          analytics.performance?.retention || 0
        ],
        backgroundColor: CHART_COLORS.PRIMARY + '20',
        borderColor: CHART_COLORS.PRIMARY,
        pointBackgroundColor: CHART_COLORS.PRIMARY,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CHART_COLORS.PRIMARY
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Métrique,Valeur\n"
      + `Utilisateurs totaux,${analytics.totalUsers || 0}\n`
      + `Annonces totales,${analytics.totalAnnouncements || 0}\n`
      + `Demandes totales,${analytics.totalDemands || 0}\n`
      + `Revenus totaux,${analytics.totalRevenue || 0} MAD\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statistiques_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques avancées</h2>
          <p className="text-gray-600">Analyses détaillées de la performance de la plateforme</p>
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
            onClick={exportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers || 0}</p>
          <p className="text-sm text-gray-600">Utilisateurs totaux</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics.userGrowthRate || 0}% ce mois
          </p>
        </div>
        
        <div className="card text-center">
          <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics.totalAnnouncements || 0}</p>
          <p className="text-sm text-gray-600">Annonces créées</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics.announcementGrowthRate || 0}% ce mois
          </p>
        </div>
        
        <div className="card text-center">
          <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics.totalDemands || 0}</p>
          <p className="text-sm text-gray-600">Demandes envoyées</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics.demandGrowthRate || 0}% ce mois
          </p>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics.totalRevenue || 0} MAD</p>
          <p className="text-sm text-gray-600">Revenus générés</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics.revenueGrowthRate || 0}% ce mois
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Croissance des utilisateurs
          </h3>
          <div className="h-80">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des revenus
          </h3>
          <div className="h-80">
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Users by Role */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition des utilisateurs
          </h3>
          <div className="h-80">
            <Doughnut data={usersByRoleData} options={doughnutOptions} />
          </div>
        </div>

        {/* Announcements by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statut des annonces
          </h3>
          <div className="h-80">
            <Doughnut data={announcementsByStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Routes les plus populaires
        </h3>
        <div className="h-80">
          <Bar data={popularRoutesData} options={chartOptions} />
        </div>
      </div>

      {/* Performance Radar */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Indicateurs de performance
        </h3>
        <div className="h-80">
          <Radar data={performanceData} options={radarOptions} />
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Métriques détaillées
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période précédente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évolution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  metric: 'Taux d\'acceptation des demandes',
                  current: `${analytics.metrics?.acceptanceRate || 0}%`,
                  previous: `${analytics.metrics?.previousAcceptanceRate || 0}%`,
                  change: analytics.metrics?.acceptanceRateChange || 0
                },
                {
                  metric: 'Temps moyen de réponse',
                  current: `${analytics.metrics?.avgResponseTime || 0}h`,
                  previous: `${analytics.metrics?.previousAvgResponseTime || 0}h`,
                  change: analytics.metrics?.responseTimeChange || 0
                },
                {
                  metric: 'Taux de satisfaction',
                  current: `${analytics.metrics?.satisfactionRate || 0}%`,
                  previous: `${analytics.metrics?.previousSatisfactionRate || 0}%`,
                  change: analytics.metrics?.satisfactionRateChange || 0
                },
                {
                  metric: 'Revenus par transaction',
                  current: `${analytics.metrics?.revenuePerTransaction || 0} MAD`,
                  previous: `${analytics.metrics?.previousRevenuePerTransaction || 0} MAD`,
                  change: analytics.metrics?.revenuePerTransactionChange || 0
                }
              ].map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.metric}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.current}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.previous}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.change > 0 
                        ? 'bg-green-100 text-green-800' 
                        : row.change < 0 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {row.change > 0 ? '+' : ''}{row.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;