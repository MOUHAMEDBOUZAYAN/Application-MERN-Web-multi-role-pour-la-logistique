import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
// import Sidebar from './components/common/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Annonces from './pages/Annonces';
import Demandes from './pages/Demandes';
import MyAnnonces from './pages/MyAnnonces';
import Admin from './pages/Admin';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AnnonceDetails from './components/annonces/AnnonceDetails';
import DemandeDetails from './components/demandes/DemandDetails';
import AnnonceFormPage from './pages/AnnonceFormPage';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">Chargement...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">Chargement...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  
  return children;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Une erreur s'est produite
                </h3>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Désolé, quelque chose s'est mal passé. Veuillez actualiser la page.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Actualiser la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex flex-1">
                {/* <Sidebar /> */}
                <main className="flex-1 p-4 bg-gray-50">
                  <Routes>
                    {/* Routes Publiques */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/annonces" element={<Annonces />} />
                    <Route path="/annonces/:id" element={<AnnonceDetails />} />
                    
                    {/* Routes Protégées */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/demandes" element={
                      <ProtectedRoute>
                        <Demandes />
                      </ProtectedRoute>
                    } />
                    <Route path="/demandes/:id" element={
                      <ProtectedRoute>
                        <DemandeDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-annonces" element={
                      <ProtectedRoute>
                        <MyAnnonces />
                      </ProtectedRoute>
                    } />
                    <Route path="/create-annonce" element={
                      <ProtectedRoute>
                        <AnnonceFormPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/edit-annonce/:id" element={
                      <ProtectedRoute>
                        <AnnonceFormPage />
                      </ProtectedRoute>
                    } />

                    {/* Routes Admin */}
                    <Route path="/admin/*" element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
              <Footer />
              <Toaster 
                position="top-center" 
                reverseOrder={false}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;