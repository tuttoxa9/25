import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Clock, Cloud, CloudRain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface WeatherConnectionStatusProps {
  className?: string;
  apiKey?: string;
}

export function WeatherConnectionStatus({ className, apiKey }: WeatherConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const checkWeatherConnection = async () => {
    try {
      const key = apiKey || 'f6f6c5a0c1f1413ab48200836252403';
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=Minsk,Belarus&aqi=no`);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Weather connection check failed:', error);
      throw error;
    }
  };

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    setPingTime(null);

    const startTime = performance.now();

    try {
      await checkWeatherConnection();
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      setPingTime(ping);
      setConnectionStatus('connected');
      setLastChecked(new Date());

      // Показать уведомление
      toast({
        title: "Соединение с сервисом погоды установлено",
        description: `Успешное подключение к Weather API за ${ping}мс`,
        variant: "default",
      });

      // Сохранить уведомление в БД
      await addNotification({
        title: "Соединение с Weather API установлено",
        message: `Успешное подключение к Weather API за ${ping}мс`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      setConnectionStatus('error');

      // Показать уведомление об ошибке
      toast({
        title: "Ошибка подключения к сервису погоды",
        description: "Не удалось подключиться к Weather API",
        variant: "destructive",
      });

      // Сохранить уведомление об ошибке в БД
      await addNotification({
        title: "Ошибка подключения к Weather API",
        message: error instanceof Error ? error.message : "Не удалось подключиться к Weather API",
        type: "error",
        isRead: false,
        timestamp: Timestamp.now()
      });
    }
  };

  const getSpeedLabel = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return "Быстрое";
    if (pingTime < 800) return "Среднее";
    return "Медленное";
  };

  const getSpeedClass = () => {
    if (!pingTime) return "";
    if (pingTime < 300) return isDark ? "text-green-400" : "text-green-500";
    if (pingTime < 800) return isDark ? "text-amber-400" : "text-amber-500";
    return isDark ? "text-red-400" : "text-red-500";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={handleCheckConnection}
            disabled={connectionStatus === 'checking'}
            variant="outline"
            className={`relative py-6 px-4 w-full md:w-auto ${
              isDark
                ? 'border-emerald-800 hover:border-emerald-700 bg-slate-800 hover:bg-slate-700'
                : 'border-emerald-200 hover:border-emerald-400 bg-white hover:bg-emerald-50'
            } transition-all duration-200 shadow-sm`}
          >
            <motion.div
              animate={{ rotate: connectionStatus === 'checking' ? 360 : 0 }}
              transition={{ duration: 1.5, repeat: connectionStatus === 'checking' ? Infinity : 0, ease: "linear" }}
              className="mr-2"
            >
              {connectionStatus === 'checking' ? (
                <Loader2 className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              ) : (
                <RefreshCw className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              )}
            </motion.div>
            <span className="font-medium">Проверить подключение</span>
          </Button>
        </motion.div>

        <div className="flex-1 mt-2 md:mt-0">
          <motion.div
            className={cn(
              "p-3 px-4 rounded-lg border transition-all flex items-center gap-3",
              connectionStatus === 'checking'
                ? (isDark ? "bg-blue-950 border-blue-900" : "bg-blue-50 border-blue-200")
                : connectionStatus === 'connected'
                ? (isDark ? "bg-emerald-950 border-emerald-900" : "bg-emerald-50 border-emerald-200")
                : connectionStatus === 'error'
                ? (isDark ? "bg-red-950 border-red-900" : "bg-red-50 border-red-200")
                : (isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className={`h-5 w-5 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <div>
                  <span className={`${isDark ? 'text-blue-400' : 'text-blue-700'} font-medium`}>Проверка подключения к API погоды...</span>
                  <div className={`text-xs ${isDark ? 'text-blue-500' : 'text-blue-600'} mt-0.5`}>Пожалуйста, подождите</div>
                </div>
              </>
            )}

            {connectionStatus === 'connected' && (
              <>
                <div className="relative">
                  <CheckCircle className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <motion.span
                    className={`absolute -top-1 -right-1 w-2 h-2 ${isDark ? 'bg-emerald-300' : 'bg-emerald-400'} rounded-full`}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-700'} font-medium`}>
                    Weather API подключен
                    {pingTime !== null && (
                      <span className="ml-2 font-normal">({pingTime}мс)</span>
                    )}
                  </span>
                  {pingTime !== null && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Zap className={cn("h-3 w-3", getSpeedClass())} />
                      <span className={cn("text-xs", getSpeedClass())}>
                        {getSpeedLabel()} соединение
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {connectionStatus === 'error' && (
              <>
                <div className="relative">
                  <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                  <motion.span
                    className={`absolute -top-1 -right-1 w-2 h-2 ${isDark ? 'bg-red-300' : 'bg-red-400'} rounded-full`}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className={`${isDark ? 'text-red-400' : 'text-red-700'} font-medium`}>Ошибка подключения к Weather API</span>
                  <div className={`text-xs ${isDark ? 'text-red-500' : 'text-red-600'} mt-0.5`}>
                    Проверьте API ключ и доступность сервиса
                  </div>
                </div>
              </>
            )}

            {connectionStatus === 'idle' && (
              <>
                <CloudRain className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                  Нажмите кнопку "Проверить подключение" для тестирования соединения с сервисом погоды
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {lastChecked && connectionStatus !== 'checking' && (
        <motion.p
          className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Clock className="h-3 w-3" />
          Последняя проверка: {lastChecked.toLocaleTimeString()}
        </motion.p>
      )}
    </div>
  );
}
