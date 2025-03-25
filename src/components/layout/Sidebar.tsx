import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  isActive,
  isCollapsed,
  onClick
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
        isActive
          ? isDark
              ? "bg-slate-800 text-blue-400 border-l-2 border-blue-600"
              : "bg-primary/10 text-primary"
          : isDark
              ? "text-slate-300 hover:bg-slate-800 hover:text-blue-400"
              : "text-gray-600 hover:bg-accent/50 hover:text-primary"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "shrink-0 w-6 h-6",
        isActive && isDark ? "text-blue-400" : ""
      )}>
        {icon}
      </div>
      {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">{label}</span>}
    </Link>
  );
};

export function Sidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const routes = [
    {
      href: '/',
      label: 'Главная',
      icon: <LayoutDashboard className="size-5" />,
      isActive: pathname === '/'
    },
    {
      href: '/reports',
      label: 'Отчеты',
      icon: <BarChart className="size-5" />,
      isActive: pathname.includes('/reports')
    },
    {
      href: '/settings',
      label: 'Настройки',
      icon: <Settings className="size-5" />,
      isActive: pathname.includes('/settings')
    }
  ];

  return (
    <div className={cn(
      "flex flex-col border-r transition-all duration-300 fixed h-screen z-10",
      isDark
        ? "bg-slate-950 border-slate-800"
        : "bg-white",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-14 items-center justify-between px-3 py-4 border-b",
        isDark ? "border-slate-800" : ""
      )}>
        {!isCollapsed && (
          <div className="flex items-center">
            <div className={cn(
              "flex items-center justify-center rounded-full w-8 h-8",
              isDark
                ? "bg-gradient-to-br from-blue-600 to-blue-800"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            )}>
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className={cn(
              "ml-2 font-bold text-sm",
              isDark
                ? "text-blue-300"
                : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"
            )}>
              Химчистка 8
            </span>
          </div>
        )}
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          size="sm"
          className={cn(
            isCollapsed ? "mx-auto" : "",
            isDark ? "hover:bg-slate-800 text-slate-300" : ""
          )}
        >
          {isCollapsed ? <Menu className="size-5" /> : <ChevronLeft className="size-5" />}
        </Button>
      </div>
      <div className="flex-1 py-2 overflow-y-auto no-scrollbar">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <SidebarItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              label={route.label}
              isActive={route.isActive}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
      <div className="p-2">
        <div className={cn(
          "flex flex-col gap-1 rounded-lg p-2 text-center",
          isDark
            ? "text-slate-400"
            : "text-muted-foreground"
        )}>
          {isCollapsed ? '😊' : 'Система управления'}
        </div>
      </div>
    </div>
  );
}
