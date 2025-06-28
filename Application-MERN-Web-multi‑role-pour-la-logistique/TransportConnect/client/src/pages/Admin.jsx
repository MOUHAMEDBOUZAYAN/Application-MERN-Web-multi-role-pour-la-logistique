import React from 'react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h1>
      <p className="text-lg mb-4">Bienvenue, {user?.prenom || 'Admin'} !</p>
      {/* Ajoutez ici les composants de gestion (utilisateurs, annonces, statistiques, etc.) */}
    </div>
  );
};

export default Admin;
