import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Search, Edit, Trash2, Package, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Service } from '@/types';
import { formatPrice } from '@/utils/validation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const serviceFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Название должно содержать минимум 3 символа' }),
  price: z
    .number({
      required_error: 'Введите цену',
      invalid_type_error: 'Введите числовое значение'
    })
    .min(0, { message: 'Цена не может быть отрицательной' })
    .or(z.string().transform(val => {
      const parsed = parseFloat(val.replace(',', '.'));
      if (isNaN(parsed)) return 0;
      return parsed;
    }))
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function ServicesPage() {
  const { services, loading, addService, updateService, deleteService } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Создаем форму
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      price: 0,
    },
  });

  // Фильтруем услуги по строке поиска
  const filteredServices = services.filter(service => {
    if (searchTerm === '') return !service.isDeleted;

    const searchLower = searchTerm.toLowerCase();
    return !service.isDeleted && service.name.toLowerCase().includes(searchLower);
  });

  // Открываем диалог для добавления услуги
  const openAddDialog = () => {
    setEditingService(null);
    form.reset({ name: '', price: 0 });
    setIsDialogOpen(true);
  };

  // Открываем диалог для редактирования услуги
  const openEditDialog = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      price: service.price,
    });
    setIsDialogOpen(true);
  };

  // Открытие диалога подтверждения удаления
  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  // Обработка отправки формы
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (editingService) {
        // Редактирование существующей услуги
        await updateService(editingService.id, data);
      } else {
        // Добавление новой услуги
        await addService(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении услуги:', error);
    }
  };

  // Обработка удаления услуги
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete.id);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении услуги:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск услуг..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAddDialog} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Добавить услугу
        </Button>
      </div>

      {loading.services ? (
        <div className="flex items-center justify-center p-8">
          <span>Загрузка...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <h3 className="mt-4 text-lg font-medium">Нет услуг</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm ? 'По вашему запросу ничего не найдено' : 'Добавьте услуги автомойки'}
          </p>
          {!searchTerm && (
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Добавить услугу
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(service.price)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактировать</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(service)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Удалить</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Модальное окно добавления/редактирования услуги */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingService ? (
                <>
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Редактирование услуги
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 text-green-600" />
                  Добавление услуги
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Измените информацию об услуге ниже.'
                : 'Заполните информацию для добавления новой услуги.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название услуги</FormLabel>
                    <FormControl>
                      <Input placeholder="Название услуги" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Цена (BYN)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                          {...field}
                          value={field.value || ''}
                          className="pl-7"
                        />
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Цена в белорусских рублях (BYN)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading.services}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading.services}>
                  {editingService ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление услуги</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить услугу <span className="font-medium">"{serviceToDelete?.name}"</span>?
              <br /><br />
              Это действие нельзя отменить, и услуга будет удалена из всех записей.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
