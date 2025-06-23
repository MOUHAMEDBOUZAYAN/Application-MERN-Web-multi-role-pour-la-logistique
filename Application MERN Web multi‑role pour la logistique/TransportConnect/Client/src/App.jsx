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
    // You can add a loading spinner here
    return <div>Chargement...</div>;
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
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated || user.role !== 'admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  
  return children;
}

function App() {
  return (
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
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/demandes" element={<ProtectedRoute><Demandes /></ProtectedRoute>} />
                  <Route path="/demandes/:id" element={<ProtectedRoute><DemandeDetails /></ProtectedRoute>} />
                  <Route path="/my-annonces" element={<ProtectedRoute><MyAnnonces /></ProtectedRoute>} />
                  <Route path="/create-annonce" element={<ProtectedRoute><AnnonceFormPage /></ProtectedRoute>} />
                  <Route path="/edit-annonce/:id" element={<ProtectedRoute><AnnonceFormPage /></ProtectedRoute>} />

                  {/* Routes Admin */}
                  <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
            <Footer />
            <Toaster position="top-center" reverseOrder={false} />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;