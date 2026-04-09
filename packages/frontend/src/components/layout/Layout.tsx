import { Outlet, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

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
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6 pb-24 flex justify-center">
          <div key={location.pathname} className="w-full max-w-3xl animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
