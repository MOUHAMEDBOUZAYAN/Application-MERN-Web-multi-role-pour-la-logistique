import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserPlus, TrendingUp, Calendar, Mail, Shield, Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all users (up to 100 for demo)
        const res = await adminAPI.getUsers({ limit: 100 });
        const usersList = res.data?.utilisateurs || res.data || [];
        setUsers(usersList);
        // Get dashboard stats for monthly registrations
        const dash = await adminAPI.getDashboard();
        const croissance = dash.data?.croissance?.utilisateurs || [];
        // Format for recharts
        setMonthlyStats(croissance.map(item => ({
          mois: `${item._id.mois}/${item._id.annee}`,
          nouveaux: item.nouveauxUtilisateurs
        })));
      } catch (err) {
        setError('Erreur lors du chargement des données admin');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Statistics calculations
  const conducteurs = users.filter(u => u.role === 'conducteur');
  const expediteurs = users.filter(u => u.role === 'expediteur');  
  const activeUsers = users.filter(u => u.statut === 'actif');
  const totalUsers = users.length;
  const newUsersThisMonth = monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1]?.nouveaux || 0 : 0;

  const repartition = [
    { name: 'Conducteurs', value: conducteurs.length },
    { name: 'Expéditeurs', value: expediteurs.length }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : color === 'purple' ? 'text-purple-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const UserTable = ({ title, users, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {users.length}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun utilisateur trouvé</p>
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {u.prenom?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.prenom} {u.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.statut === 'actif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.statut}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Tableau de bord Administrateur
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Bienvenue, {user?.prenom || 'Admin'} !
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Utilisateurs"
            value={totalUsers}
            color="blue"
          />
          <StatCard
            icon={UserCheck}
            title="Utilisateurs Actifs"
            value={activeUsers.length}
            subtitle={`${Math.round((activeUsers.length / totalUsers) * 100) || 0}% du total`}
            color="green"
          />
          <StatCard
            icon={UserPlus}
            title="Nouveaux ce mois"
            value={newUsersThisMonth}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Conducteurs"
            value={conducteurs.length}
            subtitle={`vs ${expediteurs.length} expéditeurs`}
            color="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              Répartition Conducteurs / Expéditeurs
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={repartition} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {repartition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
              Inscriptions par mois
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="nouveaux" fill="#3B82F6" name="Nouveaux utilisateurs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserTable
            title="Conducteurs"
            users={conducteurs}
            icon={UserCheck}
          />
          <UserTable
            title="Expéditeurs"
            users={expediteurs}
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;