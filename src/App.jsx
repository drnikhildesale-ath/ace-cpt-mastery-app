import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import './App.css';

const AppContent = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) return <div className="app"><p>Loading...</p></div>;

  if (!currentUser) return <Login />;

  const isAdmin = currentUser.email === 'admin@ace-cpt-mastery.com';

  return isAdmin ? <AdminDashboard /> : <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

