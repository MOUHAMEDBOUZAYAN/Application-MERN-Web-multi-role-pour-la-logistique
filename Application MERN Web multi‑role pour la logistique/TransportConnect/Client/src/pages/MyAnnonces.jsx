import React, { useState, useEffect } from 'react';
import { announcementsAPI } from '../utils/api';
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
  Clock
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import Loading, { CardLoading } from '../components/common/Loading';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import AnnouncementDetails from '../components/announcements/AnnouncementDetails';
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

  useEffect(() => {
    loadMyAnnouncements();
  }, []);

  const loadMyAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getUserAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (data) => {
    try {
      const response = await announcementsAPI.create(data);
      setAnnouncements(prev => [response.data, ...prev]);
      setShowCreateForm(false);
      toast.success('Annonce créée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'annonce');
    }
  };

  const handleUpdateAnnouncement = async (data) => {
    try {
      const response = await announcementsAPI.update(editingAnnouncement._id, data);
      setAnnouncements(prev => 
        prev.map(ann => ann._id === editingAnnouncement._id ? response.data : ann)
      );
      setEditingAnnouncement(null);
      toast.success('Annonce mise à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'annonce');
    }
  };

  const handleDeleteAnnouncement = async () => {
    try {
      await announcementsAPI.delete(deleteConfirm._id);
      setAnnouncements(prev => prev.filter(ann => ann._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      toast.success('Annonce supprimée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'annonce');
    }
  };

  const getFilteredAnnouncements = () => {
    switch (activeTab) {
      case 'active':
        return announcements.filter(ann => ann.status === 'active');
      case 'inactive':
        return announcements.filter(ann => ann.status === 'inactive');
      case 'completed':
        return announcements.filter(ann => ann.status === 'completed');
      default:
        return announcements;
    }
  };

  const getTabCounts = () => {
    return {
      all: announcements.length,
      active: announcements.filter(ann => ann.status === 'active').length,
      inactive: announcements.filter(ann => ann.status === 'inactive').length,
      completed: announcements.filter(ann => ann.status === 'completed').length
    };
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const tabCounts = getTabCounts();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardLoading count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes Annonces
          </h1>
          <p className="text-gray-600">
            Gérez vos trajets et recevez des demandes de transport
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Annonce</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'Toutes', count: tabCounts.all },
            { key: 'active', label: 'Actives', count: tabCounts.active },
            { key: 'inactive', label: 'Inactives', count: tabCounts.inactive },
            { key: 'completed', label: 'Terminées', count: tabCounts.completed }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'Aucune annonce' : `Aucune annonce ${activeTab}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'all' 
              ? 'Commencez par créer votre première annonce de trajet'
              : `Vous n'avez pas d'annonce ${activeTab} pour le moment`
            }
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Créer ma première annonce
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement._id} className="card hover:shadow-lg transition-shadow">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`badge badge-${getStatusColor(announcement.status)}`}>
                  {getStatusLabel(announcement.status)}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingAnnouncement(announcement)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(announcement)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Route */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {announcement.lieuDepart} → {announcement.destination}
                  </span>
                </div>
                
                {announcement.etapesIntermediaires && announcement.etapesIntermediaires.length > 0 && (
                  <p className="text-xs text-gray-500 ml-6">
                    Via: {announcement.etapesIntermediaires.slice(0, 2).join(', ')}
                    {announcement.etapesIntermediaires.length > 2 && ` +${announcement.etapesIntermediaires.length - 2}`}
                  </p>
                )}
              </div>

              {/* Date and Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(announcement.dateDepart)}</span>
                  {announcement.heureDepart && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>{announcement.heureDepart}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{announcement.typeMarchandise}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {announcement.capaciteDisponible}kg
                  </span>
                </div>
              </div>

              {/* Description Preview */}
              {announcement.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {announcement.description}
                </p>
              )}

              {/* Stats */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      {announcement.demandesCount || 0} demande{(announcement.demandesCount || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-600">
                      {announcement.vuesCount || 0} vue{(announcement.vuesCount || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {announcement.status === 'active' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Publié</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Créer une nouvelle annonce"
        size="large"
      >
        <AnnouncementForm
          onSubmit={handleCreateAnnouncement}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={!!editingAnnouncement}
        onClose={() => setEditingAnnouncement(null)}
        title="Modifier l'annonce"
        size="large"
      >
        {editingAnnouncement && (
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSubmit={handleUpdateAnnouncement}
            onCancel={() => setEditingAnnouncement(null)}
          />
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title="Détails de l'annonce"
        size="large"
      >
        {selectedAnnouncement && (
          <AnnouncementDetails
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
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
  );
};

export default MyAnnouncements;