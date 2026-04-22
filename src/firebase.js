import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBmOwkvDS-t5Y9sIJAnR6NstcWKF5cnLb0",
  authDomain: "presencialidad-equipo.firebaseapp.com",
  projectId: "presencialidad-equipo",
  storageBucket: "presencialidad-equipo.firebasestorage.app",
  messagingSenderId: "529105112893",
  appId: "1:529105112893:web:00b394a49383e39f8d7f54",
  databaseURL: "https://presencialidad-equipo-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
