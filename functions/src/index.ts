import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

export * from "./onboarding";
export * from "./notifications";
export * from "./waitlist";
