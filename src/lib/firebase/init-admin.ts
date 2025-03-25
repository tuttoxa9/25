import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Инициализирует админа, если он еще не существует
 */
export const initializeAdmin = async () => {
  try {
    const userEmail = 'admin@carwash-app.com';
    const userPassword = '1234';

    // Проверяем, существует ли админ в Firestore
    const adminDocRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
      try {
        // Пытаемся создать пользователя в Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
        const user = userCredential.user;

        // Сохраняем данные админа в Firestore
        await setDoc(doc(db, 'users', 'admin'), {
          uid: user.uid,
          email: userEmail,
          role: 'admin',
          displayName: 'Администратор',
          createdAt: new Date()
        });

        console.log('Админ успешно инициализирован');
        return user;
      } catch (error: any) {
        // Если ошибка связана с тем, что пользователь уже существует, это не критично
        if (error.code === 'auth/email-already-in-use') {
          console.log('Пользователь admin уже существует в Firebase Auth');
        } else {
          console.error('Ошибка при инициализации админа:', error);
        }
      }
    } else {
      console.log('Админ уже существует в Firestore');
    }

    return null;
  } catch (error) {
    console.error('Ошибка при проверке наличия админа:', error);
    return null;
  }
};
