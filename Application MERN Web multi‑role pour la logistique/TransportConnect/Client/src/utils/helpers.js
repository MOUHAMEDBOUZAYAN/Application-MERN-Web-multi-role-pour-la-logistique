// helpers.js
// Place ici uniquement des fonctions utilitaires, pas de code React ni de context !

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR');
}

export function formatTime(time) {
  if (!time) return '';
  return new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
}

// Retourne la couleur associée à un statut (exemple générique, à adapter selon ton code)
export function getStatusColor(status) {
  switch (status) {
    case 'active':
    case 'accepted':
    case 'success':
      return 'green';
    case 'pending':
    case 'warning':
      return 'orange';
    case 'rejected':
    case 'danger':
      return 'red';
    case 'inactive':
    case 'gray':
      return 'gray';
    default:
      return 'blue';
  }
}

// Retourne un label lisible pour un statut (exemple générique, à adapter selon ton code)
export function getStatusLabel(status) {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'inactive':
      return 'Inactif';
    case 'pending':
      return 'En attente';
    case 'accepted':
      return 'Accepté';
    case 'rejected':
      return 'Refusé';
    case 'completed':
      return 'Terminé';
    default:
      return status;
  }
}

export function isValidEmail(email) {
  if (!email) return false;
  // Regex simple pour valider un email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  if (!phone) return false;
  // Regex pour valider un numéro marocain (+212 ou 0 suivi de 9 chiffres)
  return /^(\+212|0)[5-7][0-9]{8}$/.test(phone);
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Format marocain : +212 6 12 34 56 78 ou 06 12 34 56 78
  return phone
    .replace(/^(\+212|0)/, '+212 ')
    .replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
}

// Retourne un message sur la robustesse du mot de passe
export function getPasswordStrengthMessage(password) {
  if (!password) return '';
  if (password.length < 8) return 'Trop court';
  if (!/[A-Z]/.test(password)) return 'Ajoutez une majuscule';
  if (!/[a-z]/.test(password)) return 'Ajoutez une minuscule';
  if (!/[0-9]/.test(password)) return 'Ajoutez un chiffre';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Ajoutez un caractère spécial';
  return 'Mot de passe fort';
}

// Ajoute ici d'autres helpers si besoin