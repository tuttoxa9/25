import React, { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string; // Made pageTitle optional
}

export function Layout({ children, pageTitle }: LayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Effect to listen for sidebar collapse state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedValue = localStorage.getItem('sidebarCollapsed');
      if (storedValue) {
        setIsCollapsed(storedValue === 'true');
      }
    };

    // Initial check
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);

    // For direct state changes within same window
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const event = new Event('storage');
      originalSetItem.apply(this, [key, value]);
      window.dispatchEvent(event);
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <div className={cn(
      "flex min-h-screen flex-col",
      isDark ? "bg-slate-950 text-slate-200" : ""
    )}>
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64",
          isDark ? "bg-slate-950" : ""
        )}>
          {pageTitle && (
            <h1 className={cn(
              "text-2xl font-bold mb-6",
              isDark ? "text-slate-100" : ""
            )}>{pageTitle}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
