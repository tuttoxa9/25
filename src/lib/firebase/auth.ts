import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken,
  User,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Интерфейс для хранения данных пользователя
export interface UserData {
  email: string;
  role: 'admin' | 'manager' | 'employee';
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

/**
 * Проверка существования пользователя по email
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error('Ошибка при проверке существования пользователя:', error);
    return false;
  }
};

/**
 * Инициализация администратора, если его не существует
 */
export const initializeAdmin = async (): Promise<void> => {
  const adminEmail = 'admin@example.com';
  const adminPassword = '111111'; // Измененный пароль

  try {
    // Проверяем, существует ли уже администратор
    const exists = await checkUserExists(adminEmail);

    if (!exists) {
      console.log('Администратор не найден, создаем нового');
      // Создаем администратора, если не существует
      await createUser(adminEmail, adminPassword, {
        role: 'admin',
        displayName: 'Администратор'
      });
      console.log('Администратор успешно создан');
    } else {
      console.log('Администратор уже существует');
    }
  } catch (error) {
    console.error('Ошибка при инициализации администратора:', error);
  }
};

/**
 * Вход с использованием email и пароля
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Попытка входа:', email);

    // Проверяем, инициализирован ли Firebase правильно
    if (!auth) {
      console.error('Ошибка: Firebase Auth не инициализирован');
      throw new Error('Firebase Auth не инициализирован');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Успешный вход:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('Ошибка при входе:', error.code, error.message);

    // Для демонстрационных целей - логирование подробностей ошибки
    if (error.code === 'auth/user-not-found') {
      console.log('Пользователь не найден, нужно создать нового');
    } else if (error.code === 'auth/wrong-password') {
      console.log('Неверный пароль');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('Неверные учетные данные');
    } else if (error.code === 'auth/api-key-not-valid') {
      console.log('Неверный API ключ Firebase');
    } else if (error.code === 'auth/invalid-email') {
      console.log('Неверный формат email');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('Проблема с сетевым подключением');
    }

    throw error;
  }
};

/**
 * Создание нового пользователя с email и паролем
 */
export const createUser = async (email: string, password: string, userData: Omit<UserData, 'email' | 'createdAt'>) => {
  try {
    console.log('Создание пользователя:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Сохраняем дополнительные данные пользователя в Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      ...userData,
      createdAt: new Date()
    });

    console.log('Пользователь успешно создан:', user);
    return user;
  } catch (error: any) {
    console.error('Ошибка при создании пользователя:', error.code, error.message);
    throw error;
  }
};

/**
 * Получение данных текущего пользователя из Firestore
 */
export const getCurrentUserData = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { uid: user.uid, ...docSnap.data() } as UserData & { uid: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};

/**
 * Выход из системы
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    return false;
  }
};

/**
 * Проверка, авторизован ли пользователь
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Подписка на изменение состояния аутентификации
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Сброс пароля
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    throw error;
  }
};
