import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DatabaseIcon, Cloud, Settings2, Database, CheckCircle2, ServerCrash } from 'lucide-react';
import { checkFirebaseConnection } from '@/lib/firebase/connection';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

// Неоморфические компоненты
import { NeomorphicApiStatus } from '@/components/ui/neomorphic-api-status';
import { NeomorphicApiForm } from '@/components/ui/neomorphic-api-form';
import { NeomorphicBox } from '@/components/ui/neomorphic-box';

export function ApiSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [weatherApiKey, setWeatherApiKey] = useState<string>('f6f6c5a0c1f1413ab48200836252403');
  const [firebaseStatus, setFirebaseStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const { toast } = useToast();
  const { deleteAllData } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const checkWeatherConnection = async () => {
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=Minsk,Belarus&aqi=no`);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setWeatherStatus('connected');
      return data;
    } catch (error) {
      console.error('Weather connection check failed:', error);
      setWeatherStatus('error');
      throw error;
    }
  };

  const checkFirebaseConnectionWrapper = async () => {
    try {
      await checkFirebaseConnection();
      setFirebaseStatus('connected');
      return true;
    } catch (error) {
      setFirebaseStatus('error');
      throw error;
    }
  };

  // Варианты стилей для фона страницы (неоморфический стиль отличается от основного дизайна)
  const pageStyle = isDark
    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white'
    : 'bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 text-gray-800';

  return (
    <div className={`min-h-screen p-4 ${pageStyle}`}>
      {mounted && (
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Заголовок секции */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-1"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <Settings2 className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h1 className="text-xl font-bold">API</h1>
            </motion.div>
          </div>

          {/* Блоки API (Firebase и Weather) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firebase API блок */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <NeomorphicBox color="blue">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                      <DatabaseIcon className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold">Firebase API</h2>
                      <p className="text-xs text-slate-500">База данных и аутентификация</p>
                    </div>
                    {firebaseStatus === 'connected' && (
                      <div className="flex items-center text-green-500 text-xs gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Подключен</span>
                      </div>
                    )}
                    {firebaseStatus === 'error' && (
                      <div className="flex items-center text-red-500 text-xs gap-1">
                        <ServerCrash className="h-3.5 w-3.5" />
                        <span>Ошибка</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <NeomorphicApiStatus
                      apiName="Firebase Firestore"
                      description="Облачная база данных"
                      icon={<DatabaseIcon className="h-4 w-4" />}
                      color="blue"
                      checkConnection={checkFirebaseConnectionWrapper}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Версия</div>
                      <div className="font-medium">9.x</div>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Проект</div>
                      <div className="font-medium">wash-v0</div>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Регион</div>
                      <div className="font-medium">europe-west3</div>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Шифрование</div>
                      <div className="font-medium">AES-256</div>
                    </div>
                  </div>
                </div>
              </NeomorphicBox>
            </motion.div>

            {/* Weather API блок */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <NeomorphicBox color="green">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                      <Cloud className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-semibold">Weather API</h2>
                      <p className="text-xs text-slate-500">Погодные данные и прогнозы</p>
                    </div>
                    {weatherStatus === 'connected' && (
                      <div className="flex items-center text-green-500 text-xs gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Подключен</span>
                      </div>
                    )}
                    {weatherStatus === 'error' && (
                      <div className="flex items-center text-red-500 text-xs gap-1">
                        <ServerCrash className="h-3.5 w-3.5" />
                        <span>Ошибка</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <NeomorphicApiStatus
                      apiName="Weather API"
                      description="Погодный сервис"
                      icon={<Cloud className="h-4 w-4" />}
                      color="green"
                      checkConnection={checkWeatherConnection}
                    />
                  </div>

                  <NeomorphicApiForm
                    apiName="Weather"
                    initialApiKey={weatherApiKey}
                    onApiKeyChange={setWeatherApiKey}
                    color="green"
                    helpUrl="https://www.weatherapi.com/my/"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Версия API</div>
                      <div className="font-medium">v1</div>
                    </div>
                    <div className={`p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className="text-slate-500 mb-1">Формат</div>
                      <div className="font-medium">JSON</div>
                    </div>
                  </div>
                </div>
              </NeomorphicBox>
            </motion.div>
          </div>

          {/* Подножие страницы */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              API v2.0 • {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
