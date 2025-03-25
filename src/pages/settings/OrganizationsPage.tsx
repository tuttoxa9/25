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
import { Plus, Search, Edit, Trash2, Building2, Phone, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Organization } from '@/types';
import { formatPhoneNumber, phoneNumberSchema } from '@/utils/validation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const organizationFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Название должно содержать минимум 2 символа' }),
  contactPerson: z
    .string()
    .optional(),
  phoneNumber: z
    .string()
    .optional()
    .transform(val => val ? formatPhoneNumber(val) : undefined)
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export function OrganizationsPage() {
  const { organizations, loading, addOrganization, updateOrganization, deleteOrganization } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);

  // Создаем форму
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phoneNumber: '',
    },
  });

  // Фильтруем организации по строке поиска
  const filteredOrganizations = organizations.filter(organization => {
    if (searchTerm === '') return !organization.isDeleted;

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = organization.name.toLowerCase().includes(searchLower);
    const contactMatch = organization.contactPerson
      ? organization.contactPerson.toLowerCase().includes(searchLower)
      : false;

    return !organization.isDeleted && (nameMatch || contactMatch);
  });

  // Открываем диалог для добавления организации
  const openAddDialog = () => {
    setEditingOrganization(null);
    form.reset({ name: '', contactPerson: '', phoneNumber: '' });
    setIsDialogOpen(true);
  };

  // Открываем диалог для редактирования организации
  const openEditDialog = (organization: Organization) => {
    setEditingOrganization(organization);
    form.reset({
      name: organization.name,
      contactPerson: organization.contactPerson || '',
      phoneNumber: organization.phoneNumber || '',
    });
    setIsDialogOpen(true);
  };

  // Открытие диалога подтверждения удаления
  const openDeleteDialog = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setIsDeleteDialogOpen(true);
  };

  // Обработка отправки формы
  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      if (editingOrganization) {
        // Редактирование существующей организации
        await updateOrganization(editingOrganization.id, data);
      } else {
        // Добавление новой организации
        await addOrganization(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении организации:', error);
    }
  };

  // Обработка удаления организации
  const handleDeleteOrganization = async () => {
    if (!organizationToDelete) return;

    try {
      await deleteOrganization(organizationToDelete.id);
      setIsDeleteDialogOpen(false);
      setOrganizationToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении организации:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск организаций..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAddDialog} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Добавить организацию
        </Button>
      </div>

      {loading.organizations ? (
        <div className="flex items-center justify-center p-8">
          <span>Загрузка...</span>
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <h3 className="mt-4 text-lg font-medium">Нет организаций</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm ? 'По вашему запросу ничего не найдено' : 'Добавьте организации-партнеры'}
          </p>
          {!searchTerm && (
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Добавить организацию
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Контактное лицо</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell className="font-medium">{organization.name}</TableCell>
                  <TableCell>{organization.contactPerson || '—'}</TableCell>
                  <TableCell>{organization.phoneNumber || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(organization)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактировать</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(organization)}
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

      {/* Модальное окно добавления/редактирования организации */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingOrganization ? (
                <>
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Редактирование организации
                </>
              ) : (
                <>
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Добавление организации
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingOrganization
                ? 'Измените информацию об организации ниже.'
                : 'Заполните информацию для добавления новой организации.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название организации</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Название организации" {...field} className="pl-8" />
                        <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Контактное лицо</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="ФИО контактного лица" {...field} className="pl-8" />
                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер телефона</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="+375 (XX) XXX-XX-XX" {...field} className="pl-8" />
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Номер должен быть в формате: +375 (XX) XXX-XX-XX
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading.organizations}>
                  Отмена
                </Button>
                <Button type="submit" disabled={loading.organizations}>
                  {editingOrganization ? 'Сохранить' : 'Добавить'}
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
            <AlertDialogTitle>Удаление организации</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить организацию <span className="font-medium">"{organizationToDelete?.name}"</span>?
              <br /><br />
              Это действие нельзя отменить, и организация будет удалена из всех связанных записей.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
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
