import React from 'react';
import { Camera, History, User } from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { 
      id: 'analyze', 
      label: 'New Analysis', 
      icon: Camera,
      description: 'Upload and analyze medical images'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: History,
      description: 'View your previous analyses'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      description: 'Manage your account and personal information'
    }
  ];

  return (
    <nav className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {navItems.slice(0, 2).map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  currentView === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div>
            {navItems.slice(2).map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  currentView === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;