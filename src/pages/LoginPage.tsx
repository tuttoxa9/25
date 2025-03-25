import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, isAuthenticated } from '@/lib/firebase/auth';
import { useAppContext } from '@/context/AppContext';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Droplets, LogIn, Mail, Lock, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAppContext();
  const { theme, toggleTheme } = useTheme();

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем наличие email и пароля
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Введите email и пароль",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Попытка входа с данными:', email, '********');
      // Пытаемся выполнить вход через Firebase
      await signInWithEmail(email, password);

      // Если успешно, обновляем состояние
      setIsAuthenticated(true);

      toast({
        title: "Успешный вход",
        description: "Вы вошли в систему",
      });

      // Перенаправляем пользователя на главную страницу
      navigate('/');
    } catch (error: any) {
      console.error('Ошибка входа:', error);

      let errorMessage = "Ошибка входа в систему";

      // Более детальная обработка ошибок Firebase
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Пользователь не найден";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Неверный пароль";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Неверные учетные данные";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Слишком много попыток входа";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Проблема с сетью или с Firebase";
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = "Ошибка в настройках Firebase";
      } else {
        errorMessage = `Ошибка: ${error.message || error}`;
      }

      toast({
        title: "Ошибка входа",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Рендеринг формы
  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden">
      {/* Анимированный фон с орбами */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Кнопка переключения темы */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 dark:bg-gray-900/30 dark:hover:bg-gray-900/50 transition-colors z-20"
        onClick={toggleTheme}
        aria-label="Переключить тему"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-purple-800 dark:text-purple-300" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-300" />
        )}
      </motion.button>

      {/* Форма входа */}
      <motion.div
        className="relative z-10 max-w-md w-full p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Droplets className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">Автомойка</CardTitle>
            <CardDescription className="text-center text-purple-600 dark:text-purple-300 text-lg font-medium pt-1">
              Вход в систему управления
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-700 dark:text-purple-300 text-sm font-medium pl-1">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-purple-500 dark:text-purple-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="bg-white/80 dark:bg-gray-800/70 border-purple-200 dark:border-purple-900 focus:border-purple-500 dark:focus:border-purple-400 pl-10 h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-700 dark:text-purple-300 text-sm font-medium pl-1">Пароль</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-purple-500 dark:text-purple-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="bg-white/80 dark:bg-gray-800/70 border-purple-200 dark:border-purple-900 focus:border-purple-500 dark:focus:border-purple-400 pl-10 h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-8">
              <Button
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg rounded-lg text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Вход...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    <span>Войти</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* CSS для фоновых орбов с поддержкой темной темы */}
      <style>{`
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.5;
          z-index: -1;
        }

        /* Цвета для светлой темы */
        :root:not(.dark) .orb-1 {
          width: 1400px;
          height: 1400px;
          background-color: #9370DB;
          top: -700px;
          left: -700px;
          animation: float-1 60s infinite ease-in-out;
        }
        :root:not(.dark) .orb-2 {
          width: 1200px;
          height: 1200px;
          background-color: #DDA0DD;
          bottom: -600px;
          right: -600px;
          animation: float-2 50s infinite ease-in-out;
        }
        :root:not(.dark) .orb-3 {
          width: 1000px;
          height: 1000px;
          background-color: #E6E6FA;
          top: -500px;
          left: 300px;
          animation: float-3 70s infinite ease-in-out;
        }

        /* Более темные цвета для темной темы */
        .dark .orb-1 {
          width: 1400px;
          height: 1400px;
          background-color: #4B0082; /* Indigo */
          top: -700px;
          left: -700px;
          animation: float-1 60s infinite ease-in-out;
        }
        .dark .orb-2 {
          width: 1200px;
          height: 1200px;
          background-color: #8A2BE2; /* BlueViolet */
          bottom: -600px;
          right: -600px;
          animation: float-2 50s infinite ease-in-out;
        }
        .dark .orb-3 {
          width: 1000px;
          height: 1000px;
          background-color: #483D8B; /* DarkSlateBlue */
          top: -500px;
          left: 300px;
          animation: float-3 70s infinite ease-in-out;
        }

        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(70vw, 20vh); }
          40% { transform: translate(20vw, 70vh); }
          60% { transform: translate(80vw, 60vh); }
          80% { transform: translate(10vw, 30vh); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-60vw, -30vh); }
          50% { transform: translate(-20vw, -60vh); }
          75% { transform: translate(-70vw, -20vh); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(40vw, -20vh); }
          50% { transform: translate(-30vw, 30vh); }
          75% { transform: translate(10vw, -50vh); }
        }
      `}</style>
    </div>
  );
}
