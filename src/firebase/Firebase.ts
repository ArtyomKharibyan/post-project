// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDhg2x0xlIreALh0pILmPX3mG7Ee1vNpq4",
    authDomain: "post-project-5a940.firebaseapp.com",
    projectId: "post-project-5a940",
    storageBucket: "post-project-5a940.appspot.com",
    messagingSenderId: "678529784197",
    appId: "1:678529784197:web:3fafb79201288efa0e0cec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app