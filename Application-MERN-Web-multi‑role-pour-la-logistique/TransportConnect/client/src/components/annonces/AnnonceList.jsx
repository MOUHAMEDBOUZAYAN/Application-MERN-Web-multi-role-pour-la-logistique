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
  Package,
  TrendingUp,
  Eye,
  Users,
  Clock,
  Zap,
  Star,
  ArrowUpDown,
  Layers,
  BarChart3
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
  viewMode = 'grid'
}) => {
  const [localViewMode, setLocalViewMode] = useState(viewMode);
  const [sortBy, setSortBy] = useState('dateDepart');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStats = () => {
    const now = new Date();
    const urgent = announcements.filter(a => {
      const hoursUntil = (new Date(a.dateDepart) - now) / (1000 * 60 * 60);
      return hoursUntil <= 24;
    }).length;
    
    const available = announcements.filter(a => a.status === 'active').length;
    const avgRating = announcements.reduce((sum, a) => sum + (a.conducteur?.rating || 0), 0) / announcements.length || 0;
    
    return { urgent, available, avgRating: avgRating.toFixed(1) };
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
        case 'rating':
          aValue = a.conducteur?.rating || 0;
          bValue = b.conducteur?.rating || 0;
          break;
        case 'distance':
          aValue = a.distance || 0;
          bValue = b.distance || 0;
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
  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  🚚 Transports Disponibles
                </h2>
                <p className="text-blue-100 text-lg">
                  Découvrez {announcements.length} options de transport professionnelles
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-blue-100">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Mis à jour en temps réel</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Package className="h-5 w-5 text-emerald-300" />
                  <span className="text-emerald-100 text-sm font-medium">Disponibles</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.available}</div>
                <div className="text-blue-200 text-xs">Trajets actifs</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-300" />
                  <span className="text-orange-100 text-sm font-medium">Urgents</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.urgent}</div>
                <div className="text-blue-200 text-xs">Départ sous 24h</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="text-yellow-100 text-sm font-medium">Note moyenne</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
                <div className="text-blue-200 text-xs">Satisfaction client</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-purple-300" />
                  <span className="text-purple-100 text-sm font-medium">Conducteurs</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {new Set(announcements.map(a => a.conducteur?._id)).size}
                </div>
                <div className="text-blue-200 text-xs">Professionnels</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex flex-col space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherchez par ville, conducteur, type de marchandise..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Trier par:</span>
              </span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
              >
                <option value="dateDepart-asc">📅 Date (Plus tôt)</option>
                <option value="dateDepart-desc">📅 Date (Plus tard)</option>
                <option value="capaciteDisponible-desc">⚖️ Capacité (Plus élevée)</option>
                <option value="capaciteDisponible-asc">⚖️ Capacité (Plus faible)</option>
                <option value="prix-asc">💰 Prix (Moins cher)</option>
                <option value="prix-desc">💰 Prix (Plus cher)</option>
                <option value="rating-desc">⭐ Mieux notés</option>
                <option value="distance-asc">📏 Distance (Plus court)</option>
                <option value="createdAt-desc">🆕 Plus récent</option>
              </select>
            </div>

            {/* View Mode and Advanced Filters */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  showAdvancedFilters
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtres avancés</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setLocalViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    localViewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLocalViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    localViewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLocalViewMode('compact')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    localViewMode === 'compact' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue compacte"
                >
                  <Layers className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Date limite</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Package className="h-4 w-4 text-purple-500" />
                    <span>Poids minimum</span>
                  </label>
                  <input
                    type="number"
                    placeholder="kg"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Note minimum</span>
                  </label>
                  <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300">
                    <option value="">Toutes les notes</option>
                    <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                    <option value="4.0">4.0+ ⭐⭐⭐⭐</option>
                    <option value="3.5">3.5+ ⭐⭐⭐</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span>Urgence</span>
                  </label>
                  <select className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300">
                    <option value="">Tous les délais</option>
                    <option value="urgent">🚨 Urgent (24h)</option>
                    <option value="soon">⏰ Bientôt (72h)</option>
                    <option value="planned">📅 Planifié (+72h)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Appliquer les filtres
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold transition-all duration-200">
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchQuery || Object.values(filters).some(v => v)) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtres actifs:</span>
                </span>
                
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm rounded-full border border-blue-200">
                    🔍 "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}

                {filters?.lieuDepart && (
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full border border-emerald-200">
                    <MapPin className="h-3 w-3 mr-1" />
                    Départ: {filters.lieuDepart}
                  </span>
                )}

                {filters?.destination && (
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200">
                    <MapPin className="h-3 w-3 mr-1" />
                    Destination: {filters.destination}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎯 {processedAnnouncements.length} résultat{processedAnnouncements.length !== 1 ? 's' : ''} trouvé{processedAnnouncements.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `Résultats pour "${searchQuery}"`
                : 'Tous les transports disponibles'
              }
            </p>
          </div>
          
          {processedAnnouncements.length !== announcements.length && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 lg:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
            >
              Voir tout ({announcements.length})
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {processedAnnouncements.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 text-center py-16 px-8">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun transport trouvé
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés ou modifiez vos filtres.`
                : 'Il n\'y a pas de transports correspondant à vos critères actuels.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Voir tous les transports
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={
          localViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
            : localViewMode === 'compact'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
        }>
          {processedAnnouncements.map((announcement, index) => (
            <div
              key={announcement._id}
              className="group"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <AnnouncementCard
                announcement={announcement}
                onClick={() => onAnnouncementClick?.(announcement)}
                showActions={showActions}
                variant={localViewMode === 'compact' ? 'compact' : 'default'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Section */}
      {processedAnnouncements.length > 0 && processedAnnouncements.length >= 12 && (
        <div className="text-center pt-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Vous avez vu {processedAnnouncements.length} transports
            </h4>
            <p className="text-gray-600 mb-6">
              Il pourrait y avoir plus d'options disponibles
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Charger plus de transports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;