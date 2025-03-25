import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Timestamp, doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import {
  appointmentService,
  employeeService,
  serviceService,
  organizationService,
  notificationService
} from '@/lib/firebase/services';
import {
  Appointment,
  Employee,
  Service,
  Organization,
  Notification
} from '@/types';
import { subscribeToAuthChanges, signOut, getCurrentUser } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/config';

interface Statistics {
  totalEarnings: number; // Общий доход
  completedAppointments: number; // Количество выполненных записей
  todayEarnings: number; // Доход за сегодня
  todayCompletedAppointments: number; // Количество выполненных записей за сегодня
  dailyStats: {
    [date: string]: {
      earnings: number;
      count: number;
    }
  };
}

interface AppContextType {
  // Данные
  appointments: Appointment[];
  employees: Employee[];
  services: Service[];
  organizations: Organization[];
  notifications: Notification[];
  statistics: Statistics;
  isAuthenticated: boolean; // Добавляем состояние аутентификации

  // Методы для аутентификации
  setIsAuthenticated: (value: boolean) => void;
  logout: () => Promise<boolean>;

  // Флаги загрузки
  loading: {
    appointments: boolean;
    employees: boolean;
    services: boolean;
    organizations: boolean;
    notifications: boolean;
  };

  // Методы для записей
  fetchAppointments: () => Promise<void>;
  getAppointmentsByDate: (date: Date) => Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<Appointment>;
  deleteAppointment: (id: string) => Promise<string>;

  // Методы для сотрудников
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<string>; // Мягкое удаление

  // Методы для услуг
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (id: string, data: Partial<Service>) => Promise<Service>;
  deleteService: (id: string) => Promise<string>; // Мягкое удаление

  // Методы для организаций
  fetchOrganizations: () => Promise<void>;
  addOrganization: (organization: Omit<Organization, 'id'>) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<string>; // Мягкое удаление

  // Методы для уведомлений
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<Notification>;
  markNotificationAsRead: (id: string) => Promise<Notification>;
  markAllNotificationsAsRead: () => Promise<number>;
  clearNotifications: () => Promise<number>;
  getUnreadNotificationsCount: () => number;

  // Методы для статистики
  getTodayStatistics: () => { earnings: number; count: number };
  getAllTimeStatistics: () => { earnings: number; count: number };

  // Метод для удаления всех данных
  deleteAllData: () => Promise<void>;
}

// Создаем контекст с начальными значениями
const AppContext = createContext<AppContextType | null>(null);

// Хук для использования контекста
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext должен использоваться внутри AppProvider');
  }
  return context;
};

// Провайдер контекста
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Состояния для данных
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Состояние для статистики
  const [statistics, setStatistics] = useState<Statistics>({
    totalEarnings: 0,
    completedAppointments: 0,
    todayEarnings: 0,
    todayCompletedAppointments: 0,
    dailyStats: {}
  });

  // Состояния для флагов загрузки
  const [loading, setLoading] = useState({
    appointments: false,
    employees: false,
    services: false,
    organizations: false,
    notifications: false
  });

  // Состояние аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Загружаем данные при монтировании компонента если пользователь аутентифицирован
  useEffect(() => {
    if (isAuthenticated) {
      // Если пользователь авторизован, загружаем данные
      fetchEmployees();
      fetchServices();
      fetchOrganizations();
      fetchAppointments();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Проверяем статус авторизации при загрузке
  useEffect(() => {
    try {
      // Сразу проверим текущего пользователя
      const currentUser = getCurrentUser();
      if (currentUser) {
        console.log('AppContext: Пользователь уже аутентифицирован:', currentUser.email);
        setIsAuthenticated(true);
      } else {
        console.log('AppContext: Пользователь не аутентифицирован');
        setIsAuthenticated(false);
      }

      // Подписываемся на изменения статуса аутентификации в Firebase
      const unsubscribe = subscribeToAuthChanges((user) => {
        console.log('AppContext: Статус аутентификации изменился:', !!user, user?.email);
        setIsAuthenticated(user !== null);
      });

      // Отписываемся при размонтировании
      return () => unsubscribe();
    } catch (error) {
      console.error('AppContext: Ошибка при инициализации аутентификации:', error);
      // В случае ошибки Firebase, считаем пользователя неавторизованным
      setIsAuthenticated(false);
    }
  }, []);

  // Функция выхода из системы
  const logout = async () => {
    try {
      // Пытаемся выйти через Firebase
      try {
        await signOut();
      } catch (error) {
        console.error('Ошибка при выходе из Firebase:', error);
      }

      // В любом случае, сбрасываем состояние аутентификации
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      return false;
    }
  };

  // Обновляем состояние статистики при загрузке записей
  const updateStatistics = (appointments: Appointment[]) => {
    let totalEarnings = 0;
    let completedAppointments = 0;
    let todayEarnings = 0;
    let todayCompletedAppointments = 0;
    const dailyStats: { [date: string]: { earnings: number; count: number } } = {};

    // Получаем сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    appointments.forEach(appointment => {
      if (appointment.status === 'completed') {
        // Обновляем общую статистику
        totalEarnings += appointment.totalPrice;
        completedAppointments++;

        // Получаем дату записи в формате YYYY-MM-DD
        const appointmentDate = appointment.date.toDate();
        const dateString = appointmentDate.toISOString().split('T')[0];

        // Проверяем, является ли запись сегодняшней
        if (appointmentDate >= today && appointmentDate < new Date(today.getTime() + 86400000)) {
          todayEarnings += appointment.totalPrice;
          todayCompletedAppointments++;
        }

        // Обновляем статистику по дням
        if (!dailyStats[dateString]) {
          dailyStats[dateString] = { earnings: 0, count: 0 };
        }
        dailyStats[dateString].earnings += appointment.totalPrice;
        dailyStats[dateString].count++;
      }
    });

    setStatistics({
      totalEarnings,
      completedAppointments,
      todayEarnings,
      todayCompletedAppointments,
      dailyStats
    });
  };

  // Функция для удаления всех данных
  const deleteAllData = async () => {
    try {
      setLoading(prev => ({
        ...prev,
        appointments: true,
        employees: true,
        services: true,
        organizations: true,
        notifications: true
      }));

      // Удаление всех записей
      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      const appointmentsBatch = writeBatch(db);
      appointmentsSnapshot.forEach(doc => {
        appointmentsBatch.delete(doc.ref);
      });
      await appointmentsBatch.commit();

      // Удаление всех сотрудников
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeesBatch = writeBatch(db);
      employeesSnapshot.forEach(doc => {
        employeesBatch.delete(doc.ref);
      });
      await employeesBatch.commit();

      // Удаление всех услуг
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesBatch = writeBatch(db);
      servicesSnapshot.forEach(doc => {
        servicesBatch.delete(doc.ref);
      });
      await servicesBatch.commit();

      // Удаление всех организаций
      const organizationsSnapshot = await getDocs(collection(db, 'organizations'));
      const organizationsBatch = writeBatch(db);
      organizationsSnapshot.forEach(doc => {
        organizationsBatch.delete(doc.ref);
      });
      await organizationsBatch.commit();

      // Удаление всех уведомлений
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      const notificationsBatch = writeBatch(db);
      notificationsSnapshot.forEach(doc => {
        notificationsBatch.delete(doc.ref);
      });
      await notificationsBatch.commit();

      // Обновляем состояние
      setAppointments([]);
      setEmployees([]);
      setServices([]);
      setOrganizations([]);
      setNotifications([]);
      setStatistics({
        totalEarnings: 0,
        completedAppointments: 0,
        todayEarnings: 0,
        todayCompletedAppointments: 0,
        dailyStats: {}
      });

      // Добавляем уведомление о успешном удалении
      const notification: Notification = {
        id: 'system-reset-' + Date.now(),
        title: 'Сброс данных',
        message: 'Все данные приложения были успешно удалены',
        timestamp: Timestamp.now(),
        isRead: false,
        type: 'warning'
      };

      await notificationService.add(notification);
      setNotifications([notification]);

    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      throw error;
    } finally {
      setLoading(prev => ({
        ...prev,
        appointments: false,
        employees: false,
        services: false,
        organizations: false,
        notifications: false
      }));
    }
  };

  // Методы для загрузки данных

  // Загрузка записей
  const fetchAppointments = async () => {
    setLoading(prev => ({ ...prev, appointments: true }));
    try {
      const data = await appointmentService.getAll();
      const appointmentsData = data as Appointment[];
      setAppointments(appointmentsData);

      // Обновляем статистику
      updateStatistics(appointmentsData);
    } catch (error) {
      console.error('Ошибка при загрузке записей:', error);
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  // Загрузка сотрудников
  const fetchEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const data = await employeeService.getAll();
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  // Загрузка услуг
  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const data = await serviceService.getAll();
      setServices(data as Service[]);
    } catch (error) {
      console.error('Ошибка при загрузке услуг:', error);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  // Загрузка организаций
  const fetchOrganizations = async () => {
    setLoading(prev => ({ ...prev, organizations: true }));
    try {
      const data = await organizationService.getAll();
      setOrganizations(data as Organization[]);
    } catch (error) {
      console.error('Ошибка при загрузке организаций:', error);
    } finally {
      setLoading(prev => ({ ...prev, organizations: false }));
    }
  };

  // Загрузка уведомлений
  const fetchNotifications = async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const data = await notificationService.getAll();
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  // Методы для работы с записями

  // Получение записей по дате
  const getAppointmentsByDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return appointments.filter(appointment => {
      const appointmentDate = appointment.date.toDate();
      return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
    });
  };

  // Добавление записи
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      console.log("AppContext: Добавление новой записи:", appointment);

      // Проверяем обязательные поля
      if (!appointment.date) {
        throw new Error("Не указана дата записи");
      }

      if (!appointment.services || appointment.services.length === 0) {
        throw new Error("Не выбраны услуги");
      }

      // Создаем объект для записи в Firebase
      const appointmentData: any = {
        date: appointment.date,
        clientType: appointment.clientType || 'individual',
        carNumber: appointment.carNumber || '',
        phoneNumber: appointment.phoneNumber || '',
        carModel: appointment.carModel || '',
        notes: appointment.notes || '',
        employeeIds: Array.isArray(appointment.employeeIds) ? appointment.employeeIds : [],
        status: appointment.status || 'pending',
        totalPrice: Number(appointment.totalPrice) || 0,
        services: appointment.services.map(service => ({
          serviceId: service.serviceId,
          name: service.name,
          price: service.price,
          quantity: service.quantity
        }))
      };

      // Добавляем organizationId только если это организация и id не пустой
      if (appointment.clientType === 'organization' && appointment.organizationId) {
        appointmentData.organizationId = appointment.organizationId;
      } else {
        // Для физических лиц используем null вместо undefined
        appointmentData.organizationId = null;
      }

      // Добавляем запись в Firebase
      console.log("AppContext: Отправка данных в Firebase:", appointmentData);
      const newAppointment = await appointmentService.add(appointmentData);
      console.log("AppContext: Получен ответ от Firebase:", newAppointment);

      // Обновляем локальное состояние
      setAppointments(prev => [...prev, newAppointment as Appointment]);
      // Обновляем статистику
      updateStatistics([...appointments, newAppointment as Appointment]);
      return newAppointment as Appointment;
    } catch (error) {
      console.error("AppContext: Ошибка при добавлении записи:", error);
      throw error;
    }
  };

  // Обновление записи
  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      const updatedAppointment = await appointmentService.update(id, data);

      // Обновляем локальное состояние записей
      const updatedAppointments = appointments.map(item =>
        item.id === id ? { ...item, ...data } as Appointment : item
      );
      setAppointments(updatedAppointments);

      // Обновляем статистику если изменился статус
      if (data.status === 'completed' || updatedAppointments.find(a => a.id === id)?.status === 'completed') {
        updateStatistics(updatedAppointments);
      }

      // Если статус изменился на "completed", создаем уведомление
      const appointment = appointments.find(a => a.id === id);
      if (data.status === 'completed' && appointment?.status !== 'completed') {
        // Создаем новое уведомление
        await addNotification({
          title: 'Запись выполнена',
          message: `Сумма ${appointment?.totalPrice.toFixed(2)} BYN добавлена в статистику.`,
          type: 'success',
          isRead: false,
          timestamp: Timestamp.now()
        });
      }

      return updatedAppointment as Appointment;
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
      throw error;
    }
  };

  // Удаление записи
  const deleteAppointment = async (id: string) => {
    try {
      await appointmentService.delete(id);

      // Получаем удаляемую запись
      const deletedAppointment = appointments.find(a => a.id === id);

      // Обновляем локальное состояние
      const updatedAppointments = appointments.filter(item => item.id !== id);
      setAppointments(updatedAppointments);

      // Обновляем статистику если удаляется выполненная запись
      if (deletedAppointment?.status === 'completed') {
        updateStatistics(updatedAppointments);
      }

      return id;
    } catch (error) {
      console.error("Ошибка при удалении записи:", error);
      throw error;
    }
  };

  // Методы для работы с сотрудниками

  // Добавление сотрудника
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee = await employeeService.add(employee);
    setEmployees(prev => [...prev, newEmployee as Employee]);
    return newEmployee as Employee;
  };

  // Обновление сотрудника
  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    const updatedEmployee = await employeeService.update(id, data);
    setEmployees(prev =>
      prev.map(item => item.id === id ? { ...item, ...data } as Employee : item)
    );
    return updatedEmployee as Employee;
  };

  // Мягкое удаление сотрудника
  const deleteEmployee = async (id: string) => {
    await employeeService.update(id, { isDeleted: true });
    setEmployees(prev =>
      prev.map(item => item.id === id ? { ...item, isDeleted: true } as Employee : item)
    );
    return id;
  };

  // Методы для работы с услугами

  // Добавление услуги
  const addService = async (service: Omit<Service, 'id'>) => {
    const newService = await serviceService.add(service);
    setServices(prev => [...prev, newService as Service]);
    return newService as Service;
  };

  // Обновление услуги
  const updateService = async (id: string, data: Partial<Service>) => {
    const updatedService = await serviceService.update(id, data);
    setServices(prev =>
      prev.map(item => item.id === id ? { ...item, ...data } as Service : item)
    );
    return updatedService as Service;
  };

  // Мягкое удаление услуги
  const deleteService = async (id: string) => {
    await serviceService.update(id, { isDeleted: true });
    setServices(prev =>
      prev.map(item => item.id === id ? { ...item, isDeleted: true } as Service : item)
    );
    return id;
  };

  // Методы для работы с организациями

  // Добавление организации
  const addOrganization = async (organization: Omit<Organization, 'id'>) => {
    const newOrganization = await organizationService.add(organization);
    setOrganizations(prev => [...prev, newOrganization as Organization]);
    return newOrganization as Organization;
  };

  // Обновление организации
  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    const updatedOrganization = await organizationService.update(id, data);
    setOrganizations(prev =>
      prev.map(item => item.id === id ? { ...item, ...data } as Organization : item)
    );
    return updatedOrganization as Organization;
  };

  // Мягкое удаление организации
  const deleteOrganization = async (id: string) => {
    await organizationService.update(id, { isDeleted: true });
    setOrganizations(prev =>
      prev.map(item => item.id === id ? { ...item, isDeleted: true } as Organization : item)
    );
    return id;
  };

  // Методы для работы с уведомлениями

  // Добавление уведомления
  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    const newNotification = await notificationService.add(notification);
    setNotifications(prev => [newNotification as Notification, ...prev]);
    return newNotification as Notification;
  };

  // Отметить уведомление как прочитанное
  const markNotificationAsRead = async (id: string) => {
    const updatedNotification = await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(item => item.id === id ? { ...item, isRead: true } as Notification : item)
    );
    return updatedNotification as Notification;
  };

  // Отметить все уведомления как прочитанные
  const markAllNotificationsAsRead = async () => {
    const count = await notificationService.markAllAsRead();
    setNotifications(prev =>
      prev.map(item => ({ ...item, isRead: true }))
    );
    return count;
  };

  // Очистить все уведомления
  const clearNotifications = async () => {
    const count = await notificationService.deleteAll();
    setNotifications([]);
    return count;
  };

  // Получить количество непрочитанных уведомлений
  const getUnreadNotificationsCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  // Методы для получения статистики
  const getTodayStatistics = () => {
    return {
      earnings: statistics.todayEarnings,
      count: statistics.todayCompletedAppointments
    };
  };

  const getAllTimeStatistics = () => {
    return {
      earnings: statistics.totalEarnings,
      count: statistics.completedAppointments
    };
  };

  const contextValue: AppContextType = {
    // Данные
    appointments,
    employees,
    services,
    organizations,
    notifications,
    statistics,
    isAuthenticated,

    // Методы для аутентификации
    setIsAuthenticated,
    logout,

    // Флаги загрузки
    loading,

    // Методы для записей
    fetchAppointments,
    getAppointmentsByDate,
    addAppointment,
    updateAppointment,
    deleteAppointment,

    // Методы для сотрудников
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // Методы для услуг
    fetchServices,
    addService,
    updateService,
    deleteService,

    // Методы для организаций
    fetchOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,

    // Методы для уведомлений
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    getUnreadNotificationsCount,

    // Методы для статистики
    getTodayStatistics,
    getAllTimeStatistics,

    // Метод для удаления всех данных
    deleteAllData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
