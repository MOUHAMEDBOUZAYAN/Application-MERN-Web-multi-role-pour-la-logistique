import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Filter, 
  SortAsc, 
  SortDesc,
  Search,
  MapPin,
  Calendar,
  Package
} from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';
import { formatDate } from '../../utils/helpers';

const AnnouncementList = ({ 
  announcements = [], 
  loading = false, 
  onAnnouncementClick,
  showActions = false,
  filters = {},
  onFiltersChange,
  viewMode = 'grid' // 'grid' or 'list'
}) => {
  const [localViewMode, setLocalViewMode] = useState(viewMode);
  const [sortBy, setSortBy] = useState('dateDepart');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedAnnouncements = () => {
    let filtered = [...announcements];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(announcement => 
        announcement.lieuDepart?.toLowerCase().includes(query) ||
        announcement.destination?.toLowerCase().includes(query) ||
        announcement.typeMarchandise?.toLowerCase().includes(query) ||
        announcement.conducteur?.prenom?.toLowerCase().includes(query) ||
        announcement.conducteur?.nom?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dateDepart':
          aValue = new Date(a.dateDepart);
          bValue = new Date(b.dateDepart);
          break;
        case 'capaciteDisponible':
          aValue = a.capaciteDisponible;
          bValue = b.capaciteDisponible;
          break;
        case 'prix':
          aValue = a.prix || 0;
          bValue = b.prix || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
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

  const processedAnnouncements = filteredAndSortedAnnouncements();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              placeholder="Rechercher une annonce..."
              className="input-field pl-10 text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
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
                <option value="dateDepart-asc">Date (Plus tôt)</option>
                <option value="dateDepart-desc">Date (Plus tard)</option>
                <option value="capaciteDisponible-desc">Capacité (Plus élevée)</option>
                <option value="capaciteDisponible-asc">Capacité (Plus faible)</option>
                <option value="prix-asc">Prix (Moins cher)</option>
                <option value="prix-desc">Prix (Plus cher)</option>
                <option value="createdAt-desc">Plus récent</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
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
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters || searchQuery) && (
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

              {filters?.lieuDepart && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  <MapPin className="h-3 w-3 mr-1" />
                  Départ: {filters.lieuDepart}
                </span>
              )}

              {filters?.destination && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  <MapPin className="h-3 w-3 mr-1" />
                  Destination: {filters.destination}
                </span>
              )}

              {filters?.dateDepart && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  Date: {formatDate(filters.dateDepart)}
                </span>
              )}

              {filters?.typeMarchandise && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  <Package className="h-3 w-3 mr-1" />
                  Type: {filters.typeMarchandise}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {processedAnnouncements.length} annonce{processedAnnouncements.length !== 1 ? 's' : ''} trouvée{processedAnnouncements.length !== 1 ? 's' : ''}
          {searchQuery && ` pour "${searchQuery}"`}
        </p>
        
        {processedAnnouncements.length !== announcements.length && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Afficher toutes les annonces ({announcements.length})
          </button>
        )}
      </div>

      {/* Announcements List/Grid */}
      {processedAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune annonce trouvée
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés.`
              : 'Il n\'y a pas d\'annonces correspondant à vos critères.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary"
            >
              Voir toutes les annonces
            </button>
          )}
        </div>
      ) : (
        <div className={
          localViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {processedAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              onClick={() => onAnnouncementClick?.(announcement)}
              showActions={showActions}
              variant={localViewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Load More Button (if pagination is needed) */}
      {processedAnnouncements.length > 0 && processedAnnouncements.length % 12 === 0 && (
        <div className="text-center pt-6">
          <button className="btn-secondary">
            Charger plus d'annonces
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;