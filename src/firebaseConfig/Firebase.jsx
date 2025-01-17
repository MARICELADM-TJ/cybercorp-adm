// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiFnaJ7YQOU8F-YntlcM6pXGImpAFU4sI",
  authDomain: "login-7705c.firebaseapp.com",
  projectId: "login-7705c",
  storageBucket: "login-7705c.firebasestorage.app",
  messagingSenderId: "600333196096",
  appId: "1:600333196096:web:7b6ac5cbfe234c63e178a5",
  measurementId: "G-9557ESQKHR"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(appFirebase);
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error('Error configurando persistencia:', error);
    });

export const db = getFirestore(appFirebase); 
export default appFirebase;
