import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnnouncementForm from '../components/annonces/AnnonceForm';
import { annonceAPI } from '../utils/api';
import Loading from '../components/common/Loading';

const AnnonceFormPage = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchAnnonce = async () => {
        try {
          const response = await annonceAPI.getById(id);
          // Fixed: Since axios interceptor returns only the data, use response.annonce directly
          const annonceData = response.annonce || response.data?.annonce;
          if (annonceData) {
            setAnnouncement(annonceData);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'annonce:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnonce();
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (isEditing) {
        response = await annonceAPI.update(id, formData);
      } else {
        response = await annonceAPI.create(formData);
      }

      // Fixed: Use response.annonce directly since axios interceptor strips the outer data wrapper
      const annonceResult = response.annonce;

      if (annonceResult && annonceResult._id) {
        navigate(`/annonces/${annonceResult._id}`);
      } else {
        console.error("L'ID de l'annonce est introuvable dans la réponse. Redirection vers le tableau de bord.", response);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  const handleCancel = () => {
    navigate(isEditing ? `/annonces/${id}` : '/dashboard');
  };

  if (loading && isEditing) {
    return <Loading />;
  }

  return (
    <AnnouncementForm 
      announcement={announcement}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default AnnonceFormPage;