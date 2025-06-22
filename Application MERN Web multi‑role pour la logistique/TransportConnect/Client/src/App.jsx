import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import AnnonceForm from './components/annonces/AnnonceForm';

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
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/annonces" element={<Annonces />} />
                  <Route path="/annonces/:id" element={<AnnonceDetails />} />
                  <Route path="/demandes" element={<Demandes />} />
                  <Route path="/demandes/:id" element={<DemandeDetails />} />
                  <Route path="/my-annonces" element={<MyAnnonces />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/create-annonce" element={<AnnonceForm />} />
                  <Route path="/edit-annonce/:id" element={<AnnonceForm />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;