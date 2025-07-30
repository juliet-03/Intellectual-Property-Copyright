import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Clients from './components/clients/Clients';
import ClientDetail from './components/clients/ClientDetail';
import Layout from './components/layout/Layout';
import Messages from './components/messages/Messages';
import Settings from './components/settings/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register setIsAuthenticated={setIsAuthenticated} />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/clients" 
            element={
              isAuthenticated ? (
                <Layout>
                  <Clients />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/clients/:id" 
            element={
              isAuthenticated ? (
                <Layout>
                  <ClientDetail />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/messages" 
            element={
              isAuthenticated ? (
                <Layout>
                  <Messages />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? (
                <Layout>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
