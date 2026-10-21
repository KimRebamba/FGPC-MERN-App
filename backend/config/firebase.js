const fs = require("node:fs")
const path = require("node:path")
const admin = require("firebase-admin")

let firebaseApp = null

const credentialsPath = () => path.join(__dirname, "..", "serviceAccountKey.json")

const readEnvCredentials = () => {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
        return null
    }

    return {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n")
    }
}

const readFileCredentials = () => {
    if (!fs.existsSync(credentialsPath())) {
        return null
    }

    return JSON.parse(fs.readFileSync(credentialsPath(), "utf8"))
}

const readCredentials = () => readEnvCredentials() || readFileCredentials()

const isFirebaseConfigured = () => readCredentials() !== null

const getFirebaseApp = () => {
    if (firebaseApp) {
        return firebaseApp
    }

    const credentials = readCredentials()

    if (!credentials) {
        throw new Error("Firebase Admin credentials are missing. Add backend/serviceAccountKey.json or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env")
    }

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(credentials)
    })

    return firebaseApp
}

const verifyGoogleIdToken = async (idToken) => {
    const decodedToken = await getFirebaseApp().auth().verifyIdToken(idToken)

    return {
        providerUserId: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
        emailVerified: decodedToken.email_verified === true
    }
}

module.exports = {
    isFirebaseConfigured,
    verifyGoogleIdToken
}
