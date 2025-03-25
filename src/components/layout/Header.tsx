import { Bell, UserRound, ChevronLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Link, useNavigate } from 'react-router-dom';
import { WeatherForecast } from '@/components/ui/weather-forecast';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, d MMMM yyyy', { locale: ru });
  const { notifications, clearNotifications, getUnreadNotificationsCount, logout } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setUnreadCount(getUnreadNotificationsCount());
  }, [notifications, getUnreadNotificationsCount]);

  // Обработчик выхода из системы
  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
      navigate('/login');
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-4 sm:px-6 w-full",
      isDark
        ? "bg-slate-950 border-slate-800 text-slate-200"
        : "bg-white"
    )}>
      <div className="md:ml-0 lg:ml-0 mr-4 transition-all duration-300">
        <WeatherForecast />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "md:hidden",
          isDark && "hover:bg-slate-800 text-slate-300"
        )}
        asChild
      >
        <Link to="/">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Назад</span>
        </Link>
      </Button>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <div className={cn(
            "text-sm",
            isDark ? "text-slate-400" : "text-muted-foreground"
          )}>
            {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
          </div>
        </div>

        {/* Переключатель темы */}
        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full relative",
                isDark && "hover:bg-slate-800 text-slate-300"
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Уведомления</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn(
            "w-80 p-0",
            isDark && "bg-slate-900 border-slate-700"
          )} align="end">
            <div className={cn(
              "flex items-center justify-between p-3 border-b",
              isDark && "border-slate-700"
            )}>
              <h3 className={cn(
                "font-medium",
                isDark && "text-slate-200"
              )}>Уведомления</h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className={cn(
                    "text-xs h-auto py-1",
                    isDark && "hover:bg-slate-800 text-slate-300"
                  )}
                >
                  Очистить все
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={cn(
                  "p-4 text-sm text-center",
                  isDark ? "text-slate-400" : "text-muted-foreground"
                )}>
                  Нет уведомлений
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id} className={cn(
                      "p-3 border-b last:border-b-0",
                      isDark
                        ? "hover:bg-slate-800 border-slate-700"
                        : "hover:bg-slate-50"
                    )}>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium",
                          isDark && "text-slate-200"
                        )}>{notification.title}</span>
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-slate-400" : "text-muted-foreground"
                        )}>{notification.message}</span>
                        <span className={cn(
                          "text-xs mt-1",
                          isDark ? "text-slate-500" : "text-muted-foreground"
                        )}>
                          {format(notification.timestamp.toDate(), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full",
            isDark && "hover:bg-slate-800 text-slate-300"
          )}
        >
          <UserRound className="h-5 w-5" />
          <span className="sr-only">Профиль</span>
        </Button>

        {/* Кнопка выхода */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "flex items-center",
            isDark && "hover:bg-slate-800 text-slate-300"
          )}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Выход</span>
        </Button>
      </div>
    </header>
  );
}
