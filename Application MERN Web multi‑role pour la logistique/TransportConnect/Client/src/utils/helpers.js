import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const ActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
      
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Verify token is still valid
          try {
            const response = await authAPI.getProfile();
            dispatch({
              type: ActionTypes.LOGIN_SUCCESS,
              payload: {
                user: response.data.user,
                token
              }
            });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          }
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: ActionTypes.LOGIN_START });
      
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      toast.success(`Bienvenue ${user.prenom} !`);
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: ActionTypes.LOGIN_START });
      
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      toast.success('Compte créé avec succès !');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails, clear local storage
    } finally {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      dispatch({ type: ActionTypes.LOGOUT });
      toast.success('Déconnexion réussie');
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.user;
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      dispatch({
        type: ActionTypes.UPDATE_USER,
        payload: updatedUser
      });
      
      toast.success('Profil mis à jour avec succès');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is conductor
  const isConductor = () => {
    return hasRole('conducteur');
  };

  // Check if user is sender
  const isSender = () => {
    return hasRole('expediteur');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    isAdmin,
    isConductor,
    isSender
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;