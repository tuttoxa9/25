import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Database, Shield, RotateCw, Check, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

interface ApiDataManagementProps {
  className?: string;
  onDeleteConfirmed: () => Promise<void>;
}

export function ApiDataManagement({ className, onDeleteConfirmed }: ApiDataManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleDeleteConfirm = async () => {
    if (confirmationText !== 'УДАЛИТЬ') {
      toast({
        title: "Ошибка подтверждения",
        description: "Введите УДАЛИТЬ для подтверждения операции",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteConfirmed();
      setIsDialogOpen(false);
      setConfirmationText('');
      toast({
        title: "Данные удалены",
        description: "Все API данные были успешно удалены",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении",
        description: error instanceof Error ? error.message : "Не удалось удалить данные API",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br shadow-lg",
        isDark
          ? "border-red-900/30 from-red-950/20 to-slate-900/40"
          : "border-red-200 from-red-50/50 to-white",
        className
      )}>
        {/* Фоновая анимация */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, var(--red-500) 0%, transparent 70%)",
              "radial-gradient(circle at 50% 80%, var(--red-500) 0%, transparent 70%)",
              "radial-gradient(circle at 80% 40%, var(--red-500) 0%, transparent 70%)",
              "radial-gradient(circle at 20% 30%, var(--red-500) 0%, transparent 70%)"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 p-5">
          <div className="flex items-start mb-4">
            <div className={cn(
              "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg mr-4",
              isDark ? "bg-red-900/70 text-red-400" : "bg-red-100 text-red-700"
            )}>
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h3 className={cn(
                "text-base font-semibold",
                isDark ? "text-red-300" : "text-red-700"
              )}>
                Управление данными API
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
                Эта секция содержит опасные операции, которые могут привести к потере данных
              </p>
            </div>
          </div>

          <div className={cn(
            "p-4 rounded-lg border mb-4",
            isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg",
                isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-700"
              )}>
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium">
                  Кэшированные данные API
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Удаление сохраненных запросов и ответов API
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="destructive"
                  size="sm"
                  className={cn(
                    "relative overflow-hidden",
                    isDark ? "bg-red-800 hover:bg-red-700" : ""
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Очистить данные API</span>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Для выполнения операций требуется дополнительное подтверждение</span>
          </div>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "sm:max-w-md border-2",
          isDark ? "border-red-900/50 bg-slate-900" : "border-red-300/50"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Подтверждение удаления данных API
            </DialogTitle>
            <DialogDescription>
              Вы собираетесь удалить все кэшированные данные API. Эта операция не может быть отменена.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <div className="mb-4">
              <Label htmlFor="confirmation" className="text-sm font-medium mb-1.5 block">
                Введите УДАЛИТЬ для подтверждения операции:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className={cn(
                  "border-2",
                  isDark ? "bg-slate-800 border-slate-700" : "border-slate-200",
                  confirmationText === 'УДАЛИТЬ' && (isDark ? "border-green-700" : "border-green-600")
                )}
              />
            </div>

            <AnimatePresence>
              {confirmationText === 'УДАЛИТЬ' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded-md mb-4",
                    isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-600"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Подтверждение принято, можно продолжить</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className={isDark ? "border-slate-700 hover:bg-slate-800 hover:text-slate-100" : ""}
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmationText !== 'УДАЛИТЬ' || isDeleting}
              onClick={handleDeleteConfirm}
              className={isDark ? "bg-red-800 hover:bg-red-700" : ""}
            >
              {isDeleting ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить данные
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
