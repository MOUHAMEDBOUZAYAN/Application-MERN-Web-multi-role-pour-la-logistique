import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { announcementsAPI } from '../../utils/api';
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { CITIES, CARGO_TYPES } from '../../utils/constants';
import Loading, { TableLoading } from '../common/Loading';
import Modal, { ConfirmationModal } from '../common/Modal';
import AnnouncementDetails from '../announcements/AnnouncementDetails';
import toast from 'react-hot-toast';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadAnnouncements();
    loadStats();
  }, [currentPage, statusFilter, cityFilter, cargoFilter, searchQuery]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        lieuDepart: cityFilter || undefined,
        typeMarchandise: cargoFilter || undefined
      };

      const response = await announcementsAPI.getAll(params);
      setAnnouncements(response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // This would be a specific admin endpoint for announcement stats
      const response = await announcementsAPI.getAll({ limit: 1000 });
      const allAnnouncements = response.data.data || response.data;
      
      setStats({
        total: allAnnouncements.length,
        active: allAnnouncements.filter(a => a.status === 'active').length,
        inactive: allAnnouncements.filter(a => a.status === 'inactive').length,
        completed: allAnnouncements.filter(a => a.status === 'completed').length,
        reported: allAnnouncements.filter(a => a.reported).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpdateStatus = async (announcement, newStatus) => {
    try {
      await announcementsAPI.update(announcement._id, { status: newStatus });
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, status: newStatus }
            : a
        )
      );
      toast.success(`Annonce ${getStatusLabel(newStatus).toLowerCase()}`);
      setActionConfirm(null);
      loadStats();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      await announcementsAPI.delete(announcement._id);
      setAnnouncements(prev => prev.filter(a => a._id !== announcement._id));
      toast.success('Annonce supprimée avec succès');
      setActionConfirm(null);
      loadStats();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMarkAsReported = async (announcement) => {
    try {
      await announcementsAPI.update(announcement._id, { reported: true });
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, reported: true }
            : a
        )
      );
      toast.success('Annonce marquée comme signalée');
      loadStats();
    } catch (error) {
      toast.error('Erreur lors du signalement');
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <TableLoading rows={10} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des annonces</h2>
          <p className="text-gray-600">Modérez et gérez toutes les annonces de transport</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <Package className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        
        <div className="card text-center">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{stats.active || 0}</p>
          <p className="text-sm text-gray-600">Actives</p>
        </div>
        
        <div className="card text-center">
          <XCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-700">{stats.inactive || 0}</p>
          <p className="text-sm text-gray-600">Inactives</p>
        </div>
        
        <div className="card text-center">
          <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{stats.completed || 0}</p>
          <p className="text-sm text-gray-600">Terminées</p>
        </div>
        
        <div className="card text-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{stats.reported || 0}</p>
          <p className="text-sm text-gray-600">Signalées</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une annonce..."
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
            <option value="completed">Terminées</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Cargo Filter */}
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les types</option>
            {CARGO_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setCityFilter('');
              setCargoFilter('');
            }}
            className="btn-secondary"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trajet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conducteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Capacité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{announcement.lieuDepart} → {announcement.destination}</span>
                      </div>
                      {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Via: {announcement.etapesIntermediaires.slice(0, 2).join(', ')}
                          {announcement.etapesIntermediaires.length > 2 && ` +${announcement.etapesIntermediaires.length - 2}`}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {announcement.conducteur?.avatar ? (
                          <img
                            src={announcement.conducteur.avatar}
                            alt={`${announcement.conducteur.prenom} ${announcement.conducteur.nom}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {announcement.conducteur?.prenom} {announcement.conducteur?.nom}
                        </div>
                        <div className="text-xs text-gray-500">{announcement.conducteur?.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{announcement.typeMarchandise}</div>
                    <div className="text-xs text-gray-500">{announcement.capaciteDisponible} kg</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(announcement.dateDepart)}</span>
                    </div>
                    {announcement.heureDepart && (
                      <div className="text-xs text-gray-500">{announcement.heureDepart}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(announcement.status)}-100 text-${getStatusColor(announcement.status)}-800`}>
                        {getStatusLabel(announcement.status)}
                      </span>
                      {announcement.reported && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Signalée
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {announcement.demandesCount || 0} demande{(announcement.demandesCount || 0) !== 1 ? 's' : ''}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {announcement.status === 'active' && (
                        <button
                          onClick={() => setActionConfirm({ type: 'deactivate', announcement })}
                          className="text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Désactiver"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {announcement.status === 'inactive' && (
                        <button
                          onClick={() => setActionConfirm({ type: 'activate', announcement })}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Activer"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {!announcement.reported && (
                        <button
                          onClick={() => setActionConfirm({ type: 'report', announcement })}
                          className="text-gray-400 hover:text-orange-600 transition-colors"
                          title="Signaler"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setActionConfirm({ type: 'delete', announcement })}
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
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
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

      {/* Announcement Details Modal */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title="Détails de l'annonce"
        size="large"
      >
        {selectedAnnouncement && (
          <div className="space-y-6">
            <AnnouncementDetails
              announcement={selectedAnnouncement}
              onClose={() => setSelectedAnnouncement(null)}
            />
            
            {/* Admin Actions */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Actions d'administration</h4>
              <div className="flex space-x-4">
                {selectedAnnouncement.status === 'active' && (
                  <button
                    onClick={() => setActionConfirm({ type: 'deactivate', announcement: selectedAnnouncement })}
                    className="btn-secondary"
                  >
                    Désactiver l'annonce
                  </button>
                )}
                
                {selectedAnnouncement.status === 'inactive' && (
                  <button
                    onClick={() => setActionConfirm({ type: 'activate', announcement: selectedAnnouncement })}
                    className="btn-primary"
                  >
                    Activer l'annonce
                  </button>
                )}
                
                {!selectedAnnouncement.reported && (
                  <button
                    onClick={() => setActionConfirm({ type: 'report', announcement: selectedAnnouncement })}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Signaler l'annonce
                  </button>
                )}
                
                <button
                  onClick={() => setActionConfirm({ type: 'delete', announcement: selectedAnnouncement })}
                  className="btn-danger"
                >
                  Supprimer l'annonce
                </button>
              </div>
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
              case 'activate':
                handleUpdateStatus(actionConfirm.announcement, 'active');
                break;
              case 'deactivate':
                handleUpdateStatus(actionConfirm.announcement, 'inactive');
                break;
              case 'report':
                handleMarkAsReported(actionConfirm.announcement);
                break;
              case 'delete':
                handleDeleteAnnouncement(actionConfirm.announcement);
                break;
            }
          }}
          title={
            actionConfirm.type === 'activate' ? 'Activer l\'annonce' :
            actionConfirm.type === 'deactivate' ? 'Désactiver l\'annonce' :
            actionConfirm.type === 'report' ? 'Signaler l\'annonce' :
            'Supprimer l\'annonce'
          }
          message={
            actionConfirm.type === 'activate' 
              ? `Voulez-vous réactiver l'annonce "${actionConfirm.announcement.lieuDepart} → ${actionConfirm.announcement.destination}" ?`
              : actionConfirm.type === 'deactivate'
              ? `Voulez-vous désactiver l'annonce "${actionConfirm.announcement.lieuDepart} → ${actionConfirm.announcement.destination}" ?`
              : actionConfirm.type === 'report'
              ? `Voulez-vous marquer cette annonce comme signalée ? Elle apparaîtra dans la liste des contenus à modérer.`
              : `Êtes-vous sûr de vouloir supprimer définitivement l'annonce "${actionConfirm.announcement.lieuDepart} → ${actionConfirm.announcement.destination}" ? Cette action est irréversible.`
          }
          confirmText={
            actionConfirm.type === 'activate' ? 'Activer' :
            actionConfirm.type === 'deactivate' ? 'Désactiver' :
            actionConfirm.type === 'report' ? 'Signaler' :
            'Supprimer'
          }
          type={
            actionConfirm.type === 'delete' ? 'danger' :
            actionConfirm.type === 'report' ? 'warning' :
            'info'
          }
        />
      )}

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-6 w-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Contenus signalés</h4>
            <p className="text-sm text-gray-600">Voir les {stats.reported || 0} annonces signalées</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <XCircle className="h-6 w-6 text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900">Annonces inactives</h4>
            <p className="text-sm text-gray-600">Gérer les {stats.inactive || 0} annonces inactives</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Statistiques</h4>
            <p className="text-sm text-gray-600">Voir les analyses détaillées</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManagement;