import React, { useState } from 'react';
import bgLight from './assets/bg_light.jpg';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Layout from './components/layout/Layout';
import AnalysisForm from './components/analysis/AnalysisForm';
import ResultsDisplay from './components/analysis/ResultsDisplay';
import HistoryView from './components/analysis/HistoryView';
import Profile from './components/analysis/Profile';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected App Component
const ProtectedApp = () => {
  const [currentView, setCurrentView] = useState('analyze');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentView('results');
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setCurrentView('analyze');
  };

  const handleViewResult = (result) => {
    setAnalysisResult(result);
    setCurrentView('results');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analyze':
        return <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />;
      case 'results':
        return analysisResult ? (
          <ResultsDisplay 
            result={analysisResult} 
            onNewAnalysis={handleNewAnalysis} 
          />
        ) : (
          <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />
        );
      case 'history':
        return <HistoryView onViewResult={handleViewResult} />;
      case 'profile':
        return <Profile />;
      default:
        return <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
};

// Auth Wrapper Component
const AuthWrapper = () => {
  const [authView, setAuthView] = useState('login');
  const { user, loading } = useAuth();

  console.log('AuthWrapper - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing auth forms');
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgLight})` }}>
        {authView === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }
  console.log('User authenticated, showing dashboard');
  return <ProtectedApp />;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;