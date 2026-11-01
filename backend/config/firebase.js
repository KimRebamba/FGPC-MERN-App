const fs = require("node:fs")
const path = require("node:path")
const { initializeApp, getApps, cert } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")

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

const getProjectId = () => {
    const creds = readCredentials()
    return creds?.projectId || process.env.FIREBASE_PROJECT_ID || "fgp-mern"
}

const isFirebaseConfigured = () => {
    return readCredentials() !== null || Boolean(getProjectId())
}

const getFirebaseApp = () => {
    if (firebaseApp) {
        return firebaseApp
    }

    const existingApps = getApps()
    if (existingApps.length > 0) {
        firebaseApp = existingApps[0]
        return firebaseApp
    }

    const credentials = readCredentials()

    if (credentials) {
        firebaseApp = initializeApp({
            credential: cert(credentials),
            projectId: credentials.projectId
        })
    } else {
        const projectId = getProjectId()
        if (!projectId) {
            throw new Error("Firebase Admin credentials or project ID are missing. Add backend/serviceAccountKey.json or set FIREBASE_PROJECT_ID in .env")
        }
        firebaseApp = initializeApp({ projectId })
    }

    return firebaseApp
}

const verifyGoogleIdToken = async (idToken) => {
    const app = getFirebaseApp()
    const decodedToken = await getAuth(app).verifyIdToken(idToken)

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
