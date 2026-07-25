import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtqa-StwDXvFSrqOzcrUn_BfYV-lz5eJ0",
  authDomain: "live-streaming-dd1cd.firebaseapp.com",
databaseURL:"https://live-streaming-dd1cd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-streaming-dd1cd",
  storageBucket: "live-streaming-dd1cd.firebasestorage.app",
  messagingSenderId: "29847534007",
  appId: "1:29847534007:web:ae2faab76587ac7572d032"
};

const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const database = getDatabase(app);


// Default export
export default app;
