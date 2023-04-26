import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyA7-vNil72IjKd5dbDpx_72vm9YEUJR9JU",
    authDomain: "lease-link.firebaseapp.com",
    projectId: "lease-link",
    storageBucket: "lease-link.appspot.com",
    messagingSenderId: "606682525851",
    appId: "1:606682525851:web:c070a24ebd4a515927163e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const storage = getStorage(app);


export default app;