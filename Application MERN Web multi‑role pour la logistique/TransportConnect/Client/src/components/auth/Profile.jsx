import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save,
  Shield,
  Award,
  MapPin,
  Calendar,
  Edit3
} from 'lucide-react';
import { isValidEmail, isValidPhone, getInitials, formatDate } from '../../utils/helpers';
import { InlineLoading } from '../common/Loading';
import Modal, { ConfirmationModal } from '../common/Modal';

const Profile = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || '',
      ville: user?.ville || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const watchNewPassword = watch('newPassword', '');

  React.useEffect(() => {
    if (user) {
      setValue('prenom', user.prenom);
      setValue('nom', user.nom);
      setValue('email', user.email);
      setValue('telephone', user.telephone);
      setValue('adresse', user.adresse || '');
      setValue('ville', user.ville || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });
    
    // Add avatar if selected
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const result = await updateUser(formData);
    if (result.success) {
      setIsEditing(false);
      setAvatar(null);
      setAvatarPreview(null);
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await updateUser({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    
    if (result.success) {
      setShowChangePassword(false);
      resetPassword();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatar(null);
    setAvatarPreview(null);
    reset();
  };

  const getUserBadges = () => {
    const badges = [];
    if (user?.verified) badges.push({ label: 'Vérifié', color: 'blue' });
    if (user?.premium) badges.push({ label: 'Premium', color: 'yellow' });
    if (user?.topConducteur) badges.push({ label: 'Top Conducteur', color: 'green' });
    return badges;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || user.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {getInitials(`${user?.prenom} ${user?.nom}`)}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {user?.prenom} {user?.nom}
            </h2>
            <p className="text-gray-600 mb-2">{user?.email}</p>
            
            {/* Role Badge */}
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
              user?.role === 'conducteur' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.role === 'admin' ? 'Administrateur' : 
               user?.role === 'conducteur' ? 'Conducteur' : 'Expéditeur'}
            </span>

            {/* Badges */}
            {getUserBadges().length > 0 && (
              <div className="flex justify-center space-x-2 mb-4">
                {getUserBadges().map((badge, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${badge.color}-100 text-${badge.color}-800`}
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user?.stats?.totalTrips || 0}</p>
                  <p className="text-gray-600">Trajets</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user?.stats?.rating || 0}</p>
                  <p className="text-gray-600">Note</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user?.stats?.reviews || 0}</p>
                  <p className="text-gray-600">Avis</p>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="border-t pt-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Informations Personnelles
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-500"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? <InlineLoading message="Sauvegarde..." /> : 'Sauvegarder'}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('prenom', {
                        required: 'Le prénom est requis',
                        minLength: { value: 2, message: 'Minimum 2 caractères' }
                      })}
                      type="text"
                      disabled={!isEditing}
                      className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.prenom ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.prenom && (
                    <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    {...register('nom', {
                      required: 'Le nom est requis',
                      minLength: { value: 2, message: 'Minimum 2 caractères' }
                    })}
                    type="text"
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''} ${errors.nom ? 'border-red-300' : ''}`}
                  />
                  {errors.nom && (
                    <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'L\'email est requis',
                      validate: value => isValidEmail(value) || 'Format d\'email invalide'
                    })}
                    type="email"
                    disabled={!isEditing}
                    className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.email ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('telephone', {
                      required: 'Le téléphone est requis',
                      validate: value => isValidPhone(value) || 'Format de téléphone invalide'
                    })}
                    type="tel"
                    disabled={!isEditing}
                    className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.telephone ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('adresse')}
                    type="text"
                    disabled={!isEditing}
                    className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Votre adresse complète"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  {...register('ville')}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Sélectionner une ville</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Fès">Fès</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Meknès">Meknès</option>
                  <option value="Oujda">Oujda</option>
                  <option value="Kenitra">Kenitra</option>
                  <option value="Tétouan">Tétouan</option>
                </select>
              </div>
            </form>
          </div>

          {/* Security Section */}
          <div className="card mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Mot de passe</h4>
                  <p className="text-sm text-gray-600">
                    Dernière modification il y a {user?.lastPasswordChange ? 
                      new Date(user.lastPasswordChange).toLocaleDateString('fr-FR') : 
                      'jamais'}
                  </p>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="btn-secondary"
                >
                  Modifier
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                  <p className="text-sm text-gray-600">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <button className="btn-secondary">
                  {user?.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Sessions actives</h4>
                  <p className="text-sm text-gray-600">
                    Gérer vos connexions sur d'autres appareils
                  </p>
                </div>
                <button className="btn-secondary">
                  Voir tout
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card mt-8 border-red-200">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-red-900">Zone de danger</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Supprimer le compte</h4>
                  <p className="text-sm text-red-600">
                    Cette action est irréversible. Toutes vos données seront supprimées.
                  </p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Modifier le mot de passe"
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              {...registerPassword('currentPassword', {
                required: 'Le mot de passe actuel est requis'
              })}
              type="password"
              className="input-field"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              {...registerPassword('newPassword', {
                required: 'Le nouveau mot de passe est requis',
                minLength: { value: 8, message: 'Minimum 8 caractères' }
              })}
              type="password"
              className="input-field"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              {...registerPassword('confirmPassword', {
                required: 'Veuillez confirmer le mot de passe',
                validate: value => value === watchNewPassword || 'Les mots de passe ne correspondent pas'
              })}
              type="password"
              className="input-field"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowChangePassword(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <InlineLoading message="Modification..." /> : 'Modifier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;