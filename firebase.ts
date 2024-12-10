import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBhpbToiUw_aHbZUEUAAdTzEam8-xVfdXw",
  authDomain: "dai-formularios.firebaseapp.com",
  projectId: "dai-formularios",
  storageBucket: "dai-formularios.firebasestorage.app",
  messagingSenderId: "683702837561",
  appId: "1:683702837561:web:57acaf0caf539a0764c8e8",
  measurementId: "G-Q11CN99V0X"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  db,
  storage
}
