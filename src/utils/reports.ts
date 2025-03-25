import { Timestamp } from 'firebase/firestore';
import {
  Appointment,
  Employee,
  Service,
  EmployeeReport,
  GeneralReport
} from '@/types';

/**
 * Генерирует отчет по сотруднику за указанный период
 */
export const generateEmployeeReport = (
  employee: Employee,
  appointments: Appointment[],
  startDate: Date,
  endDate: Date
): EmployeeReport => {
  // Фильтруем записи за указанный период, которые обслуживал данный сотрудник
  const employeeAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.date.toDate();
    return (
      appointment.employeeIds.includes(employee.id) &&
      appointmentDate >= startDate &&
      appointmentDate <= endDate &&
      appointment.status === 'completed'
    );
  });

  // Рассчитываем общую сумму заработка
  let totalEarnings = 0;

  // Формируем детали по каждой записи
  const appointmentDetails = employeeAppointments.map(appointment => {
    // Рассчитываем заработок с учетом количества сотрудников
    const appointmentEarnings = appointment.totalPrice / appointment.employeeIds.length;
    totalEarnings += appointmentEarnings;

    return {
      id: appointment.id,
      date: appointment.date,
      services: appointment.services,
      earnings: appointmentEarnings
    };
  });

  // Формируем итоговый отчет
  return {
    employeeId: employee.id,
    employee,
    totalEarnings,
    appointmentsCount: employeeAppointments.length,
    appointmentDetails
  };
};

/**
 * Генерирует общий отчет за указанный период
 */
export const generateGeneralReport = (
  appointments: Appointment[],
  employees: Employee[],
  services: Service[],
  startDate: Date,
  endDate: Date
): GeneralReport => {
  // Фильтруем записи за указанный период
  const periodAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.date.toDate();
    return (
      appointmentDate >= startDate &&
      appointmentDate <= endDate &&
      appointment.status === 'completed'
    );
  });

  // Рассчитываем общую сумму и количество записей
  const totalEarnings = periodAppointments.reduce(
    (sum, appointment) => sum + appointment.totalPrice,
    0
  );

  // Статистика по сотрудникам
  const employeeStats = employees.map(employee => {
    const employeeAppointments = periodAppointments.filter(appointment =>
      appointment.employeeIds.includes(employee.id)
    );

    // Рассчитываем заработок сотрудника
    const earnings = employeeAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice / appointment.employeeIds.length);
    }, 0);

    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      earnings,
      appointmentsCount: employeeAppointments.length
    };
  }).filter(stat => stat.appointmentsCount > 0); // Убираем сотрудников без записей

  // Статистика по услугам
  const serviceStats: Record<string, { serviceId: string, serviceName: string, count: number, earnings: number }> = {};

  // Перебираем все записи и собираем статистику по услугам
  periodAppointments.forEach(appointment => {
    appointment.services.forEach(service => {
      const serviceId = service.serviceId;
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          serviceId,
          serviceName: service.name,
          count: 0,
          earnings: 0
        };
      }

      serviceStats[serviceId].count += service.quantity;
      serviceStats[serviceId].earnings += service.price * service.quantity;
    });
  });

  return {
    period: {
      startDate,
      endDate
    },
    totalEarnings,
    appointmentsCount: periodAppointments.length,
    employeeStats,
    serviceStats: Object.values(serviceStats)
  };
};

/**
 * Генерирует отчет за день
 */
export const generateDailyReport = (
  appointments: Appointment[],
  date: Date
): { count: number; totalEarnings: number } => {
  // Создаем начало и конец дня
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Фильтруем записи за указанный день
  const dailyAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.date.toDate();
    return (
      appointmentDate >= startOfDay &&
      appointmentDate <= endOfDay &&
      appointment.status === 'completed'
    );
  });

  // Рассчитываем общую сумму
  const totalEarnings = dailyAppointments.reduce(
    (sum, appointment) => sum + appointment.totalPrice,
    0
  );

  return {
    count: dailyAppointments.length,
    totalEarnings
  };
};
