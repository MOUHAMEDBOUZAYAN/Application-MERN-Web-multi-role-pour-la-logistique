import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Shield,
  Award,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';
import { usersAPI } from '../../utils/api';
import { formatDate, getInitials, formatPhoneNumber } from '../../utils/helpers';
import { USER_ROLES } from '../../utils/constants';
import Loading, { TableLoading } from '../common/Loading';
import Modal, { ConfirmationModal } from '../common/Modal';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      };

      const response = await usersAPI.getAll(params);
      setUsers(response.data.data || response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.toggleStatus(user._id);
      setUsers(prev => 
        prev.map(u => 
          u._id === user._id 
            ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
            : u
        )
      );
      toast.success(`Utilisateur ${user.status === 'active' ? 'suspendu' : 'activé'} avec succès`);
      setActionConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleAddBadge = async (user, badge) => {
    try {
      await usersAPI.addBadge(user._id, badge);
      setUsers(prev => 
        prev.map(u => 
          u._id === user._id 
            ? { ...u, badges: [...(u.badges || []), badge] }
            : u
        )
      );
      toast.success('Badge ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du badge');
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await usersAPI.delete(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success('Utilisateur supprimé avec succès');
      setActionConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      conducteur: 'Conducteur',
      expediteur: 'Expéditeur'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'purple',
      conducteur: 'blue',
      expediteur: 'green'
    };
    return colors[role] || 'gray';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <TableLoading rows={10} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
          <p className="text-gray-600">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        
        <button className="btn-primary flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Inviter utilisateur</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="input-field pl-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les rôles</option>
            {Object.entries(USER_ROLES).map(([key, value]) => (
              <option key={key} value={value}>{getRoleLabel(value)}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="pending">En attente</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('');
              setStatusFilter('');
            }}
            className="btn-secondary"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.prenom} ${user.nom}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(`${user.prenom} ${user.nom}`)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.telephone && (
                          <div className="text-xs text-gray-400">
                            {formatPhoneNumber(user.telephone)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(user.status)}-100 text-${getStatusColor(user.status)}-800`}>
                      {user.status === 'active' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Suspendu
                        </>
                      )}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Vérifié
                        </span>
                      )}
                      {user.premium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Award className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                      {(!user.verified && !user.premium) && (
                        <span className="text-xs text-gray-400">Aucun badge</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setActionConfirm({ type: 'toggle_status', user })}
                        className={`${
                          user.status === 'active' 
                            ? 'text-gray-400 hover:text-red-600' 
                            : 'text-gray-400 hover:text-green-600'
                        } transition-colors`}
                        title={user.status === 'active' ? 'Suspendre' : 'Activer'}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setActionConfirm({ type: 'delete', user })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Détails de l'utilisateur"
        size="large"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.prenom} ${selectedUser.nom}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-gray-600">
                    {getInitials(`${selectedUser.prenom} ${selectedUser.nom}`)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.prenom} {selectedUser.nom}
                </h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                {selectedUser.telephone && (
                  <p className="text-gray-600">{formatPhoneNumber(selectedUser.telephone)}</p>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`badge badge-${getRoleColor(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                  <span className={`badge badge-${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status === 'active' ? 'Actif' : 'Suspendu'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{selectedUser.stats?.totalTrips || 0}</p>
                <p className="text-sm text-gray-600">Trajets</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{selectedUser.stats?.rating || 0}</p>
                <p className="text-sm text-gray-600">Note moyenne</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{selectedUser.stats?.reviews || 0}</p>
                <p className="text-sm text-gray-600">Avis reçus</p>
              </div>
            </div>

            {/* Badge Management */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Gestion des badges</h4>
              <div className="space-y-2">
                {!selectedUser.verified && (
                  <button
                    onClick={() => handleAddBadge(selectedUser, 'verified')}
                    className="btn-primary text-sm mr-2"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Marquer comme vérifié
                  </button>
                )}
                
                {!selectedUser.premium && (
                  <button
                    onClick={() => handleAddBadge(selectedUser, 'premium')}
                    className="btn-secondary text-sm mr-2"
                  >
                    <Award className="h-4 w-4 mr-1" />
                    Accorder le statut Premium
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setActionConfirm({ type: 'toggle_status', user: selectedUser })}
                className={`btn-${selectedUser.status === 'active' ? 'danger' : 'primary'}`}
              >
                {selectedUser.status === 'active' ? 'Suspendre' : 'Activer'}
              </button>
              
              <button
                onClick={() => setActionConfirm({ type: 'delete', user: selectedUser })}
                className="btn-danger"
              >
                Supprimer le compte
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modals */}
      {actionConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setActionConfirm(null)}
          onConfirm={() => {
            switch (actionConfirm.type) {
              case 'toggle_status':
                handleToggleStatus(actionConfirm.user);
                break;
              case 'delete':
                handleDeleteUser(actionConfirm.user);
                break;
            }
          }}
          title={
            actionConfirm.type === 'toggle_status' 
              ? `${actionConfirm.user.status === 'active' ? 'Suspendre' : 'Activer'} l'utilisateur`
              : 'Supprimer l\'utilisateur'
          }
          message={
            actionConfirm.type === 'toggle_status'
              ? `Voulez-vous ${actionConfirm.user.status === 'active' ? 'suspendre' : 'activer'} le compte de ${actionConfirm.user.prenom} ${actionConfirm.user.nom} ?`
              : `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${actionConfirm.user.prenom} ${actionConfirm.user.nom} ? Cette action est irréversible.`
          }
          confirmText={
            actionConfirm.type === 'toggle_status' 
              ? (actionConfirm.user.status === 'active' ? 'Suspendre' : 'Activer')
              : 'Supprimer'
          }
          type={actionConfirm.type === 'delete' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
};

export default UserManagement;