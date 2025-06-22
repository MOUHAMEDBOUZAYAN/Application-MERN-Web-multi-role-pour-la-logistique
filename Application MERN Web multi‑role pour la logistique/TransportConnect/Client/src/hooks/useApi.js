import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for API calls with loading, error and data states
 */
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    immediate = false,
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Opération réussie',
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const result = response.data;
      
      setData(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: errorMessage };
      
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const {
    limit = 10,
    immediate = false,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (pageNumber = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction({
        page: pageNumber,
        limit,
        ...options.params
      });
      
      const result = response.data;
      const newData = result.data || result.items || [];
      
      setData(prevData => reset ? newData : [...prevData, ...newData]);
      setPage(pageNumber);
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalItems || result.total || 0);
      setHasMore(pageNumber < (result.totalPages || 0));
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: errorMessage };
      
    } finally {
      setLoading(false);
    }
  }, [apiFunction, limit, options.params, onSuccess, onError]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1);
    }
  }, [fetchData, loading, hasMore, page]);

  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setPage(1);
    setTotalPages(0);
    setTotalItems(0);
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      fetchData(1, true);
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    page,
    totalPages,
    totalItems,
    fetchData,
    loadMore,
    refresh,
    reset
  };
};

/**
 * Hook for CRUD operations
 */
export const useCrud = (apiEndpoints) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.create(data);
      const newItem = response.data;
      
      setItems(prev => [newItem, ...prev]);
      toast.success('Élément créé avec succès');
      
      return { success: true, data: newItem };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoints]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.update(id, data);
      const updatedItem = response.data;
      
      setItems(prev => prev.map(item => 
        item._id === id ? updatedItem : item
      ));
      toast.success('Élément mis à jour avec succès');
      
      return { success: true, data: updatedItem };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoints]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      await apiEndpoints.delete(id);
      
      setItems(prev => prev.filter(item => item._id !== id));
      toast.success('Élément supprimé avec succès');
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoints]);

  const fetchAll = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiEndpoints.getAll(params);
      const data = response.data.data || response.data;
      
      setItems(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoints]);

  const fetchById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getById(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiEndpoints]);

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    fetchAll,
    fetchById,
    setItems,
    setError
  };
};

export default useApi;