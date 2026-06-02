import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

//credenciales de firebase
const firebaseConfig = {
  apiKey: "AIzaSyAclgtm5KOqpg1Py2zGOGjd2vZFeg_Dhn0",
  authDomain: "busway-168c2.firebaseapp.com",
  projectId: "busway-168c2",
  storageBucket: "busway-168c2.firebasestorage.app",
  messagingSenderId: "997158856914",
  appId: "1:997158856914:web:2709bc562723666152250b"
};

//Inicializar Firebase
const app = initializeApp(firebaseConfig);

//Inicializar Auth vinculándolo a AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});