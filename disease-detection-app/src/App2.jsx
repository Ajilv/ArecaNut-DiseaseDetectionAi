import React from 'react'
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Layout from './components/layout/Layout';
import AnalysisForm from './components/analysis/AnalysisForm';
import ResultsDisplay from './components/analysis/ResultsDisplay';
import HistoryView from './components/analysis/HIstoryView';

function App2() {
  return (
    <div>
      
    <Layout currentView={currentView}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/analyze" replace />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/history" element={<HistoryView />} />
        <Route path="/analytics" element={<AnalysisForm />} />
        <Route path="/results/:id" element={<ResultsDisplay />} />
      </Routes>
    </Layout>
  
    </div>
  )
}

export default App2
