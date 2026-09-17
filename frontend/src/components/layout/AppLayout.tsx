import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * AppLayout wraps all authenticated pages.
 * - Desktop (md+): sticky sidebar + scrollable main column side-by-side.
 * - Mobile: full-width main, hamburger opens a drawer overlay.
 */
export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* On mobile add top padding so content isn't hidden behind the hamburger button */}
        <div className="pt-16 md:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
