import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, getCurrentUserData } from '@/lib/firebase/auth';
import { ShieldCheck, Clock, UserIcon, Mail, BadgeCheck, KeyIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// Interface for Firebase Timestamp-like objects
interface TimestampLike {
  toDate: () => Date;
}

export function AuthSettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем базовую информацию о пользователе
        const user = getCurrentUser();

        if (user) {
          // Получаем дополнительные данные из Firestore
          const data = await getCurrentUserData();

          // Форматирование даты с учетом возможных форматов Firestore
          let createdAtStr = 'Не указано';
          if (data?.createdAt) {
            try {
              // Проверка на Firebase Timestamp
              if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
                const timestamp = data.createdAt as TimestampLike;
                createdAtStr = timestamp.toDate().toLocaleString();
              }
              // Если createdAt - это объект Date
              else if (data.createdAt instanceof Date) {
                createdAtStr = data.createdAt.toLocaleString();
              }
              // Если createdAt - это строка или timestamp в секундах
              else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
                createdAtStr = new Date(data.createdAt).toLocaleString();
              }
            } catch (e) {
              console.error('Ошибка форматирования даты:', e);
            }
          }

          setUserData({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || (data?.displayName || 'Не указано'),
            role: data?.role || 'Не указано',
            createdAt: createdAtStr,
            lastSignInTime: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime,
          });
        } else {
          setError('Пользователь не авторизован');
        }
      } catch (error: any) {
        console.error('Ошибка при получении данных пользователя:', error);
        setError(error.message || 'Не удалось загрузить данные пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <div className="flex justify-center py-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 py-2 text-sm">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Левая колонка - данные профиля */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                  <UserIcon className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium">Данные профиля</h3>
              </div>

              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">Email адрес</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs`}>
                    {userData?.email || 'Не указано'}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <UserIcon className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">Имя пользователя</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs`}>
                    {userData?.displayName || 'Не указано'}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <BadgeCheck className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">Роль</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs`}>
                    {userData?.role === 'admin' ? 'Администратор' : userData?.role || 'Не указано'}
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - информация об аккаунте */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium">Информация об аккаунте</h3>
              </div>

              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <KeyIcon className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">ID пользователя</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs font-mono overflow-auto truncate`}>
                    {userData?.uid || 'Не указано'}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">Дата создания</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs`}>
                    {userData?.createdAt || 'Не указано'}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                    <Label className="text-xs text-slate-500">Последний вход</Label>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-xs`}>
                    {userData?.lastSignInTime || 'Не указано'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Секция безопасности */}
          <div className="mt-4">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium">Безопасность аккаунта</h3>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p>
                В целях безопасности, изменение параметров учетной записи в демонстрационной версии ограничено.
                Для использования данного приложения используйте следующие учетные данные:
              </p>
              <div className={`mt-2 p-2.5 ${isDark ? 'bg-purple-950 border-purple-900' : 'bg-purple-50 border-purple-100'} rounded-md border`}>
                <p className="font-medium">Учетные данные администратора:</p>
                <p>Email: <span className="font-medium">admin@example.com</span></p>
                <p>Пароль: <span className="font-medium">111111</span></p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
