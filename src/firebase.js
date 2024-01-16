
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjHndmx0joqwUp88tL2I0C-_vXR5wzisE",
  authDomain: "react-central-db.firebaseapp.com",
  projectId: "react-central-db",
  storageBucket: "react-central-db.appspot.com",
  messagingSenderId: "698294129543",
  appId: "1:698294129543:web:c114d417e9888ee220b922"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth=getAuth(app);
export default app;