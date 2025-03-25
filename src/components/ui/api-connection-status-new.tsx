import { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Loader2, RefreshCcw, Zap, Clock, Shield, Globe, Activity, Wifi, Clock4 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/context/ThemeContext';

interface ApiConnectionStatusProps {
  className?: string;
  apiName: string;
  icon: React.ReactNode;
  checkConnection: () => Promise<any>;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export function ApiConnectionStatusNew({
  className,
  apiName,
  icon,
  checkConnection,
  primaryColor,
  secondaryColor,
  description
}: ApiConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'error') {
      setIsExpanded(true);
    }
  }, [connectionStatus]);

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    setPingTime(null);

    const startTime = performance.now();

    try {
      await checkConnection();
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      setPingTime(ping);
      setConnectionStatus('connected');
      setLastChecked(new Date());

      // Показать уведомление
      toast({
        title: `Соединение c ${apiName} установлено`,
        description: `Успешное подключение за ${ping}мс`,
        variant: "default",
      });

      // Сохранить уведомление в БД
      await addNotification({
        title: `Соединение с ${apiName} установлено`,
        message: `Успешное подключение за ${ping}мс`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      setConnectionStatus('error');

      // Показать уведомление об ошибке
      toast({
        title: `Ошибка подключения к ${apiName}`,
        description: error instanceof Error ? error.message : `Не удалось подключиться к ${apiName}`,
        variant: "destructive",
      });

      // Сохранить уведомление об ошибке в БД
      await addNotification({
        title: `Ошибка подключения к ${apiName}`,
        message: error instanceof Error ? error.message : `Не удалось подключиться к ${apiName}`,
        type: "error",
        isRead: false,
        timestamp: Timestamp.now()
      });
    }
  };

  const getSpeedLabel = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return "Отличная";
    if (pingTime < 800) return "Нормальная";
    return "Низкая";
  };

  const getSpeedClass = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return "text-green-500 dark:text-green-400";
    if (pingTime < 800) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  // Новая функция для отображения времени с момента последней проверки
  const getTimeAgo = () => {
    if (!lastChecked) return 'Не проверялось';

    const now = new Date();
    const diffMs = now.getTime() - lastChecked.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} сек. назад`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} мин. назад`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} час. назад`;
    return `${Math.floor(diffSec / 86400)} дн. назад`;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all duration-300 shadow-lg",
        isDark
          ? `border-${primaryColor}-800/50 from-${primaryColor}-950/20 to-slate-900/40 hover:shadow-${primaryColor}-900/10`
          : `border-${primaryColor}-200 from-${primaryColor}-50/50 to-white hover:shadow-${primaryColor}-200/30`,
        className
      )}
    >
      {/* Фоновая анимация */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, var(--${primaryColor}-500) 0%, transparent 70%)`,
            `radial-gradient(circle at 50% 80%, var(--${primaryColor}-500) 0%, transparent 70%)`,
            `radial-gradient(circle at 80% 40%, var(--${primaryColor}-500) 0%, transparent 70%)`,
            `radial-gradient(circle at 20% 30%, var(--${primaryColor}-500) 0%, transparent 70%)`
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
              isDark
                ? `bg-${primaryColor}-900/70 text-${primaryColor}-400`
                : `bg-${primaryColor}-100 text-${primaryColor}-700`
            )}>
              {icon}
            </div>

            <div>
              <h3 className={cn(
                "text-base font-semibold flex items-center",
                isDark ? `text-${primaryColor}-300` : `text-${primaryColor}-700`
              )}>
                {apiName}
                {connectionStatus === 'connected' && pingTime && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-sm font-normal"
                  >
                    ({pingTime} мс)
                  </motion.span>
                )}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} opacity-80`}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Индикатор состояния */}
            {connectionStatus === 'connected' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <motion.div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full",
                          isDark ? `bg-${primaryColor}-900/50` : `bg-${primaryColor}-100/80`
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className={cn(`h-4 w-4 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
                      </motion.div>
                      <motion.div
                        className={cn(`absolute inset-0 rounded-full ${isDark ? `border border-${primaryColor}-400/30` : `border border-${primaryColor}-400/50`}`)}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Соединение активно</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {connectionStatus === 'error' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <motion.div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full",
                          isDark ? "bg-red-900/50" : "bg-red-100/80"
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertOctagon className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border border-red-400/50"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Ошибка соединения</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Кнопка проверки */}
            <Button
              onClick={handleCheckConnection}
              disabled={connectionStatus === 'checking'}
              variant="outline"
              size="sm"
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isDark
                  ? `bg-slate-800/90 border-${primaryColor}-800 hover:border-${primaryColor}-700 hover:bg-${primaryColor}-900/30`
                  : `bg-white border-${primaryColor}-200 hover:border-${primaryColor}-400 hover:bg-${primaryColor}-50`
              )}
            >
              <motion.div
                animate={{ rotate: connectionStatus === 'checking' ? 360 : 0 }}
                transition={{ duration: 1, repeat: connectionStatus === 'checking' ? Infinity : 0, ease: "linear" }}
                className="mr-2"
              >
                {connectionStatus === 'checking' ? (
                  <Loader2 className={cn(`h-3.5 w-3.5 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
                ) : (
                  <RefreshCcw className={cn(`h-3.5 w-3.5 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
                )}
              </motion.div>
              <span className="text-xs">{connectionStatus === 'checking' ? 'Проверка...' : 'Проверить'}</span>

              {/* Ripple effect */}
              {connectionStatus === 'checking' && (
                <motion.div
                  className={`absolute inset-0 ${isDark ? `bg-${primaryColor}-700` : `bg-${primaryColor}-200`}`}
                  initial={{ scale: 0, opacity: 0.3, borderRadius: '50%', x: '50%', y: '50%' }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </Button>
          </div>
        </div>

        {/* Расширенная информация */}
        <AnimatePresence>
          {isExpanded && connectionStatus !== 'idle' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={cn(
                "px-5 py-4 border-t",
                isDark
                  ? `border-${primaryColor}-900/50 bg-${primaryColor}-950/20`
                  : `border-${primaryColor}-100 bg-${primaryColor}-50/50`
              )}>
                {connectionStatus === 'checking' && (
                  <div className="flex items-center justify-center py-2">
                    <div className="relative">
                      <Loader2 className={`h-5 w-5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'} mr-3`} />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-blue-400/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.2, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <span className={isDark ? 'text-blue-400' : 'text-blue-700'}>Проверка соединения...</span>
                  </div>
                )}

                {connectionStatus === 'connected' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Карточка статуса соединения */}
                      <div className={cn(
                        "flex items-center gap-3 rounded-lg p-3 shadow-sm transition-all",
                        isDark
                          ? `bg-${primaryColor}-900/30 border border-${primaryColor}-800/50`
                          : `bg-white border border-${primaryColor}-200/70`
                      )}>
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg",
                          isDark ? `bg-${primaryColor}-900` : `bg-${primaryColor}-100`
                        )}>
                          <Shield className={cn(`h-4 w-4 ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`)} />
                        </div>
                        <div>
                          <h4 className={cn(
                            "text-sm font-medium",
                            isDark ? `text-${primaryColor}-300` : `text-${primaryColor}-700`
                          )}>
                            Безопасное соединение
                          </h4>
                          <p className="text-xs text-slate-400/80">TLS-шифрование</p>
                        </div>
                      </div>

                      {/* Карточка скорости соединения */}
                      <div className={cn(
                        "flex items-center gap-3 rounded-lg p-3 shadow-sm transition-all",
                        isDark
                          ? `bg-${primaryColor}-900/30 border border-${primaryColor}-800/50`
                          : `bg-white border border-${primaryColor}-200/70`
                      )}>
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg",
                          isDark ? `bg-${primaryColor}-900` : `bg-${primaryColor}-100`
                        )}>
                          <Activity className={cn(`h-4 w-4 ${getSpeedClass()}`)} />
                        </div>
                        <div>
                          <h4 className={cn(
                            "text-sm font-medium",
                            getSpeedClass()
                          )}>
                            {getSpeedLabel()} скорость
                          </h4>
                          <p className="text-xs text-slate-400/80">{pingTime} мс</p>
                        </div>
                      </div>
                    </div>

                    {/* Статусная строка */}
                    <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="h-3 w-3" />
                        <span>Статус: активно</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock4 className="h-3 w-3" />
                        <span>Проверено: {getTimeAgo()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {connectionStatus === 'error' && (
                  <div className="space-y-3">
                    <div className={cn(
                      "flex items-center gap-3 rounded-lg p-3 shadow-sm transition-all",
                      isDark
                        ? "bg-red-900/20 border border-red-800/50"
                        : "bg-white border border-red-200/70"
                    )}>
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg",
                        isDark ? "bg-red-900" : "bg-red-100"
                      )}>
                        <AlertOctagon className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-red-500">
                          Ошибка соединения
                        </h4>
                        <p className="text-xs text-slate-400">
                          Не удалось подключиться к API
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="h-3 w-3 text-red-400" />
                        <span>Статус: ошибка</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock4 className="h-3 w-3" />
                        <span>Проверено: {getTimeAgo()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
