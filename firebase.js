const firebaseConfig = {
  apiKey: "AIzaSyBO_sneAobUS42GaUyLRpn7wZefmWT2UsI",
  authDomain: "geoattendance-9dc3e.firebaseapp.com",
  projectId: "geoattendance-9dc3e",
  storageBucket: "geoattendance-9dc3e.firebasestorage.app",
  messagingSenderId: "830471528987",
  appId: "1:830471528987:web:ef6a851e2ea368d245cebe",
  measurementId: "G-YG9GRE63MW"
};;

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

