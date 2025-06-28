import React, { useState, useEffect } from 'react';
import { demandeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import Loading, { CardLoading } from '../components/common/Loading';
import DemandCard from '../components/demandes/DemandeCard';
import DemandDetails from '../components/demandes/DemandDetails';
import Modal, { ConfirmationModal } from '../components/common/Modal';
import toast from 'react-hot-toast';

const Demands = () => {
  const { user, isConductor, isSender } = useAuth();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadDemands();
  }, []);

  const loadDemands = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isConductor()) {
        // Load demands received for conductor's announcements
        response = await demandeAPI.getAll({ conducteur: user._id });
      } else {
        // Load demands sent by the sender
        response = await demandeAPI.getUserDemands();
      }
      
      setDemands(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading demands:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDemand = async (demandId) => {
    try {
      await demandeAPI.accept(demandId);
      setDemands(prev => 
        prev.map(demand => 
          demand._id === demandId 
            ? { ...demand, status: 'accepted' }
            : demand
        )
      );
      toast.success('Demande acceptée avec succès !');
      setActionConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la demande');
    }
  };

  const handleRejectDemand = async (demandId) => {
    try {
      await demandeAPI.reject(demandId);
      setDemands(prev => 
        prev.map(demand => 
          demand._id === demandId 
            ? { ...demand, status: 'rejected' }
            : demand
        )
      );
      toast.success('Demande refusée');
      setActionConfirm(null);
    } catch (error) {
      toast.error('Erreur lors du refus de la demande');
    }
  };

  const handleCompleteDemand = async (demandId) => {
    try {
      await demandeAPI.complete(demandId);
      setDemands(prev => 
        prev.map(demand => 
          demand._id === demandId 
            ? { ...demand, status: 'completed' }
            : demand
        )
      );
      toast.success('Transport marqué comme terminé !');
      setActionConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de la finalisation');
    }
  };

  const getFilteredDemands = () => {
    let filtered = demands;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(demand => demand.status === activeTab);
    }

    // Filter by status dropdown
    if (filterStatus) {
      filtered = filtered.filter(demand => demand.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(demand => 
        demand.typeColis?.toLowerCase().includes(query) ||
        demand.expediteur?.prenom?.toLowerCase().includes(query) ||
        demand.expediteur?.nom?.toLowerCase().includes(query) ||
        demand.annonce?.lieuDepart?.toLowerCase().includes(query) ||
        demand.annonce?.destination?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getTabCounts = () => {
    return {
      all: demands.length,
      pending: demands.filter(d => d.status === 'pending').length,
      accepted: demands.filter(d => d.status === 'accepted').length,
      rejected: demands.filter(d => d.status === 'rejected').length,
      completed: demands.filter(d => d.status === 'completed').length
    };
  };

  const filteredDemands = getFilteredDemands();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isConductor() ? 'Demandes Reçues' : 'Mes Demandes'}
        </h1>
        <p className="text-gray-600">
          {isConductor() 
            ? 'Gérez les demandes de transport pour vos annonces'
            : 'Suivez le statut de vos demandes de transport'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par type de colis, expéditeur, ville..."
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'Toutes', count: tabCounts.all, icon: MessageCircle },
            { key: 'pending', label: 'En attente', count: tabCounts.pending, icon: Clock },
            { key: 'accepted', label: 'Acceptées', count: tabCounts.accepted, icon: CheckCircle },
            { key: 'rejected', label: 'Refusées', count: tabCounts.rejected, icon: XCircle },
            { key: 'completed', label: 'Terminées', count: tabCounts.completed, icon: CheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Demands List */}
      {filteredDemands.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterStatus ? 'Aucun résultat' : 'Aucune demande'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || filterStatus 
              ? 'Essayez de modifier vos critères de recherche'
              : isConductor() 
                ? 'Vous n\'avez pas encore reçu de demandes pour vos annonces'
                : 'Vous n\'avez pas encore envoyé de demandes'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDemands.map((demand) => (
            <DemandCard
              key={demand._id}
              demand={demand}
              userRole={user.role}
              onAccept={() => setActionConfirm({ type: 'accept', demand })}
              onReject={() => setActionConfirm({ type: 'reject', demand })}
              onComplete={() => setActionConfirm({ type: 'complete', demand })}
              onViewDetails={() => setSelectedDemand(demand)}
            />
          ))}
        </div>
      )}

      {/* Demand Details Modal */}
      <Modal
        isOpen={!!selectedDemand}
        onClose={() => setSelectedDemand(null)}
        title="Détails de la demande"
        size="large"
      >
        {selectedDemand && (
          <DemandDetails
            demand={selectedDemand}
            userRole={user.role}
            onAccept={() => setActionConfirm({ type: 'accept', demand: selectedDemand })}
            onReject={() => setActionConfirm({ type: 'reject', demand: selectedDemand })}
            onComplete={() => setActionConfirm({ type: 'complete', demand: selectedDemand })}
            onClose={() => setSelectedDemand(null)}
          />
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setActionConfirm(null)}
          onConfirm={() => {
            switch (actionConfirm.type) {
              case 'accept':
                handleAcceptDemand(actionConfirm.demand._id);
                break;
              case 'reject':
                handleRejectDemand(actionConfirm.demand._id);
                break;
              case 'complete':
                handleCompleteDemand(actionConfirm.demand._id);
                break;
            }
          }}
          title={
            actionConfirm.type === 'accept' ? 'Accepter la demande' :
            actionConfirm.type === 'reject' ? 'Refuser la demande' :
            'Marquer comme terminé'
          }
          message={
            actionConfirm.type === 'accept' 
              ? `Voulez-vous accepter la demande de ${actionConfirm.demand.expediteur.prenom} ${actionConfirm.demand.expediteur.nom} ?`
              : actionConfirm.type === 'reject'
              ? `Voulez-vous refuser la demande de ${actionConfirm.demand.expediteur.prenom} ${actionConfirm.demand.expediteur.nom} ?`
              : 'Confirmer que le transport a été effectué avec succès ?'
          }
          confirmText={
            actionConfirm.type === 'accept' ? 'Accepter' :
            actionConfirm.type === 'reject' ? 'Refuser' :
            'Marquer terminé'
          }
          type={
            actionConfirm.type === 'accept' ? 'info' :
            actionConfirm.type === 'reject' ? 'warning' :
            'info'
          }
        />
      )}
    </div>
  );
};

export default Demands;