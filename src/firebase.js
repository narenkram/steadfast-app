// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA3O3UfgQFs8pIzbbB_2SfH-bnkXP7B7RQ',
  authDomain: 'steadfastapp-4d677.firebaseapp.com',
  projectId: 'steadfastapp-4d677',
  storageBucket: 'steadfastapp-4d677.appspot.com',
  messagingSenderId: '901272268862',
  appId: '1:901272268862:web:e0c1a7bc142dc88080a16f',
  measurementId: 'G-K7SYZ5W0ER'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)

export { app, auth }
