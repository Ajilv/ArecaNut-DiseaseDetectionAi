import React from 'react';
import Header from '../common/Header';
import Navigation from '../common/Navigation';
import bgLight from '../../assets/bg_light4.jpg'; 

const Layout = ({ children, currentView, onViewChange }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation currentView={currentView} onViewChange={onViewChange} />
      <main className="py-6">
           <div
            className="min-h-screen bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgLight})`,
              backgroundColor: 'rgba(100, 200, 155, 0.4)', 
              backgroundBlendMode: 'overlay',
              marginTop: '-1.5rem'
            }}
          >
       
        {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;