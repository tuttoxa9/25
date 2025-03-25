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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, User, Users, Badge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Employee } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'Имя должно содержать минимум 2 символа' }),
  lastName: z
    .string()
    .min(2, { message: 'Фамилия должна содержать минимум 2 символа' }),
  isActive: z
    .boolean()
    .default(true),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function EmployeesPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      isActive: true,
    },
  });

  const handleOpenDialog = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    if (employee) {
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        isActive: employee.isActive,
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          ...values,
        });
      } else {
        await addEmployee({
          ...values,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника:', error);
    }
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee(employeeToDelete.id);
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
    }
  };

  // Фильтрация сотрудников
  const filteredEmployees = employees.filter(employee => {
    return (
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск сотрудников..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Добавить сотрудника
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Фамилия</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading.employees ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Сотрудники не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.firstName}</TableCell>
                  <TableCell>{employee.lastName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(employee)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(employee)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно добавления/редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingEmployee ? (
                <>
                  <Badge className="h-5 w-5 text-blue-600" />
                  Редактирование сотрудника
                </>
              ) : (
                <>
                  <User className="h-5 w-5 text-blue-600" />
                  Добавление сотрудника
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? 'Измените информацию о сотруднике ниже.'
                : 'Заполните информацию для добавления нового сотрудника.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите имя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите фамилию" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'active')}
                      defaultValue={field.value ? 'active' : 'inactive'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Активен</SelectItem>
                        <SelectItem value="inactive">Неактивен</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Активные сотрудники будут отображаться в списке для записи.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  {editingEmployee ? 'Сохранить' : 'Добавить'}
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
            <AlertDialogTitle>Удаление сотрудника</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить сотрудника {employeeToDelete?.firstName} {employeeToDelete?.lastName}?
              <br /><br />
              Это действие нельзя отменить, и все связанные данные могут быть потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
