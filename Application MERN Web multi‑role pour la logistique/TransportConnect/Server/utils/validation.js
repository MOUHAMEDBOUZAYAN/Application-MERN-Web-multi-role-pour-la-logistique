// backend/utils/validation.js
const mongoose = require('mongoose');

/**
 * Valide si une chaîne est un ObjectId MongoDB valide
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Valide un numéro de téléphone marocain
 */
const isValidMoroccanPhone = (phone) => {
  const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Valide un email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide la force d'un mot de passe
 */
const validatePasswordStrength = (password) => {
  const criteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(criteria).filter(Boolean).length;
  
  return {
    isValid: score >= 4,
    score: score,
    criteria: criteria,
    strength: score < 3 ? 'faible' : score < 5 ? 'moyen' : 'fort'
  };
};

/**
 * Valide les dimensions d'un colis
 */
const validatePackageDimensions = (dimensions) => {
  const { longueur, largeur, hauteur } = dimensions;
  
  if (!longueur || !largeur || !hauteur) {
    return {
      isValid: false,
      message: 'Toutes les dimensions sont requises'
    };
  }
  
  if (longueur <= 0 || largeur <= 0 || hauteur <= 0) {
    return {
      isValid: false,
      message: 'Les dimensions doivent être positives'
    };
  }
  
  const volume = longueur * largeur * hauteur;
  const maxVolume = 1000000; // 1m³ en cm³
  
  if (volume > maxVolume) {
    return {
      isValid: false,
      message: `Volume trop important (max: ${maxVolume / 1000000}m³)`
    };
  }
  
  return {
    isValid: true,
    volume: volume
  };
};

/**
 * Valide une adresse
 */
const validateAddress = (address) => {
  const requiredFields = ['nom', 'telephone', 'adresse', 'ville', 'codePostal'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!address[field] || address[field].trim() === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields: missingFields,
      message: `Champs manquants: ${missingFields.join(', ')}`
    };
  }
  
  // Valider le téléphone
  if (!isValidMoroccanPhone(address.telephone)) {
    return {
      isValid: false,
      message: 'Numéro de téléphone invalide'
    };
  }
  
  // Valider le code postal (5 chiffres)
  if (!/^\d{5}$/.test(address.codePostal)) {
    return {
      isValid: false,
      message: 'Code postal invalide (5 chiffres requis)'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide une note d'évaluation
 */
const validateRating = (rating) => {
  const numRating = parseFloat(rating);
  
  if (isNaN(numRating)) {
    return {
      isValid: false,
      message: 'La note doit être un nombre'
    };
  }
  
  if (numRating < 1 || numRating > 5) {
    return {
      isValid: false,
      message: 'La note doit être entre 1 et 5'
    };
  }
  
  // Vérifier que c'est un entier ou demi-point
  if ((numRating * 2) % 1 !== 0) {
    return {
      isValid: false,
      message: 'Seules les notes entières et demi-points sont autorisées'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide une date de départ
 */
const validateDepartureDate = (date) => {
  const departureDate = new Date(date);
  const now = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(now.getFullYear() + 1); // Maximum 1 an dans le futur
  
  if (isNaN(departureDate.getTime())) {
    return {
      isValid: false,
      message: 'Date invalide'
    };
  }
  
  if (departureDate <= now) {
    return {
      isValid: false,
      message: 'La date de départ doit être dans le futur'
    };
  }
  
  if (departureDate > maxFutureDate) {
    return {
      isValid: false,
      message: 'La date de départ ne peut pas être à plus d\'un an'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide les coordonnées GPS
 */
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      message: 'Les coordonnées doivent être des nombres'
    };
  }
  
  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      message: 'La latitude doit être entre -90 et 90'
    };
  }
  
  if (lng < -180 || lng > 180) {
    return {
      isValid: false,
      message: 'La longitude doit être entre -180 et 180'
    };
  }
  
  return { isValid: true };
};

/**
 * Nettoie et valide un commentaire
 */
const validateAndCleanComment = (comment, minLength = 10, maxLength = 500) => {
  
  const cleaned = comment.trim();
  
  if (cleaned.length < minLength) {
    return {
      isValid: false,
      message: `Le commentaire doit contenir au moins ${minLength} caractères`
    };
  }
  
  if (cleaned.length > maxLength) {
    return {
      isValid: false,
      message: `Le commentaire ne peut pas dépasser ${maxLength} caractères`
    };
  }
  
  // Vérifier qu'il ne contient pas que des espaces ou caractères spéciaux
  if (!/[a-zA-ZàáâäçéèêëïîôùûüÿñæœÀÁÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ]/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Le commentaire doit contenir du texte significatif'
    };
  }
  
  return {
    isValid: true,
    cleaned: cleaned
  };
};

/**
 * Valide un montant financier
 */
const validateAmount = (amount, min = 0.1, max = 100000) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return {
      isValid: false,
      message: 'Le montant doit être un nombre'
    };
  }
  
  if (numAmount < min) {
    return {
      isValid: false,
      message: `Le montant minimum est ${min} MAD`
    };
  }
  
  if (numAmount > max) {
    return {
      isValid: false,
      message: `Le montant maximum est ${max} MAD`
    };
  }
  
  // Vérifier que c'est un montant raisonnable (max 2 décimales)
  if ((numAmount * 100) % 1 !== 0) {
    return {
      isValid: false,
      message: 'Le montant ne peut avoir que 2 décimales maximum'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide une liste de tags/types
 */
const validateTags = (tags, validTags) => {
  if (!Array.isArray(tags)) {
    return {
      isValid: false,
      message: 'Les tags doivent être un tableau'
    };
  }
  
  if (tags.length === 0) {
    return {
      isValid: false,
      message: 'Au moins un tag est requis'
    };
  }
  
  const invalidTags = tags.filter(tag => !validTags.includes(tag));
  
  if (invalidTags.length > 0) {
    return {
      isValid: false,
      message: `Tags invalides: ${invalidTags.join(', ')}`,
      invalidTags: invalidTags
    };
  }
  
  return { isValid: true };
};

/**
 * Valide un nom de fichier et son extension
 */
const validateFileName = (filename, allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf']) => {
  if (typeof filename !== 'string' || filename.trim() === '') {
    return {
      isValid: false,
      message: 'Nom de fichier invalide'
    };
  }
  
  const extension = filename.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      message: `Extension non autorisée. Extensions valides: ${allowedExtensions.join(', ')}`
    };
  }
  
  // Vérifier les caractères dangereux
  if (/[<>:"/\\|?*]/.test(filename)) {
    return {
      isValid: false,
      message: 'Le nom de fichier contient des caractères non autorisés'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide une URL
 */
const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Vérifier le protocole
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        message: 'Seuls les protocoles HTTP et HTTPS sont autorisés'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: 'URL invalide'
    };
  }
};

/**
 * Sanitise une chaîne de caractères (supprime HTML/scripts)
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer scripts
    .replace(/<[^>]*>/g, '') // Supprimer tags HTML
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+\s*=/gi, '') // Supprimer handlers d'événements
    .trim();
};

/**
 * Valide les types de marchandise
 */
const validateMerchandiseTypes = (types) => {
  const validTypes = [
    'electromenager',
    'mobilier',
    'vetements',
    'alimentation',
    'electronique',
    'documents',
    'medicaments',
    'fragile',
    'produits_chimiques',
    'materiaux_construction',
    'autre'
  ];
  
  return validateTags(types, validTypes);
};

/**
 * Valide les méthodes de paiement
 */
const validatePaymentMethods = (methods) => {
  const validMethods = ['especes', 'virement', 'paypal', 'carte_bancaire'];
  return validateTags(methods, validMethods);
};

/**
 * Valide les types de véhicule
 */
const validateVehicleType = (type) => {
  const validTypes = ['camionnette', 'camion', 'fourgon', 'voiture', 'moto'];
  
  if (!validTypes.includes(type)) {
    return {
      isValid: false,
      message: `Type de véhicule invalide. Types valides: ${validTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Valide un code postal marocain
 */
const validateMoroccanPostalCode = (postalCode) => {
  const postalCodeRegex = /^[0-9]{5}$/;
  
  if (!postalCodeRegex.test(postalCode)) {
    return {
      isValid: false,
      message: 'Code postal invalide (5 chiffres requis)'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide une plage de dates
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      message: 'Dates invalides'
    };
  }
  
  if (start >= end) {
    return {
      isValid: false,
      message: 'La date de début doit être antérieure à la date de fin'
    };
  }
  
  if (start < now) {
    return {
      isValid: false,
      message: 'La date de début ne peut pas être dans le passé'
    };
  }
  
  // Limiter à 1 an maximum
  const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
  if (end - start > maxDuration) {
    return {
      isValid: false,
      message: 'La plage de dates ne peut pas dépasser 1 an'
    };
  }
  
  return { isValid: true };
};

/**
 * Valide les paramètres de pagination
 */
const validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return {
      isValid: false,
      message: 'Le numéro de page doit être un entier positif'
    };
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return {
      isValid: false,
      message: 'La limite doit être entre 1 et 100'
    };
  }
  
  return {
    isValid: true,
    page: pageNum,
    limit: limitNum
  };
};

/**
 * Valide et nettoie les données d'entrée d'un objet selon un schéma
 */
const validateAndCleanObject = (obj, schema) => {
  const cleaned = {};
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    
    // Vérifier si le champ est requis
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} est requis`);
      continue;
    }
    
    // Si optionnel et vide, passer
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Appliquer les validations
    let processedValue = value;
    
    if (rules.type === 'string') {
      processedValue = sanitizeString(value);
      if (rules.minLength && processedValue.length < rules.minLength) {
        errors.push(`${key} doit contenir au moins ${rules.minLength} caractères`);
      }
      if (rules.maxLength && processedValue.length > rules.maxLength) {
        errors.push(`${key} ne peut pas dépasser ${rules.maxLength} caractères`);
      }
    }
    
    if (rules.type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        errors.push(`${key} doit être un nombre`);
        continue;
      }
      if (rules.min !== undefined && processedValue < rules.min) {
        errors.push(`${key} doit être supérieur ou égal à ${rules.min}`);
      }
      if (rules.max !== undefined && processedValue > rules.max) {
        errors.push(`${key} doit être inférieur ou égal à ${rules.max}`);
      }
    }
    
    if (rules.type === 'email' && !isValidEmail(processedValue)) {
      errors.push(`${key} doit être un email valide`);
    }
    
    if (rules.type === 'phone' && !isValidMoroccanPhone(processedValue)) {
      errors.push(`${key} doit être un numéro de téléphone marocain valide`);
    }
    
    if (rules.enum && !rules.enum.includes(processedValue)) {
      errors.push(`${key} doit être l'une des valeurs: ${rules.enum.join(', ')}`);
    }
    
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(processedValue);
      if (!customResult.isValid) {
        errors.push(`${key}: ${customResult.message}`);
      }
    }
    
    cleaned[key] = processedValue;
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    cleaned: cleaned
  };
};

/**
 * Schémas de validation prédéfinis
 */
const validationSchemas = {
  user: {
    nom: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    prenom: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    email: { type: 'email', required: true },
    telephone: { type: 'phone', required: true },
    role: { enum: ['conducteur', 'expediteur'], required: true }
  },
  
  annonce: {
    titre: { type: 'string', required: true, minLength: 10, maxLength: 100 },
    description: { type: 'string', required: false, maxLength: 500 },
    'trajet.depart.ville': { type: 'string', required: true, minLength: 2, maxLength: 50 },
    'trajet.destination.ville': { type: 'string', required: true, minLength: 2, maxLength: 50 },
    'capacite.poidsMax': { type: 'number', required: true, min: 0.1, max: 10000 },
    'tarification.typeTarification': { enum: ['par_kg', 'prix_fixe', 'negociable'], required: true }
  },
  
  demande: {
    'colis.description': { type: 'string', required: true, minLength: 10, maxLength: 500 },
    'colis.poids': { type: 'number', required: true, min: 0.1, max: 10000 },
    'tarification.montantPropose': { type: 'number', required: true, min: 0.1 },
    'tarification.methodePaiement': { enum: ['especes', 'virement', 'paypal', 'carte_bancaire'], required: true }
  },
  
  evaluation: {
    note: { type: 'number', required: true, min: 1, max: 5 },
    commentaire: { type: 'string', required: true, minLength: 10, maxLength: 500 },
    recommande: { type: 'boolean', required: true }
  }
};

/**
 * Fonction utilitaire pour valider rapidement avec un schéma prédéfini
 */
const validateWithSchema = (data, schemaName) => {
  const schema = validationSchemas[schemaName];
  if (!schema) {
    throw new Error(`Schéma de validation '${schemaName}' non trouvé`);
  }
  
  return validateAndCleanObject(data, schema);
};

module.exports = {
  // Validations de base
  isValidObjectId,
  isValidMoroccanPhone,
  isValidEmail,
  validatePasswordStrength,
  
  // Validations métier
  validatePackageDimensions,
  validateAddress,
  validateRating,
  validateDepartureDate,
  validateCoordinates,
  validateAndCleanComment,
  validateAmount,
  validateTags,
  validateFileName,
  validateURL,
  validateMerchandiseTypes,
  validatePaymentMethods,
  validateVehicleType,
  validateMoroccanPostalCode,
  validateDateRange,
  validatePaginationParams,
  
  // Utilitaires
  sanitizeString,
  validateAndCleanObject,
  validateWithSchema,
  validationSchemas
};