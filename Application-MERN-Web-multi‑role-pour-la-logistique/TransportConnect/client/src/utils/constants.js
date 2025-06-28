// src/utils/constants.js

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'admin',
  CONDUCTEUR: 'conducteur',
  EXPEDITEUR: 'expediteur',
};

// Statuts des annonces
export const ANNONCE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETE: 'complete',
  ANNULEE: 'annulee',
  SUSPENDUE: 'suspendue',
};

// Statuts des demandes
export const DEMANDE_STATUS = {
  EN_ATTENTE: 'en_attente',
  ACCEPTEE: 'acceptee',
  REFUSEE: 'refusee',
  EN_COURS: 'en_cours',
  ENLEVEE: 'enlevee',
  EN_TRANSIT: 'en_transit',
  LIVREE: 'livree',
  ANNULEE: 'annulee',
  LITIGE: 'litige',
};

// Labels pour les statuts des demandes
export const DEMANDE_STATUS_LABELS = {
  [DEMANDE_STATUS.EN_ATTENTE]: 'En attente',
  [DEMANDE_STATUS.ACCEPTEE]: 'Acceptée',
  [DEMANDE_STATUS.REFUSEE]: 'Refusée',
  [DEMANDE_STATUS.EN_COURS]: 'En cours',
  [DEMANDE_STATUS.ENLEVEE]: 'Enlevée',
  [DEMANDE_STATUS.EN_TRANSIT]: 'En transit',
  [DEMANDE_STATUS.LIVREE]: 'Livrée',
  [DEMANDE_STATUS.ANNULEE]: 'Annulée',
  [DEMANDE_STATUS.LITIGE]: 'Litige',
};

// Couleurs pour les statuts des demandes
export const DEMANDE_STATUS_COLORS = {
  [DEMANDE_STATUS.EN_ATTENTE]: 'warning',
  [DEMANDE_STATUS.ACCEPTEE]: 'success',
  [DEMANDE_STATUS.REFUSEE]: 'danger',
  [DEMANDE_STATUS.EN_COURS]: 'primary',
  [DEMANDE_STATUS.ENLEVEE]: 'primary',
  [DEMANDE_STATUS.EN_TRANSIT]: 'primary',
  [DEMANDE_STATUS.LIVREE]: 'success',
  [DEMANDE_STATUS.ANNULEE]: 'gray',
  [DEMANDE_STATUS.LITIGE]: 'danger',
};

// Types de marchandises
export const MERCHANDISE_TYPES = {
  ELECTROMENAGER: 'electromenager',
  MOBILIER: 'mobilier',
  VETEMENTS: 'vetements',
  ALIMENTATION: 'alimentation',
  ELECTRONIQUE: 'electronique',
  DOCUMENTS: 'documents',
  MEDICAMENTS: 'medicaments',
  FRAGILE: 'fragile',
  PRODUITS_CHIMIQUES: 'produits_chimiques',
  MATERIAUX_CONSTRUCTION: 'materiaux_construction',
  AUTRE: 'autre',
};

// Tableau des types de marchandises pour les formulaires
export const CARGO_TYPES = Object.values(MERCHANDISE_TYPES);

// Labels pour les types de marchandises
export const MERCHANDISE_TYPE_LABELS = {
  [MERCHANDISE_TYPES.ELECTROMENAGER]: 'Électroménager',
  [MERCHANDISE_TYPES.MOBILIER]: 'Mobilier',
  [MERCHANDISE_TYPES.VETEMENTS]: 'Vêtements',
  [MERCHANDISE_TYPES.ALIMENTATION]: 'Alimentation',
  [MERCHANDISE_TYPES.ELECTRONIQUE]: 'Électronique',
  [MERCHANDISE_TYPES.DOCUMENTS]: 'Documents',
  [MERCHANDISE_TYPES.MEDICAMENTS]: 'Médicaments',
  [MERCHANDISE_TYPES.FRAGILE]: 'Fragile',
  [MERCHANDISE_TYPES.PRODUITS_CHIMIQUES]: 'Produits chimiques',
  [MERCHANDISE_TYPES.MATERIAUX_CONSTRUCTION]: 'Matériaux de construction',
  [MERCHANDISE_TYPES.AUTRE]: 'Autre',
};

// Types de véhicules
export const VEHICLE_TYPES = {
  CAMIONNETTE: 'camionnette',
  CAMION: 'camion',
  FOURGON: 'fourgon',
  VOITURE: 'voiture',
  MOTO: 'moto',
};

// Labels pour les types de véhicules
export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.CAMIONNETTE]: 'Camionnette',
  [VEHICLE_TYPES.CAMION]: 'Camion',
  [VEHICLE_TYPES.FOURGON]: 'Fourgon',
  [VEHICLE_TYPES.VOITURE]: 'Voiture',
  [VEHICLE_TYPES.MOTO]: 'Moto',
};

// Types de tarification
export const PRICING_TYPES = {
  PAR_KG: 'par_kg',
  PRIX_FIXE: 'prix_fixe',
  NEGOCIABLE: 'negociable',
};

// Labels pour les types de tarification
export const PRICING_TYPE_LABELS = {
  [PRICING_TYPES.PAR_KG]: 'Par kilogramme',
  [PRICING_TYPES.PRIX_FIXE]: 'Prix fixe',
  [PRICING_TYPES.NEGOCIABLE]: 'Négociable',
};

// Méthodes de paiement
export const PAYMENT_METHODS = {
  ESPECES: 'especes',
  VIREMENT: 'virement',
  PAYPAL: 'paypal',
  CARTE_BANCAIRE: 'carte_bancaire',
};

// Labels pour les méthodes de paiement
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.ESPECES]: 'Espèces',
  [PAYMENT_METHODS.VIREMENT]: 'Virement bancaire',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.CARTE_BANCAIRE]: 'Carte bancaire',
};

// Types de badges
export const BADGE_TYPES = {
  VERIFIE: 'verifie',
  CONDUCTEUR_EXPERIMENTE: 'conducteur_experimente',
  EXPEDITEUR_FIABLE: 'expediteur_fiable',
};

// Labels et couleurs pour les badges
export const BADGE_CONFIG = {
  [BADGE_TYPES.VERIFIE]: {
    label: 'Vérifié',
    color: 'success',
    icon: '✓',
  },
  [BADGE_TYPES.CONDUCTEUR_EXPERIMENTE]: {
    label: 'Conducteur expérimenté',
    color: 'primary',
    icon: '⭐',
  },
  [BADGE_TYPES.EXPEDITEUR_FIABLE]: {
    label: 'Expéditeur fiable',
    color: 'warning',
    icon: '🏆',
  },
};

// Villes principales du Maroc
export const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Fès',
  'Marrakech',
  'Agadir',
  'Tanger',
  'Meknès',
  'Oujda',
  'Kenitra',
  'Tétouan',
  'Safi',
  'Mohammedia',
  'Khouribga',
  'El Jadida',
  'Béni Mellal',
  'Nador',
  'Taza',
  'Settat',
  'Berrechid',
  'Khemisset',
  'Inezgane',
  'Ksar El Kebir',
  'Larache',
  'Guelmim',
  'Errachidia',
  'Ouarzazate',
  'Tiznit',
  'Taroudant',
  'Sidi Kacem',
  'Khenifra',
];

// Alias CITIES pour MOROCCAN_CITIES
export const CITIES = MOROCCAN_CITIES;

// Configuration de pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_SIZE: 100,
};

// Configuration des messages
export const MESSAGE_CONFIG = {
  MAX_LENGTH: 1000,
  TYPING_TIMEOUT: 3000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};

// Configuration des notifications
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Configuration des évaluations
export const EVALUATION_CONFIG = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  RATING_STEP: 0.5,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 500,
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ANNONCES: '/annonces',
  MES_ANNONCES: '/mes-annonces',
  DEMANDES: '/demandes',
  EVALUATIONS: '/evaluations',
  CHAT: '/chat',
  ADMIN: '/admin',
  SUIVI: '/suivi',
};

// Configuration des formulaires
export const FORM_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^(\+212|0)[5-7][0-9]{8}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSTAL_CODE_PATTERN: /^[0-9]{5}$/,
};

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est requis',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} caractères`,
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  UNAUTHORIZED: 'Accès non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
};

// Configuration locale (Maroc)
export const LOCALE_CONFIG = {
  CURRENCY: 'MAD',
  CURRENCY_SYMBOL: 'DH',
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIMEZONE: 'Africa/Casablanca',
  LANGUAGE: 'fr-MA',
};

// Clés de stockage local utilisées dans l'app
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Événements socket utilisés dans l'app
export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  NOTIFICATION: 'notification',
};

export default {
  USER_ROLES,
  ANNONCE_STATUS,
  DEMANDE_STATUS,
  DEMANDE_STATUS_LABELS,
  DEMANDE_STATUS_COLORS,
  MERCHANDISE_TYPES,
  MERCHANDISE_TYPE_LABELS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  PRICING_TYPES,
  PRICING_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  BADGE_TYPES,
  BADGE_CONFIG,
  MOROCCAN_CITIES,
  CITIES,
  PAGINATION,
  MESSAGE_CONFIG,
  NOTIFICATION_TYPES,
  EVALUATION_CONFIG,
  ROUTES,
  FORM_VALIDATION,
  ERROR_MESSAGES,
  LOCALE_CONFIG,
  STORAGE_KEYS,
  SOCKET_EVENTS,
  CARGO_TYPES,
};