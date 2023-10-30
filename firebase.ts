import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyAqe1bCB5kMpN6Pfmwga-F7aBivF_rjRpw",
    authDomain: "together-53fbd.firebaseapp.com",
    projectId: "together-53fbd",
    storageBucket: "together-53fbd.appspot.com",
    messagingSenderId: "1065894578893",
    appId: "1:1065894578893:web:7d7453f0cc6bd89f15b784",
    measurementId: "G-NBENX5B73Y"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig)

const db = firebaseApp.firestore();

export { db }