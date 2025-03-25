import { z } from 'zod';

// Регулярные выражения для валидации
const CAR_NUMBER_REGEX = /^[0-9]{4}\s[A-Z]{2}-[0-9]$/; // Формат: 1234 AB-1
const PHONE_NUMBER_REGEX = /^\+375\s?\(?\d{2}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/; // Формат: +375 (xx) xxx-xx-xx

// Схема для валидации номера автомобиля
export const carNumberSchema = z
  .string()
  .trim()
  .regex(CAR_NUMBER_REGEX, 'Номер должен быть в формате: 1234 AB-1');

// Схема для валидации номера телефона
export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(PHONE_NUMBER_REGEX, 'Номер телефона должен быть в формате: +375 (xx) xxx-xx-xx');

// Схема для сотрудника
export const employeeSchema = z.object({
  firstName: z.string().trim().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().trim().min(2, 'Фамилия должна содержать минимум 2 символа'),
});

// Схема для услуги
export const serviceSchema = z.object({
  name: z.string().trim().min(3, 'Название должно содержать минимум 3 символа'),
  price: z
    .number()
    .min(0, 'Цена не может быть отрицательной')
    .or(z.string().transform((val) => parseFloat(val) || 0)),
});

// Схема для организации
export const organizationSchema = z.object({
  name: z.string().trim().min(2, 'Название должно содержать минимум 2 символа'),
  contactPerson: z.string().trim().optional(),
  phoneNumber: phoneNumberSchema.optional(),
});

// Схема для услуги в записи
export const appointmentServiceSchema = z.object({
  serviceId: z.string().trim(),
  quantity: z
    .number()
    .int()
    .min(1, 'Количество должно быть не менее 1')
    .or(z.string().transform((val) => parseInt(val) || 1)),
});

// Схема для записи
export const appointmentSchema = z.object({
  date: z.date(),
  clientType: z.enum(['individual', 'organization']),
  organizationId: z.string().trim().optional(),
  carNumber: carNumberSchema,
  phoneNumber: phoneNumberSchema,
  carModel: z.string().trim().optional(),
  services: z.array(appointmentServiceSchema).min(1, 'Выберите хотя бы одну услугу'),
  employeeIds: z.array(z.string()).min(1, 'Выберите хотя бы одного сотрудника'),
  notes: z.string().trim().optional(),
});

// Функция форматирования номера телефона
export const formatPhoneNumber = (phone: string): string => {
  // Удаляем все нецифровые символы
  const digits = phone.replace(/\D/g, '');

  // Проверяем длину и начало номера
  if (digits.length === 12 && digits.startsWith('375')) {
    // Форматируем номер в виде +375 (XX) XXX-XX-XX
    return `+375 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
  }

  // Если номер не соответствует формату, возвращаем исходную строку
  return phone;
};

// Функция форматирования номера автомобиля
export const formatCarNumber = (carNumber: string): string => {
  // Удаляем все пробелы и приводим к верхнему регистру
  const normalized = carNumber.replace(/\s/g, '').toUpperCase();

  // Проверяем, соответствует ли номер формату XXXXAB-X
  if (/^\d{4}[A-Z]{2}-\d$/.test(normalized)) {
    // Добавляем пробел после первых 4 цифр
    return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
  }

  // Если номер не соответствует формату, возвращаем исходную строку
  return carNumber;
};

// Функция форматирования цены (BYN)
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} BYN`;
};
