import { Timestamp } from 'firebase/firestore';

// Базовый тип для всех сущностей
export interface BaseEntity {
  id: string;
}

// Тип для сотрудника
export interface Employee extends BaseEntity {
  firstName: string;
  lastName: string;
  isActive?: boolean; // Активен ли сотрудник
  isDeleted?: boolean;
}

// Тип для услуги
export interface Service extends BaseEntity {
  name: string;
  price: number; // Цена в BYN
  isDeleted?: boolean;
}

// Тип для организации
export interface Organization extends BaseEntity {
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  isDeleted?: boolean;
}

// Тип для записи на обслуживание
export interface Appointment extends BaseEntity {
  date: Timestamp; // Дата и время записи
  clientType: 'individual' | 'organization'; // Тип клиента
  organizationId?: string | null; // ID организации, если clientType === 'organization'
  carNumber: string; // Номер автомобиля
  phoneNumber: string; // Номер телефона
  carModel?: string; // Марка/модель автомобиля
  services: AppointmentService[]; // Список услуг
  totalPrice: number; // Итоговая стоимость в BYN
  employeeIds: string[]; // ID сотрудников, обслуживающих запись
  status: 'pending' | 'completed' | 'cancelled'; // Статус записи
  notes?: string; // Примечания
}

// Тип для услуги в записи
export interface AppointmentService {
  serviceId: string;
  name: string; // Название услуги (может быть другим, если услуга была удалена)
  price: number; // Цена услуги на момент записи
  quantity: number; // Количество услуг
}

// Тип для уведомления
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: Timestamp;
}

// Тип для отчета по сотруднику
export interface EmployeeReport {
  employeeId: string;
  employee: Employee;
  totalEarnings: number; // Общая сумма в BYN
  appointmentsCount: number; // Количество записей
  appointmentDetails: {
    id: string;
    date: Timestamp;
    services: AppointmentService[];
    earnings: number;
  }[];
}

// Тип для общего отчета
export interface GeneralReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalEarnings: number; // Общая сумма в BYN
  appointmentsCount: number; // Количество записей
  employeeStats: {
    employeeId: string;
    employeeName: string;
    earnings: number;
    appointmentsCount: number;
  }[];
  serviceStats: {
    serviceId: string;
    serviceName: string;
    count: number;
    earnings: number;
  }[];
}
