import { db } from './config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

/**
 * Проверяет соединение с Firebase Firestore.
 * Возвращает Promise<boolean>, который разрешается true, если соединение успешно,
 * или отклоняется с ошибкой, если соединение не удалось.
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // Попытка запросить небольшое количество данных из Firestore
    const q = query(collection(db, 'appointments'), limit(1));
    await getDocs(q);
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    throw error;
  }
}

/**
 * Параметры функции наблюдения за соединением Firebase
 */
interface WatchConnectionOptions {
  onStatusChange?: (isConnected: boolean) => void;
  onError?: (error: Error) => void;
  intervalMs?: number;
}

/**
 * Запускает периодическую проверку подключения к Firebase.
 * Возвращает функцию для остановки проверки.
 */
export function watchFirebaseConnection({
  onStatusChange,
  onError,
  intervalMs = 30000
}: WatchConnectionOptions = {}): () => void {
  let lastConnectionStatus: boolean | null = null;

  const checkConnection = async () => {
    try {
      const isConnected = await checkFirebaseConnection();

      // Уведомляем только если статус изменился
      if (lastConnectionStatus !== isConnected) {
        lastConnectionStatus = isConnected;
        onStatusChange?.(isConnected);
      }
    } catch (error) {
      // Уведомляем только если статус изменился с подключено на отключено
      if (lastConnectionStatus !== false) {
        lastConnectionStatus = false;
        onStatusChange?.(false);
      }

      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Немедленная проверка
  checkConnection();

  // Периодическая проверка
  const intervalId = setInterval(checkConnection, intervalMs);

  // Возвращаем функцию очистки
  return () => clearInterval(intervalId);
}
