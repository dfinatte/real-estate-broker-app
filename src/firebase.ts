import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmpq3EM7b6OJAJPevf9bB_m3eiJrTiM08",
  authDomain: "gestao-imobiliaria-quintoandar.firebaseapp.com",
  projectId: "gestao-imobiliaria-quintoandar",
  storageBucket: "gestao-imobiliaria-quintoandar.appspot.com",
  messagingSenderId: "989610244324",
  appId: "1:989610244324:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
export { collection, doc, setDoc, getDoc, updateDoc, getDocs, query, where };
