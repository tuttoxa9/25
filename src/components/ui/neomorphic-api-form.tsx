import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';
import { NeomorphicButton } from './neomorphic-button';
import { NeomorphicInput } from './neomorphic-input';

// Валидационная схема для API ключа
const formSchema = z.object({
  apiKey: z.string().min(10, {
    message: 'Минимум 10 символов',
  }),
});

type ApiFormValues = z.infer<typeof formSchema>;

interface NeomorphicApiFormProps {
  apiName: string;
  initialApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
  className?: string;
  color?: 'blue' | 'green' | 'purple';
  helpUrl?: string;
}

export function NeomorphicApiForm({
  apiName,
  initialApiKey = 'f6f6c5a0c1f1413ab48200836252403',
  onApiKeyChange,
  className,
  color = 'blue',
  helpUrl,
}: NeomorphicApiFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();
  const { addNotification } = useAppContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ApiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: initialApiKey,
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
      return { success: false, error };
    }
  };

  async function onSubmit(values: ApiFormValues) {
    setIsSaving(true);
    try {
      // Проверяем ключ перед сохранением
      const testResult = await testApiKey(values.apiKey);

      if (!testResult.success) {
        toast({
          title: 'Ошибка проверки ключа',
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
        variant: 'default',
      });

      // Добавляем уведомление в систему
      await addNotification({
        title: `API ключ ${apiName} обновлен`,
        message: `Ключ ${apiName} обновлен`,
        type: 'success',
        isRead: false,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cn('mb-3', className)}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center mb-2">
          <Key className={cn(
            'h-3.5 w-3.5 mr-1.5 flex-shrink-0',
            isDark
              ? `text-${color}-400`
              : `text-${color}-600`
          )} />
          <p className="text-xs text-slate-500">API ключ для доступа к сервису</p>
        </div>

        <div className="relative">
          <NeomorphicInput
            label=""
            id="apiKey"
            type={showApiKey ? 'text' : 'password'}
            fullWidth
            placeholder="Введите API ключ..."
            error={form.formState.errors.apiKey?.message}
            {...form.register('apiKey')}
            endIcon={
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>

        <div className="flex justify-end mt-2">
          <NeomorphicButton
            type="submit"
            color={color}
            disabled={isSaving}
            isLoading={isSaving}
            compact
            size="xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Сохранить ключ
          </NeomorphicButton>
        </div>
      </form>
    </div>
  );
}
