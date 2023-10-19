// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA5OpavbcdhEVo_e29S_p7V8jqHsgPD_Ro",
    authDomain: "post-project-80c0a.firebaseapp.com",
    projectId: "post-project-80c0a",
    storageBucket: "post-project-80c0a.appspot.com",
    messagingSenderId: "221510362662",
    appId: "1:221510362662:web:c2a9ec41a5afc316af68e7",
    measurementId: "G-HE154XWCWV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app)

export default app