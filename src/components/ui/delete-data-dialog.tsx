import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface DeleteDataDialogProps {
  onDeleteConfirmed: () => Promise<void>;
  buttonClassName?: string;
}

export function DeleteDataDialog({ onDeleteConfirmed, buttonClassName }: DeleteDataDialogProps) {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();
  const requiredPassword = '111111';

  const handleDelete = async () => {
    if (password !== requiredPassword) {
      setPasswordError('Неверный пароль');
      return;
    }

    setIsDeleting(true);
    setPasswordError('');

    try {
      await onDeleteConfirmed();
      toast({
        title: 'Данные удалены',
        description: 'Все данные были успешно удалены',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить данные',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setPassword('');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className={buttonClassName}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить все данные
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Удаление всех данных
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-700">
            Это действие приведет к полному удалению всех данных.
            Восстановление будет невозможно. Для подтверждения введите пароль.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-4">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Пароль для подтверждения</span>
            </div>
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Введите пароль для подтверждения"
                className={`pr-10 ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {passwordError}
              </motion.p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={!password || isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </motion.div>
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить все данные
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
