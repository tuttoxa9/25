import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap, Clock } from 'lucide-react';
import { checkFirebaseConnection } from '@/lib/firebase/connection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface FirebaseConnectionStatusProps {
  className?: string;
}

export function FirebaseConnectionStatus({ className }: FirebaseConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();
  const { addNotification } = useAppContext();

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    setPingTime(null);

    const startTime = performance.now();

    try {
      await checkFirebaseConnection();
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      setPingTime(ping);
      setConnectionStatus('connected');
      setLastChecked(new Date());

      // Показать уведомление
      toast({
        title: "Соединение установлено",
        description: `Успешное подключение к Firebase за ${ping}мс`,
        variant: "default",
      });

      // Сохранить уведомление в БД
      await addNotification({
        title: "Соединение с Firebase установлено",
        message: `Успешное подключение к Firebase за ${ping}мс`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      setConnectionStatus('error');

      // Показать уведомление об ошибке
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к Firebase",
        variant: "destructive",
      });

      // Сохранить уведомление об ошибке в БД
      await addNotification({
        title: "Ошибка подключения к Firebase",
        message: error instanceof Error ? error.message : "Не удалось подключиться к Firebase",
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
    if (pingTime < 300) return "text-green-500";
    if (pingTime < 800) return "text-amber-500";
    return "text-red-500";
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
            className="relative py-6 px-4 w-full md:w-auto border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 transition-all duration-200 shadow-sm"
          >
            <motion.div
              animate={{ rotate: connectionStatus === 'checking' ? 360 : 0 }}
              transition={{ duration: 1.5, repeat: connectionStatus === 'checking' ? Infinity : 0, ease: "linear" }}
              className="mr-2"
            >
              {connectionStatus === 'checking' ? (
                <Loader2 className="h-5 w-5 text-indigo-600" />
              ) : (
                <RefreshCw className="h-5 w-5 text-indigo-600" />
              )}
            </motion.div>
            <span className="font-medium">Проверить подключение</span>
          </Button>
        </motion.div>

        <div className="flex-1 mt-2 md:mt-0">
          <motion.div
            className={cn(
              "p-3 px-4 rounded-lg border transition-all flex items-center gap-3",
              {
                "bg-blue-50 border-blue-200": connectionStatus === 'checking',
                "bg-green-50 border-green-200": connectionStatus === 'connected',
                "bg-red-50 border-red-200": connectionStatus === 'error',
                "bg-slate-50 border-slate-200": connectionStatus === 'idle',
              }
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <div>
                  <span className="text-blue-700 font-medium">Проверка подключения...</span>
                  <div className="text-xs text-blue-600 mt-0.5">Пожалуйста, подождите</div>
                </div>
              </>
            )}

            {connectionStatus === 'connected' && (
              <>
                <div className="relative">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <motion.span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className="text-green-700 font-medium">
                    Firebase подключен
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
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <motion.span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className="text-red-700 font-medium">Ошибка подключения</span>
                  <div className="text-xs text-red-600 mt-0.5">
                    Проверьте настройки подключения и повторите попытку
                  </div>
                </div>
              </>
            )}

            {connectionStatus === 'idle' && (
              <div className="text-slate-500 text-sm">
                Нажмите кнопку "Проверить подключение" для тестирования соединения с Firebase
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {lastChecked && connectionStatus !== 'checking' && (
        <motion.p
          className="text-xs text-slate-500 flex items-center gap-1"
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
