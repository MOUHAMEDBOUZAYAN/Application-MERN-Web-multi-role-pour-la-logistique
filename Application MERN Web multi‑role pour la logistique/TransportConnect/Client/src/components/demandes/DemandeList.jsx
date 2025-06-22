import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Filter, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Calendar,
  Package,
  User
} from 'lucide-react';
import DemandCard from './DemandCard';
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';

const DemandList = ({ 
  demands = [], 
  loading = false, 
  userRole,
  onDemandClick,
  onAccept,
  onReject,
  onComplete,
  filters = {},
  onFiltersChange,
  viewMode = 'list' // 'grid' or 'list'
}) => {
  const [localViewMode, setLocalViewMode] = useState(viewMode);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedDemands = () => {
    let filtered = [...demands];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(demand => 
        demand.typeColis?.toLowerCase().includes(query) ||
        demand.expediteur?.prenom?.toLowerCase().includes(query) ||
        demand.expediteur?.nom?.toLowerCase().includes(query) ||
        demand.annonce?.lieuDepart?.toLowerCase().includes(query) ||
        demand.annonce?.destination?.toLowerCase().includes(query) ||
        demand.message?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(demand => demand.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'poids':
          aValue = a.poids || 0;
          bValue = b.poids || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dateDepart':
          aValue = new Date(a.annonce?.dateDepart || 0);
          bValue = new Date(b.annonce?.dateDepart || 0);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const processedDemands = filteredAndSortedDemands();

  const getStatusStats = () => {
    return {
      total: demands.length,
      pending: demands.filter(d => d.status === 'pending').length,
      accepted: demands.filter(d => d.status === 'accepted').length,
      rejected: demands.filter(d => d.status === 'rejected').length,
      completed: demands.filter(d => d.status === 'completed').length
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-gray-600">En attente</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
          <p className="text-sm text-gray-600">Acceptées</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          <p className="text-sm text-gray-600">Refusées</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
          <p className="text-sm text-gray-600">Terminées</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une demande..."
              className="input-field pl-10 text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Statut:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Acceptées</option>
                <option value="rejected">Refusées</option>
                <option value="completed">Terminées</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt-desc">Plus récent</option>
                <option value="createdAt-asc">Plus ancien</option>
                <option value="updatedAt-desc">Dernière mise à jour</option>
                <option value="dateDepart-asc">Date de départ (proche)</option>
                <option value="dateDepart-desc">Date de départ (lointaine)</option>
                <option value="poids-desc">Poids (plus lourd)</option>
                <option value="poids-asc">Poids (plus léger)</option>
                <option value="status-asc">Statut A-Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setLocalViewMode('list')}
                className={`p-2 ${
                  localViewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLocalViewMode('grid')}
                className={`p-2 ${
                  localViewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vue grille"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || statusFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filtres actifs:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  Recherche: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {statusFilter && (
                <span className={`inline-flex items-center px-2 py-1 text-sm rounded-full bg-${getStatusColor(statusFilter)}-100 text-${getStatusColor(statusFilter)}-800`}>
                  Statut: {getStatusLabel(statusFilter)}
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`ml-1 text-${getStatusColor(statusFilter)}-600 hover:text-${getStatusColor(statusFilter)}-800`}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {processedDemands.length} demande{processedDemands.length !== 1 ? 's' : ''} trouvée{processedDemands.length !== 1 ? 's' : ''}
          {searchQuery && ` pour "${searchQuery}"`}
        </p>
        
        {processedDemands.length !== demands.length && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
            }}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Afficher toutes les demandes ({demands.length})
          </button>
        )}
      </div>

      {/* Demands List/Grid */}
      {processedDemands.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune demande trouvée
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter
              ? `Aucun résultat pour les critères sélectionnés.`
              : userRole === 'conducteur'
                ? 'Vous n\'avez pas encore reçu de demandes pour vos annonces.'
                : 'Vous n\'avez pas encore envoyé de demandes.'
            }
          </p>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="btn-primary"
            >
              Voir toutes les demandes
            </button>
          )}
        </div>
      ) : (
        <div className={
          localViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
            : 'space-y-4'
        }>
          {processedDemands.map((demand) => (
            <DemandCard
              key={demand._id}
              demand={demand}
              userRole={userRole}
              onAccept={() => onAccept?.(demand._id)}
              onReject={() => onReject?.(demand._id)}
              onComplete={() => onComplete?.(demand._id)}
              onViewDetails={() => onDemandClick?.(demand)}
              variant={localViewMode === 'grid' ? 'default' : 'compact'}
            />
          ))}
        </div>
      )}

      {/* Load More Button (if pagination is needed) */}
      {processedDemands.length > 0 && processedDemands.length % 10 === 0 && (
        <div className="text-center pt-6">
          <button className="btn-secondary">
            Charger plus de demandes
          </button>
        </div>
      )}

      {/* Quick Actions for Conductors */}
      {userRole === 'conducteur' && stats.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">
                {stats.pending} demande{stats.pending > 1 ? 's' : ''} en attente
              </h4>
              <p className="text-sm text-yellow-700">
                N'oubliez pas de répondre rapidement aux demandes pour maintenir votre réputation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandList;