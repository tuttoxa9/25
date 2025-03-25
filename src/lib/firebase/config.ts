// Импортируем необходимые модули Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Обновленная конфигурация Firebase с правильным ключом
const firebaseConfig = {
  apiKey: "AIzaSyBFdLLNrLqF-ElSbwLwCxFOCkQnweHRUls",
  authDomain: "wash-v0.firebaseapp.com",
  projectId: "wash-v0",
  storageBucket: "wash-v0.appspot.com",
  messagingSenderId: "1094146116974",
  appId: "1:1094146116974:web:7580698033e53f2153c57f",
  measurementId: "G-FF2TMPCSEW"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
export const db = getFirestore(app);

// Инициализация Auth
export const auth = getAuth(app);

// Экспорт приложения Firebase
export default app;
