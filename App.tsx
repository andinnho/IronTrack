import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import WeekView from './components/WeekView';
import WorkoutDetail from './components/WorkoutDetail';
import ProgressView from './components/ProgressView';
import Auth from './components/Auth';
import { Loader2 } from 'lucide-react';

const ProtectedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<WeekView />} />
          <Route path="/workout/:dayId" element={<WorkoutDetail />} />
          <Route path="/progress" element={<ProgressView />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
};

export default App;