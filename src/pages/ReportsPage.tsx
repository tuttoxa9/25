import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  BarChart,
  BarChartHorizontal,
  CalendarIcon,
  Download,
  User,
  Banknote
} from 'lucide-react';
import {
  generateEmployeeReport,
  generateGeneralReport
} from '@/utils/reports';
import { formatPrice } from '@/utils/validation';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BarChart as ReChartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { DateRange } from 'react-day-picker';

// Типы периодов отчетов
type ReportPeriod = 'day' | 'week' | 'month' | 'custom';

export function ReportsPage() {
  const { appointments, employees, services, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<ReportPeriod>('day');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  // Установка начального сотрудника
  useEffect(() => {
    if (!loading.employees && employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0].id);
    }
  }, [loading.employees, employees, selectedEmployee]);

  // Расчет дат на основе выбранного периода
  const getDateRangeForPeriod = (period: ReportPeriod): { from: Date; to: Date } => {
    const today = new Date();

    switch (period) {
      case 'day':
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
      case 'week':
        return {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        };
      case 'month':
        return {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
      case 'custom':
        return {
          from: dateRange.from || new Date(),
          to: dateRange.to || new Date()
        };
      default:
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
    }
  };

  // Получение диапазона дат для текущего периода
  const currentDateRange = getDateRangeForPeriod(periodType);

  // Генерируем общий отчет
  const generalReport = generateGeneralReport(
    appointments,
    employees,
    services,
    currentDateRange.from,
    currentDateRange.to
  );

  // Генерируем отчет по сотруднику
  const getEmployeeReport = () => {
    if (!selectedEmployee) return null;

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return null;

    return generateEmployeeReport(
      employee,
      appointments,
      currentDateRange.from,
      currentDateRange.to
    );
  };

  const employeeReport = getEmployeeReport();

  // Подготовка данных для графика услуг
  const serviceChartData = generalReport.serviceStats.map(service => ({
    name: service.serviceName,
    Заработок: service.earnings,
    Количество: service.count
  }));

  // Подготовка данных для графика сотрудников
  const employeeChartData = generalReport.employeeStats.map(employee => ({
    name: employee.employeeName,
    Заработок: employee.earnings,
    Записи: employee.appointmentsCount
  }));

  // Функция обработки изменения диапазона дат
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  // Форматирование диапазона дат для отображения
  const formatDateRange = () => {
    if (!currentDateRange.to ||
        format(currentDateRange.from, 'yyyy-MM-dd') === format(currentDateRange.to, 'yyyy-MM-dd')) {
      return format(currentDateRange.from, 'd MMMM yyyy', { locale: ru });
    }

    return `${format(currentDateRange.from, 'd MMMM', { locale: ru })} - ${format(currentDateRange.to, 'd MMMM yyyy', { locale: ru })}`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Отчеты</h2>
        <p className="text-sm text-muted-foreground">
          Анализ работы автомойки за выбранный период
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <Select
            value={periodType}
            onValueChange={(value) => setPeriodType(value as ReportPeriod)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">За день</SelectItem>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="custom">Произвольный период</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {periodType === 'custom' && (
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: ru })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: ru })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: ru })
                    )
                  ) : (
                    <span>Выберите даты</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общий отчет</TabsTrigger>
          <TabsTrigger value="employee">Отчет по сотруднику</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Общий заработок</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(generalReport.totalEarnings)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Количество записей</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{generalReport.appointmentsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Период</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDateRange()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по услугам</CardTitle>
                <CardDescription>
                  Заработок и количество по каждой услуге
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <p>Нет данных за выбранный период</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsBarChart
                          data={serviceChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={120} />
                          <Tooltip formatter={(value) => [`${value} BYN`, undefined]} />
                          <Legend />
                          <Bar dataKey="Заработок" fill="#8884d8" />
                        </ReChartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Услуга</TableHead>
                            <TableHead className="text-right">Кол-во</TableHead>
                            <TableHead className="text-right">Заработок</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generalReport.serviceStats.map((service) => (
                            <TableRow key={service.serviceId}>
                              <TableCell>{service.serviceName}</TableCell>
                              <TableCell className="text-right">{service.count}</TableCell>
                              <TableCell className="text-right">{formatPrice(service.earnings)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика по сотрудникам</CardTitle>
                <CardDescription>
                  Заработок и количество записей по каждому сотруднику
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeeChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <p>Нет данных за выбранный период</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsBarChart
                          data={employeeChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={120} />
                          <Tooltip formatter={(value) => [`${value} BYN`, undefined]} />
                          <Legend />
                          <Bar dataKey="Заработок" fill="#82ca9d" />
                        </ReChartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Сотрудник</TableHead>
                            <TableHead className="text-right">Записей</TableHead>
                            <TableHead className="text-right">Заработок</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generalReport.employeeStats.map((employee) => (
                            <TableRow key={employee.employeeId}>
                              <TableCell>{employee.employeeName}</TableCell>
                              <TableCell className="text-right">{employee.appointmentsCount}</TableCell>
                              <TableCell className="text-right">{formatPrice(employee.earnings)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employee" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div>
              <Select
                value={selectedEmployee || ''}
                onValueChange={setSelectedEmployee}
                disabled={loading.employees || employees.length === 0}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(employee => !employee.isDeleted)
                    .map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading.employees || loading.appointments ? (
            <div className="flex items-center justify-center p-8">
              <span>Загрузка...</span>
            </div>
          ) : !employeeReport ? (
            <div className="flex flex-col items-center justify-center p-8 border rounded-md">
              <h3 className="mt-4 text-lg font-medium">Нет данных</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Выберите сотрудника для просмотра отчета
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Сотрудник</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {employeeReport.employee.firstName} {employeeReport.employee.lastName}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Общий заработок</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{formatPrice(employeeReport.totalEarnings)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Количество записей</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{employeeReport.appointmentsCount}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Детализация по записям</CardTitle>
                  <CardDescription>
                    Список записей сотрудника за период: {formatDateRange()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {employeeReport.appointmentDetails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                      <p>Нет записей за выбранный период</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Услуги</TableHead>
                            <TableHead className="text-right">Заработок</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employeeReport.appointmentDetails.map((detail) => (
                            <TableRow key={detail.id}>
                              <TableCell>
                                {format(detail.date.toDate(), 'd MMMM yyyy, HH:mm', { locale: ru })}
                              </TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside text-sm">
                                  {detail.services.map((service, index) => (
                                    <li key={index}>{service.name} (x{service.quantity})</li>
                                  ))}
                                </ul>
                              </TableCell>
                              <TableCell className="text-right">{formatPrice(detail.earnings)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
