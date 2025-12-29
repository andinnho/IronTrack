import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import WeekView from './components/WeekView';
import WorkoutDetail from './components/WorkoutDetail';
import ProgressView from './components/ProgressView';

const App: React.FC = () => {
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

export default App;