import React, { useState, useEffect } from 'react';
import { annonceAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Package,
  Truck,
  Star,
  Clock,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { CITIES, CARGO_TYPES } from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import Loading, { CardLoading } from '../components/common/Loading';
import AnnonceCard from '../components/annonces/AnnonceCard';
import AnnonceDetails from '../components/annonces/AnnonceDetails';
import Modal from '../components/common/Modal';

const Announcements = () => {
  const { user, isSender } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    lieuDepart: '',
    destination: '',
    dateDepart: '',
    typeMarchandise: '',
    capaciteMin: '',
    capaciteMax: '',
    sortBy: 'dateDepart',
    sortOrder: 'asc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async (searchFilters = {}) => {
    try {
      setSearchLoading(true);
      const params = {
        ...filters,
        ...searchFilters,
        status: 'active',
        limit: 20
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await annonceAPI.search(params);
      setAnnouncements(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchFilters = {};
    
    if (searchQuery.trim()) {
      searchFilters.search = searchQuery.trim();
    }
    
    loadAnnouncements(searchFilters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadAnnouncements();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      lieuDepart: '',
      destination: '',
      dateDepart: '',
      typeMarchandise: '',
      capaciteMin: '',
      capaciteMax: '',
      sortBy: 'dateDepart',
      sortOrder: 'asc'
    });
    setSearchQuery('');
    loadAnnouncements({});
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <CardLoading count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rechercher un Transport
        </h1>
        <p className="text-gray-600">
          Trouvez le trajet parfait pour vos envois parmi {announcements.length} annonces disponibles
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par ville, type de marchandise..."
                className="input-field pl-10"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="btn-primary"
            >
              {searchLoading ? <Loading size="small" /> : 'Rechercher'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* Departure City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville de départ
                </label>
                <select
                  value={filters.lieuDepart}
                  onChange={(e) => handleFilterChange('lieuDepart', e.target.value)}
                  className="input-field"
                >
                  <option value="">Toutes les villes</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <select
                  value={filters.destination}
                  onChange={(e) => handleFilterChange('destination', e.target.value)}
                  className="input-field"
                >
                  <option value="">Toutes les villes</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de départ
                </label>
                <input
                  type="date"
                  value={filters.dateDepart}
                  onChange={(e) => handleFilterChange('dateDepart', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              {/* Cargo Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de marchandise
                </label>
                <select
                  value={filters.typeMarchandise}
                  onChange={(e) => handleFilterChange('typeMarchandise', e.target.value)}
                  className="input-field"
                >
                  <option value="">Tous les types</option>
                  {CARGO_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Capacity Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité min (kg)
                </label>
                <input
                  type="number"
                  value={filters.capaciteMin}
                  onChange={(e) => handleFilterChange('capaciteMin', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité max (kg)
                </label>
                <input
                  type="number"
                  value={filters.capaciteMax}
                  onChange={(e) => handleFilterChange('capaciteMax', e.target.value)}
                  placeholder="1000"
                  min="0"
                  className="input-field"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-field"
                >
                  <option value="dateDepart">Date de départ</option>
                  <option value="capaciteDisponible">Capacité</option>
                  <option value="createdAt">Plus récent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="input-field"
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Effacer tout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {searchLoading ? (
          <CardLoading count={6} />
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou vos filtres
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {announcements.length} annonce{announcements.length > 1 ? 's' : ''} trouvée{announcements.length > 1 ? 's' : ''}
              </h2>
              
              {/* Quick Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trier:</span>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                    loadAnnouncements();
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="dateDepart-asc">Date (Plus tôt)</option>
                  <option value="dateDepart-desc">Date (Plus tard)</option>
                  <option value="capaciteDisponible-desc">Capacité (Plus élevée)</option>
                  <option value="capaciteDisponible-asc">Capacité (Plus faible)</option>
                  <option value="createdAt-desc">Plus récent</option>
                </select>
              </div>
            </div>

            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <AnnonceCard
                  key={announcement._id}
                  announcement={announcement}
                  onClick={() => handleAnnouncementClick(announcement)}
                  showActions={isSender()}
                />
              ))}
            </div>
          </>
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
          <AnnonceDetails
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Announcements;