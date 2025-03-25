import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, Key, ExternalLink, RotateCw } from 'lucide-react';
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

export function WeatherApiForm({ className, initialApiKey = 'f6f6c5a0c1f1413ab48200836252403', onApiKeyChange }: WeatherApiFormProps) {
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Minsk&aqi=no`
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
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
          <div className={`${isDark ? 'bg-slate-800 border-emerald-900' : 'bg-white border-emerald-100'} p-5 rounded-lg border shadow-sm`}>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
                    Weather API Key
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Введите API ключ..."
                        type={showApiKey ? 'text' : 'password'}
                        className={`pr-10 ${isDark
                          ? 'bg-slate-700 border-emerald-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                          : 'bg-white border-emerald-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`absolute right-0 top-0 h-full px-3 py-2 ${isDark
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-slate-400 hover:text-slate-700'
                      }`}
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <motion.div
            className="flex justify-end"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className={`${isDark ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
              disabled={isSaving}
            >
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
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
