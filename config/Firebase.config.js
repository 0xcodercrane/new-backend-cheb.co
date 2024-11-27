import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const { name, version } = JSON.parse(await readFile(new URL('../firebase.json', import.meta.url)));

const accountCredentials = JSON.parse(await readFile(new URL('../config/serviceAccountKey.json', import.meta.url)));

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(accountCredentials),
});
