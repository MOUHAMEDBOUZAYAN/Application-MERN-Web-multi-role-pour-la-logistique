// src/utils/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base pour axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'Une erreur est survenue';
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    } else if (error.response?.status === 403) {
      toast.error('Accès refusé');
    } else if (error.response?.status === 404) {
      toast.error('Ressource non trouvée');
    } else if (error.response?.status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Fonctions API pour l'authentification
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { motDePasse: password }),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

// Fonctions API pour les utilisateurs
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}/profile`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadPhoto: (formData) => api.post('/users/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStatistics: (id) => api.get(`/users/${id}/statistiques`),
  searchUsers: (params) => api.get('/users/rechercher', { params }),
  getTopUsers: (params) => api.get('/users/top', { params }),
  getDashboard: () => api.get('/users/dashboard'),
  getNotifications: (params) => api.get('/users/notifications', { params }),
  getHistory: (params) => api.get('/users/historique', { params }),
  deleteAccount: (data) => api.delete('/users/compte', { data }),
};

// Fonctions API pour les annonces
export const annonceAPI = {
  getAll: (params) => api.get('/annonces', { params }),
  getById: (id) => api.get(`/annonces/${id}`),
  create: (data) => api.post('/annonces', data),
  update: (id, data) => api.put(`/annonces/${id}`, data),
  delete: (id) => api.delete(`/annonces/${id}`),
  search: (params) => api.get('/annonces/rechercher', { params }),
  getMine: (params) => api.get('/annonces/mes-annonces/liste', { params }),
  getUserAnnouncements: (params) => api.get('/annonces/mes-annonces/liste', { params }),
  addComment: (id, comment) => api.post(`/annonces/${id}/commentaires`, { message: comment }),
  getStatistics: () => api.get('/annonces/statistiques'),
};

// Fonctions API pour les demandes
export const demandeAPI = {
  create: (data) => api.post('/demandes', data),
  getById: (id) => api.get(`/demandes/${id}`),
  getMineAsExpediteur: (params) => api.get('/demandes/expediteur/mes-demandes', { params }),
  getMineAsConducteur: (params) => api.get('/demandes/conducteur/demandes-recues', { params }),
  respond: (id, response) => api.put(`/demandes/${id}/reponse`, response),
  updateStatus: (id, data) => api.put(`/demandes/${id}/statut`, data),
  cancel: (id, reason) => api.put(`/demandes/${id}/annuler`, { motif: reason }),
  addCommunication: (id, data) => api.post(`/demandes/${id}/communications`, data),
  updatePosition: (id, data) => api.put(`/demandes/${id}/position`, data),
  track: (trackingNumber) => api.get(`/demandes/suivi/${trackingNumber}`),
  reportDispute: (id, reason) => api.post(`/demandes/${id}/litige`, { motif: reason }),
};

// Fonctions API pour les évaluations
export const evaluationAPI = {
  create: (data) => api.post('/evaluations', data),
  getById: (id) => api.get(`/evaluations/${id}`),
  getByUser: (userId, params) => api.get(`/evaluations/utilisateur/${userId}`, { params }),
  getMine: (params) => api.get('/evaluations/mes-evaluations/donnees', { params }),
  canEvaluate: (demandeId) => api.get(`/evaluations/peut-evaluer/${demandeId}`),
  respond: (id, response) => api.post(`/evaluations/${id}/reponse`, { commentaire: response }),
  markUseful: (id) => api.post(`/evaluations/${id}/utile`),
  report: (id, reason) => api.post(`/evaluations/${id}/signaler`, { motif: reason }),
  search: (params) => api.get('/evaluations/rechercher', { params }),
  getSummary: (userId) => api.get(`/evaluations/resume/${userId}`),
};

// Fonctions API pour les messages
export const messageAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (expediteurId, destinataireId, annonceId, params) => 
    api.get(`/messages/conversation/${expediteurId}/${destinataireId}/${annonceId}`, { params }),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/lu`),
  markConversationAsRead: (expediteurId, destinataireId, annonceId) => 
    api.put(`/messages/conversation/${expediteurId}/${destinataireId}/${annonceId}/lu`),
  addReaction: (id, emoji) => api.post(`/messages/${id}/reaction`, { emoji }),
  removeReaction: (id) => api.delete(`/messages/${id}/reaction`),
  search: (params) => api.get('/messages/rechercher', { params }),
  getUnreadCount: () => api.get('/messages/non-lus/count'),
  getStatistics: (params) => api.get('/messages/statistiques', { params }),
};

// Fonctions API pour l'administration
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getMetrics: () => api.get('/admin/metriques'),
  
  // Gestion des utilisateurs
  getUsers: (params) => api.get('/admin/utilisateurs', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/utilisateurs/${id}/statut`, data),
  manageBadge: (id, data) => api.put(`/admin/utilisateurs/${id}/badges`, data),
  createAdmin: (data) => api.post('/admin/utilisateurs/admin', data),
  
  // Gestion des annonces
  getAnnonces: (params) => api.get('/admin/annonces', { params }),
  updateAnnonceStatus: (id, data) => api.put(`/admin/annonces/${id}/statut`, data),
  deleteAnnonce: (id, reason) => api.delete(`/admin/annonces/${id}`, { data: { raison: reason } }),
  
  // Gestion des demandes et litiges
  getDemandes: (params) => api.get('/admin/demandes', { params }),
  getDisputes: (params) => api.get('/admin/litiges', { params }),
  resolveDispute: (id, data) => api.put(`/admin/demandes/${id}/resoudre-litige`, data),
  
  // Logs et export
  getLogs: (params) => api.get('/admin/logs', { params }),
  exportData: (type, params) => api.get(`/admin/export/${type}`, { params }),
};

export default api;