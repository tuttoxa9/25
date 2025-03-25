import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from './config'; // Обновленный импорт db

// Типы коллекций
export const APPOINTMENTS = 'appointments';
export const EMPLOYEES = 'employees';
export const SERVICES = 'services';
export const ORGANIZATIONS = 'organizations';
export const NOTIFICATIONS = 'notifications';

/**
 * Базовый класс для работы с Firestore
 */
class FirebaseService {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Получение всех документов из коллекции
   */
  async getAll() {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Получение документа по ID
   */
  async getById(id: string) {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Document with ID ${id} not found`);
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }

  /**
   * Добавление нового документа
   */
  async add(data: Record<string, any>) {
    const timestamp = Timestamp.now();

    // Не добавляем поля createdAt/updatedAt, чтобы не нарушать типы
    const docRef = await addDoc(collection(db, this.collectionName), data);
    return {
      id: docRef.id,
      ...data
    };
  }

  /**
   * Обновление документа
   */
  async update(id: string, data: Record<string, any>) {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data);

    // Получаем обновленный документ
    const updatedDoc = await getDoc(docRef);

    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  }

  /**
   * Удаление документа
   */
  async delete(id: string) {
    await deleteDoc(doc(db, this.collectionName, id));
    return id;
  }

  /**
   * Поиск документов по критериям
   */
  async find(
    conditions: Record<string, any>,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc'
  ) {
    let q = collection(db, this.collectionName);
    let queryConstraints = [];

    // Добавляем условия поиска
    for (const [field, value] of Object.entries(conditions)) {
      queryConstraints.push(where(field, '==', value));
    }

    // Добавляем сортировку
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }

    const querySnapshot = await getDocs(query(q, ...queryConstraints));

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}

// Сервис для работы с записями
class AppointmentService extends FirebaseService {
  constructor() {
    super(APPOINTMENTS);
  }
}

// Сервис для работы с сотрудниками
class EmployeeService extends FirebaseService {
  constructor() {
    super(EMPLOYEES);
  }
}

// Сервис для работы с услугами
class ServiceService extends FirebaseService {
  constructor() {
    super(SERVICES);
  }
}

// Сервис для работы с организациями
class OrganizationService extends FirebaseService {
  constructor() {
    super(ORGANIZATIONS);
  }
}

// Сервис для работы с уведомлениями
class NotificationService extends FirebaseService {
  constructor() {
    super(NOTIFICATIONS);
  }

  /**
   * Получение всех уведомлений, отсортированных по времени создания
   */
  async getAll() {
    const q = query(
      collection(db, NOTIFICATIONS),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Получение непрочитанных уведомлений
   */
  async getUnread() {
    const q = query(
      collection(db, NOTIFICATIONS),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(id: string) {
    return this.update(id, { isRead: true });
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead() {
    const unreadNotifications = await this.getUnread();

    const promises = unreadNotifications.map(notification =>
      this.update(notification.id, { isRead: true })
    );

    await Promise.all(promises);
    return unreadNotifications.length;
  }

  /**
   * Удаление всех уведомлений
   */
  async deleteAll() {
    const notifications = await this.getAll();

    const promises = notifications.map(notification =>
      this.delete(notification.id)
    );

    await Promise.all(promises);
    return notifications.length;
  }
}

// Инстансы сервисов для экспорта
export const appointmentService = new AppointmentService();
export const employeeService = new EmployeeService();
export const serviceService = new ServiceService();
export const organizationService = new OrganizationService();
export const notificationService = new NotificationService();
