import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Car,
  Users,
  Banknote,
  Clock,
  ArrowUpRight,
  ArrowRight,
  CarFront,
  Droplets,
  BadgeDollarSign,
  UserCheck,
  AlertCircle,
  Star,
  Timer,
  Zap,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { formatPrice } from '@/utils/validation';
import { generateDailyReport } from '@/utils/reports';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Appointment, AppointmentService } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export function DashboardPage() {
  const { appointments, loading, services, employees, getTodayStatistics, getAllTimeStatistics, updateAppointment } = useAppContext();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [dailyStats, setDailyStats] = useState({ count: 0, totalEarnings: 0 });
  const [weeklyStats, setWeeklyStats] = useState({ count: 0, totalEarnings: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ count: 0, totalEarnings: 0 });
  const [popularServices, setPopularServices] = useState<{name: string, count: number}[]>([]);
  const [weeklyOccupancy, setWeeklyOccupancy] = useState<{date: Date, count: number}[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Получаем статистику
  const todayStatistics = getTodayStatistics();
  const allTimeStatistics = getAllTimeStatistics();

  const today = new Date();

  // Подготовка данных при загрузке
  useEffect(() => {
    if (!loading.appointments) {
      // Записи на сегодня
      const filteredTodayAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.date.toDate();
        return (
          appointmentDate.getDate() === today.getDate() &&
          appointmentDate.getMonth() === today.getMonth() &&
          appointmentDate.getFullYear() === today.getFullYear()
        );
      }).sort((a, b) => a.date.toMillis() - b.date.toMillis());

      setTodayAppointments(filteredTodayAppointments);

      // Предстоящие записи (начиная с завтрашнего дня, ближайшие 5)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const filteredUpcomingAppointments = appointments
        .filter(appointment => {
          const appointmentDate = appointment.date.toDate();
          return appointmentDate >= tomorrow;
        })
        .sort((a, b) => a.date.toMillis() - b.date.toMillis())
        .slice(0, 5);

      setUpcomingAppointments(filteredUpcomingAppointments);

      // Генерируем статистику за день
      const stats = generateDailyReport(appointments, today);
      setDailyStats(stats);

      // Генерируем статистику за неделю
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1); // Начало недели (понедельник)
      weekStart.setHours(0, 0, 0, 0);

      const weekAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.date.toDate();
        return appointmentDate >= weekStart && appointmentDate <= today;
      });

      const weeklyTotalEarnings = weekAppointments.reduce((total, appointment) => total + appointment.totalPrice, 0);
      setWeeklyStats({
        count: weekAppointments.length,
        totalEarnings: weeklyTotalEarnings
      });

      // Генерируем статистику за месяц
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthAppointments = appointments.filter(appointment => {
        const appointmentDate = appointment.date.toDate();
        return appointmentDate >= monthStart && appointmentDate <= today;
      });

      const monthlyTotalEarnings = monthAppointments.reduce((total, appointment) => total + appointment.totalPrice, 0);
      setMonthlyStats({
        count: monthAppointments.length,
        totalEarnings: monthlyTotalEarnings
      });

      // Расчет популярных услуг
      const servicesCount: Record<string, number> = {};

      appointments.forEach(appointment => {
        appointment.services.forEach(service => {
          if (servicesCount[service.name]) {
            servicesCount[service.name] += service.quantity;
          } else {
            servicesCount[service.name] = service.quantity;
          }
        });
      });

      const topServices = Object.entries(servicesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setPopularServices(topServices);

      // Расчет загруженности по дням недели (текущая неделя)
      const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const daysOfWeek = eachDayOfInterval({
        start: currentWeekStart,
        end: currentWeekEnd
      });

      const occupancyByDay = daysOfWeek.map(day => {
        const count = appointments.filter(appointment => {
          const appDate = appointment.date.toDate();
          return isSameDay(appDate, day);
        }).length;

        return { date: day, count };
      });

      setWeeklyOccupancy(occupancyByDay);
    }
  }, [appointments, loading.appointments]);

  // Форматирование времени записи
  const formatAppointmentTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return format(date, 'HH:mm', { locale: ru });
  };

  // Форматирование даты
  const formatAppointmentDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return format(date, 'd MMM', { locale: ru });
  };

  // Функция для форматирования полной даты
  const formatFullDate = (date: Date) => {
    return format(date, 'EEEE, d MMMM', { locale: ru });
  };

  // Форматирование дня недели
  const formatWeekday = (date: Date) => {
    return format(date, 'EEEE', { locale: ru });
  };

  // Функция определения текущей загруженности (условная)
  const getCurrentOccupancy = () => {
    const hour = today.getHours();
    const todayCount = todayAppointments.length;

    if (todayCount === 0) return { text: "Свободно", status: "low" };
    if (todayCount < 3) return { text: "Низкая загруженность", status: "medium" };
    if (todayCount < 6) return { text: "Средняя загруженность", status: "medium" };
    return { text: "Высокая загруженность", status: "high" };
  };

  const markAppointmentCompleted = async (id: string) => {
    try {
      await updateAppointment(id, { status: 'completed' });
    } catch (error) {
      console.error('Ошибка при отметке записи как выполненной:', error);
    }
  };

  const currentOccupancy = getCurrentOccupancy();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <p className="text-muted-foreground">
            Обзор работы автомойки
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/reports">
              <Banknote className="mr-2 h-4 w-4" />
              Отчеты
            </Link>
          </Button>
          <Button asChild>
            <Link to="/appointments?action=new">
              <Car className="mr-2 h-4 w-4" />
              Новая запись
            </Link>
          </Button>
        </div>
      </div>

      {/* Основные информационные блоки с синей полоской и виджетом быстрых действий */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Блок с текущей датой и загруженностью - занимает 4/7 экрана */}
        <Card className="overflow-hidden md:col-span-4">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl capitalize">{formatFullDate(today)}</h3>
                <p className="opacity-90">
                  Текущее состояние: <span className="font-semibold">{currentOccupancy.text}</span>
                </p>
              </div>
              <div className="text-3xl font-bold">
                {formatPrice(dailyStats.totalEarnings)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-2">Записи на сегодня ({todayAppointments.length})</h4>

              {loading.appointments ? (
                <div className="flex items-center justify-center py-6">
                  <span>Загрузка...</span>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="flex items-center border border-dashed rounded-md p-4">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground opacity-50 mr-3" />
                  <div>
                    <h3 className="font-medium">Нет записей на сегодня</h3>
                    <p className="text-sm text-muted-foreground">
                      На сегодняшний день нет запланированных записей
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatAppointmentTime(appointment.date)} - {appointment.carNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {formatPrice(appointment.totalPrice)}
                        </div>
                        {appointment.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => markAppointmentCompleted(appointment.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Выполнено
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {todayAppointments.length > 3 && (
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/appointments">
                        Показать все ({todayAppointments.length}) <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия - занимает 3/7 экрана */}
        <Card className="h-full md:col-span-3">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Часто используемые функции
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 flex-1">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/appointments?action=new">
                <Zap className="mr-2 h-4 w-4 text-blue-500" />
                Создать новую запись
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link to="/reports">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                Сформировать отчет
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link to="/settings/services">
                <Droplets className="mr-2 h-4 w-4 text-cyan-500" />
                Управление услугами
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link to="/settings/employees">
                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                Сотрудники
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link to="/settings">
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                Настройки системы
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Карточки статистики */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Карточка для статистики выполненных записей за сегодня */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Доход сегодня
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(todayStatistics.earnings)}</div>
            <p className="text-xs text-muted-foreground">
              {todayStatistics.count} выполненных записей
            </p>
          </CardContent>
        </Card>

        {/* Карточка для статистики выполненных записей за всё время */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Общий доход
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(allTimeStatistics.earnings)}</div>
            <p className="text-xs text-muted-foreground">
              {allTimeStatistics.count} выполненных записей
            </p>
          </CardContent>
        </Card>

        {/* Существующие карточки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Записи на сегодня
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(a => a.status === 'pending').length} ожидают выполнения
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ближайшие записи
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Записи на ближайшие 7 дней
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Виджеты и дополнительные блоки - убираем блок быстрых действий, так как перенесли его выше */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Популярные услуги */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Популярные услуги</CardTitle>
            <CardDescription>
              Наиболее востребованные услуги автомойки
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {popularServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Droplets className="h-12 w-12 text-muted-foreground opacity-30" />
                <p className="mt-2 text-sm text-muted-foreground">Недостаточно данных</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularServices.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-xs leading-none py-1 text-white"
                        style={{
                          width: `${Math.max(10, Math.min(100, (service.count / popularServices[0].count) * 100))}%`
                        }}
                      >
                        <span className="px-2">{service.count} заказов</span>
                      </div>
                    </div>
                    <span className="ml-2 w-40 text-sm truncate">{service.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 mt-auto">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/settings/services">
                Управление услугами <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Предстоящие записи */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Ближайшие записи</CardTitle>
            <CardDescription>
              Предстоящие записи в ближайшие дни
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading.appointments ? (
              <div className="flex items-center justify-center p-6">
                <span>Загрузка...</span>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6">
                <CalendarIcon className="h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">Нет записей</h3>
                <p className="text-sm text-muted-foreground">
                  Ближайшие дни свободны
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
                        <CalendarIcon className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatAppointmentDate(appointment.date)} в {formatAppointmentTime(appointment.date)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.carNumber} - {appointment.carModel || "Нет модели"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 mt-auto">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/appointments">
                Все записи <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Загруженность по дням недели */}
      <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
        <CardHeader className={isDark ? 'border-slate-700' : ''}>
          <CardTitle>Загруженность по дням недели</CardTitle>
          <CardDescription>
            Количество записей на текущую неделю
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyOccupancy.map((day, index) => {
              // Определяем стиль для каждого дня
              let bgClass = '';
              if (isSameDay(day.date, today)) {
                bgClass = isDark
                  ? 'bg-blue-900 border border-blue-800 text-white'
                  : 'bg-blue-50 border border-blue-200';
              } else {
                bgClass = isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-200'
                  : 'bg-gray-50';
              }

              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-md weekly-day ${isSameDay(day.date, today) ? 'today' : ''} ${bgClass}`}
                >
                  <div className={`text-xs uppercase ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
                    {format(day.date, 'EEE', { locale: ru })}
                  </div>
                  <div className={`text-xs my-1 ${isDark ? 'text-white' : ''}`}>
                    {format(day.date, 'd', { locale: ru })}
                  </div>
                  <div className={`text-sm font-medium ${
                    day.count > 0
                      ? (isDark ? 'text-blue-400' : 'text-blue-600')
                      : (isDark ? 'text-slate-500' : 'text-muted-foreground')
                  }`}>
                    {day.count > 0 ? `${day.count} шт.` : 'нет'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
