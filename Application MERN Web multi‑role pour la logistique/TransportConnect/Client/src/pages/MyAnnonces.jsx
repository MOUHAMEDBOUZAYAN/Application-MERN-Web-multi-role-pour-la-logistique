import React, { useState, useEffect } from 'react';
import { annonceAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Filter,
  Search,
  MoreVertical,
  Star,
  Activity
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import Loading, { CardLoading } from '../components/common/Loading';
import AnnonceForm from '../components/annonces/AnnonceForm';
import AnnonceDetails from '../components/annonces/AnnonceDetails';
import Modal, { ConfirmationModal } from '../components/common/Modal';
import toast from 'react-hot-toast';

const MyAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMyAnnouncements();
  }, []);

  const loadMyAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await annonceAPI.getUserAnnouncements();
      const annonces = response.annonces || response.data?.annonces || response.data || [];
      setAnnouncements(Array.isArray(annonces) ? annonces : []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Erreur lors du chargement des annonces');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (data) => {
    try {
      const response = await annonceAPI.create(data);
      const newAnnouncement = response.data || response;
      setAnnouncements(prev => Array.isArray(prev) ? [newAnnouncement, ...prev] : [newAnnouncement]);
      setShowCreateForm(false);
      toast.success('Annonce créée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'annonce');
    }
  };

  const handleUpdateAnnouncement = async (data) => {
    try {
      const response = await annonceAPI.update(editingAnnouncement._id, data);
      const updatedAnnouncement = response.data || response;
      setAnnouncements(prev => 
        Array.isArray(prev) 
          ? prev.map(ann => ann._id === editingAnnouncement._id ? updatedAnnouncement : ann)
          : [updatedAnnouncement]
      );
      setEditingAnnouncement(null);
      toast.success('Annonce mise à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'annonce');
    }
  };

  const handleDeleteAnnouncement = async () => {
    try {
      await annonceAPI.delete(deleteConfirm._id);
      setAnnouncements(prev => 
        Array.isArray(prev) 
          ? prev.filter(ann => ann._id !== deleteConfirm._id)
          : []
      );
      setDeleteConfirm(null);
      toast.success('Annonce supprimée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'annonce');
    }
  };

  const getFilteredAnnouncements = () => {
    const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
    let filtered = safeAnnouncements;

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(ann => ann.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(ann => ann.status === 'inactive');
        break;
      case 'completed':
        filtered = filtered.filter(ann => ann.status === 'completed');
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ann => 
        ann.lieuDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.typeMarchandise.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getTabCounts = () => {
    const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
    return {
      all: safeAnnouncements.length,
      active: safeAnnouncements.filter(ann => ann.status === 'active').length,
      inactive: safeAnnouncements.filter(ann => ann.status === 'inactive').length,
      completed: safeAnnouncements.filter(ann => ann.status === 'completed').length
    };
  };

  const getStats = () => {
    const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
    return {
      totalViews: safeAnnouncements.reduce((sum, ann) => sum + (ann.vuesCount || 0), 0),
      totalRequests: safeAnnouncements.reduce((sum, ann) => sum + (ann.demandesCount || 0), 0),
      activeCount: safeAnnouncements.filter(ann => ann.status === 'active').length,
      completedCount: safeAnnouncements.filter(ann => ann.status === 'completed').length
    };
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const tabCounts = getTabCounts();
  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CardLoading count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Mes Annonces
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Gérez vos trajets et recevez des demandes de transport
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle Annonce</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Annonces actives</p>
                  <p className="text-2xl font-bold">{stats.activeCount}</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total vues</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Demandes reçues</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Terminées</p>
                  <p className="text-2xl font-bold">{stats.completedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par lieu de départ, destination ou type de marchandise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Enhanced Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Toutes', count: tabCounts.all, color: 'gray' },
              { key: 'active', label: 'Actives', count: tabCounts.active, color: 'green' },
              { key: 'inactive', label: 'Inactives', count: tabCounts.inactive, color: 'yellow' },
              { key: 'completed', label: 'Terminées', count: tabCounts.completed, color: 'blue' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-700 ring-2 ring-${tab.color}-200`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.key
                      ? `bg-${tab.color}-200 text-${tab.color}-800`
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'all' ? 'Aucune annonce trouvée' : `Aucune annonce ${activeTab}`}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm 
                  ? 'Aucune annonce ne correspond à votre recherche'
                  : activeTab === 'all' 
                    ? 'Commencez par créer votre première annonce de trajet'
                    : `Vous n'avez pas d'annonce ${activeTab} pour le moment`
                }
              </p>
              {activeTab === 'all' && !searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Créer ma première annonce
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
                {/* Enhanced Status Badge */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                      announcement.status === 'active' ? 'bg-green-100 text-green-800' :
                      announcement.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {announcement.status === 'active' && <CheckCircle className="h-3 w-3" />}
                      {announcement.status === 'inactive' && <Clock className="h-3 w-3" />}
                      {announcement.status === 'completed' && <Star className="h-3 w-3" />}
                      <span>{getStatusLabel(announcement.status)}</span>
                    </span>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(announcement)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Route */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {announcement.lieuDepart}
                        </span>
                      </div>
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {announcement.destination}
                        </span>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2 mt-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Étapes:</span> {announcement.etapesIntermediaires.slice(0, 2).join(', ')}
                          {announcement.etapesIntermediaires.length > 2 && ` +${announcement.etapesIntermediaires.length - 2} autres`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Date and Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{formatDate(announcement.dateDepart)}</span>
                      </div>
                      {announcement.heureDepart && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{announcement.heureDepart}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">{announcement.typeMarchandise}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{announcement.capaciteDisponible}</span>
                        <span className="text-sm text-gray-500 ml-1">kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Description Preview */}
                  {announcement.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-clamp-2">
                        {announcement.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Stats Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {announcement.demandesCount || 0}
                        </span>
                        <span className="text-xs text-gray-500">demande{(announcement.demandesCount || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {announcement.vuesCount || 0}
                        </span>
                        <span className="text-xs text-gray-500">vue{(announcement.vuesCount || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {announcement.status === 'active' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">En ligne</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals remain the same */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Créer une nouvelle annonce"
          size="large"
        >
          <AnnonceForm
            onSubmit={handleCreateAnnouncement}
            onCancel={() => setShowCreateForm(false)}
          />
        </Modal>

        <Modal
          isOpen={!!editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          title="Modifier l'annonce"
          size="large"
        >
          {editingAnnouncement && (
            <AnnonceForm
              announcement={editingAnnouncement}
              onSubmit={handleUpdateAnnouncement}
              onCancel={() => setEditingAnnouncement(null)}
            />
          )}
        </Modal>

        <Modal
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          title="Détails de l'annonce"
          size="large"
        >
          {selectedAnnouncement && (
            <AnnonceDetails
              announcement={selectedAnnouncement}
              onClose={() => setSelectedAnnouncement(null)}
            />
          )}
        </Modal>

        <ConfirmationModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteAnnouncement}
          title="Supprimer l'annonce"
          message={`Êtes-vous sûr de vouloir supprimer l'annonce "${deleteConfirm?.lieuDepart} → ${deleteConfirm?.destination}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          type="danger"
        />
      </div>
    </div>
  );
};

export default MyAnnouncements;