import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, EyeOff, Key, ExternalLink, RotateCw, Link, ShieldCheck, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

// Валидационная схема для API ключа
const formSchema = z.object({
  apiKey: z.string().min(10, {
    message: 'API ключ должен содержать минимум 10 символов',
  }),
});

type WeatherFormValues = z.infer<typeof formSchema>;

interface WeatherApiFormProps {
  className?: string;
  initialApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
}

export function WeatherApiFormNew({ className, initialApiKey = 'f6f6c5a0c1f1413ab48200836252403', onApiKeyChange }: WeatherApiFormProps) {
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyState, setKeyState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showHint, setShowHint] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const form = useForm<WeatherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: initialApiKey || '',
    },
  });

  // Проверка ключа
  const testApiKey = async (apiKey: string) => {
    try {
      setKeyState('testing');
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Minsk&aqi=no`
      );

      if (!response.ok) {
        setKeyState('error');
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      setKeyState('success');
      return { success: true, data };
    } catch (error) {
      setKeyState('error');
      console.error('Ошибка при проверке API ключа:', error);
      return { success: false, error };
    }
  };

  async function onSubmit(values: WeatherFormValues) {
    setIsSaving(true);
    try {
      // Проверяем ключ перед сохранением
      const testResult = await testApiKey(values.apiKey);

      if (!testResult.success) {
        toast({
          title: 'Ошибка проверки ключа',
          description: 'Невозможно подключиться к сервису погоды с этим ключом',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // Вызываем callback с новым значением API ключа
      onApiKeyChange?.(values.apiKey);

      // Показываем уведомление об успешном сохранении
      toast({
        title: 'API ключ сохранен',
        description: 'Новый ключ API погоды успешно сохранен и проверен',
        variant: 'default',
      });

      // Добавляем уведомление в систему
      await addNotification({
        title: "API ключ погоды обновлен",
        message: `Ключ погоды был успешно обновлен и проверен`,
        type: "success",
        isRead: false,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить API ключ',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-xl border bg-gradient-to-br shadow-lg p-6",
              isDark
                ? "border-emerald-800/30 from-emerald-950/10 to-slate-900/30"
                : "border-emerald-200/70 from-emerald-50/50 to-white"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Фоновая анимация */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 30%, var(--emerald-400) 0%, transparent 70%)",
                  "radial-gradient(circle at 50% 80%, var(--emerald-500) 0%, transparent 70%)",
                  "radial-gradient(circle at 80% 40%, var(--emerald-400) 0%, transparent 70%)",
                  "radial-gradient(circle at 20% 30%, var(--emerald-400) 0%, transparent 70%)"
                ]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg mr-3",
                  isDark ? "bg-emerald-900/70 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                )}>
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={cn(
                    "text-base font-semibold",
                    isDark ? "text-emerald-300" : "text-emerald-700"
                  )}>
                    API ключ Weather
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} opacity-80`}>
                    Используется для доступа к сервису погоды
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1.5">
                        <FormLabel className={cn(
                          "text-sm font-medium flex items-center",
                          isDark ? "text-slate-300" : "text-slate-700"
                        )}>
                          <Key className="h-3.5 w-3.5 mr-1.5" />
                          Ключ доступа
                        </FormLabel>

                        {/* Индикатор состояния ключа */}
                        <AnimatePresence mode="wait">
                          {keyState === 'success' && (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="flex items-center text-xs text-green-500"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              <span>Ключ действителен</span>
                            </motion.div>
                          )}
                          {keyState === 'testing' && (
                            <motion.div
                              key="testing"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="flex items-center text-xs text-blue-500"
                            >
                              <RotateCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                              <span>Проверка ключа...</span>
                            </motion.div>
                          )}
                          {keyState === 'error' && (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="flex items-center text-xs text-red-500"
                            >
                              <span>Недействительный ключ</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative group">
                        <FormControl>
                          <Input
                            placeholder="Введите API ключ..."
                            type={showApiKey ? 'text' : 'password'}
                            className={cn(
                              "pr-20 transition-all duration-200 border-2",
                              isDark
                                ? "bg-slate-800 border-emerald-800/50 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-slate-500"
                                : "bg-white border-emerald-200/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400",
                              keyState === 'success' && (isDark ? "border-green-700" : "border-green-500"),
                              keyState === 'error' && (isDark ? "border-red-700" : "border-red-500")
                            )}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setKeyState('idle');
                            }}
                          />
                        </FormControl>

                        <div className="absolute right-1 top-1 h-8 flex items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7 rounded-full",
                              isDark
                                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            )}
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>

                          <div className="h-5 border-r border-slate-300 dark:border-slate-600 mx-1"></div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7 rounded-full",
                              isDark
                                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/40"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                            )}
                            onClick={() => setShowHint(!showHint)}
                          >
                            <Link className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <FormMessage />

                      {/* Подсказка по получению ключа */}
                      <AnimatePresence>
                        {showHint && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className={cn(
                              "mt-2 text-xs rounded-lg p-3 border",
                              isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            )}>
                              <p className="mb-2">
                                Для получения API ключа необходимо:
                              </p>
                              <ol className="list-decimal pl-5 space-y-1 mb-2">
                                <li>Зарегистрироваться на сайте WeatherAPI.com</li>
                                <li>Подтвердить адрес электронной почты</li>
                                <li>Перейти в раздел "My Account" и скопировать ключ API</li>
                              </ol>
                              <div className="flex justify-end">
                                <a
                                  href="https://www.weatherapi.com/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "inline-flex items-center text-xs font-medium",
                                    isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                                  )}
                                >
                                  <span>Перейти на сайт</span>
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className={cn(
                  "relative overflow-hidden group",
                  isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700",
                  "text-white"
                )}
                disabled={isSaving}
              >
                <span className="relative z-10 flex items-center">
                  {isSaving ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Проверка и сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить API ключ
                    </>
                  )}
                </span>

                {/* Button background effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"
                  initial={{ x: '100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
    </div>
  );
}
