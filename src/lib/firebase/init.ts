import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './config';
import { initializeAdmin } from './auth';

/**
 * Проверка соединения с Firebase
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.error('Firestore не инициализирован');
      return false;
    }

    // Пытаемся выполнить простой запрос к Firebase
    const testDoc = doc(db, 'system', 'connection-test');
    await setDoc(testDoc, { timestamp: new Date().toISOString() });
    const docSnap = await getDoc(testDoc);

    if (docSnap.exists()) {
      console.log('Соединение с Firebase успешно установлено');
      return true;
    } else {
      console.error('Не удалось проверить соединение с Firebase');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке соединения с Firebase:', error);
    return false;
  }
};

/**
 * Инициализация Firebase при запуске приложения
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    console.log('Инициализация Firebase...');

    // Проверяем соединение с Firebase
    const connected = await checkFirebaseConnection();

    if (connected) {
      try {
        // Пытаемся инициализировать администратора, но игнорируем ошибку, если он уже существует
        await initializeAdmin();
        console.log('Firebase успешно инициализирован');
      } catch (error: any) {
        // Если ошибка связана с тем, что пользователь уже существует - это не критично
        if (error.code === 'auth/email-already-in-use') {
          console.log('Администратор уже существует, продолжаем работу');
        } else {
          // Логируем другие ошибки, но не критичные для работы приложения
          console.error('Ошибка при инициализации администратора:', error);
        }
      }
    } else {
      console.error('Не удалось инициализировать Firebase: проблема с соединением');
    }
  } catch (error) {
    console.error('Ошибка при инициализации Firebase:', error);
  }
};
