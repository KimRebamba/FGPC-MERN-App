import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyC1IY6MWLNBgn6aEBypNvulo2fWLzbtEKA",
    authDomain: "fgp-mern.firebaseapp.com",
    projectId: "fgp-mern",
    storageBucket: "fgp-mern.firebasestorage.app",
    messagingSenderId: "267854959562",
    appId: "1:267854959562:web:676eee755f51598caef533"
}

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })
