import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  const closeSidebar = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 overflow-y-auto p-6 pb-16 flex justify-center">
          <div className="w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
