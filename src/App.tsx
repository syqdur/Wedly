import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebase';
import { AuthPage } from './components/Auth/AuthPage';
import { GalleryPage } from './components/Gallery/GalleryPage';
import { AdminPage } from './components/Admin/AdminPage';
import { ProtectedRoute } from './components/Routes/ProtectedRoute';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={`/gallery/${user.uid}`} replace />
              ) : (
                <AuthPage />
              )
            } 
          />
          <Route 
            path="/gallery/:userId" 
            element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;