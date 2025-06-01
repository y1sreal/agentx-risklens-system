import React from 'react';
import { Link } from 'react-router-dom';
import { SessionSidebar } from './SessionSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SessionSidebar />
      <div className="flex-1">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center justify-between w-full">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-xl font-bold text-gray-800">
                    RiskLens
                  </Link>
                </div>
                <div>
                  <Link
                    to="/co-analysis"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    don't click
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}; 