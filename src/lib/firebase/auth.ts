import type { CustomerProfile } from "@/lib/orders";

type FirebaseAuthUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  providerData?: { providerId?: string }[];
};

type FirebaseAuthModule = {
  getAuth: (app: unknown) => unknown;
  GoogleAuthProvider: new () => unknown;
  OAuthProvider: new (providerId: string) => { addScope?: (scope: string) => void };
  signInWithPopup: (auth: unknown, provider: unknown) => Promise<{ user: FirebaseAuthUser }>;
  signInWithRedirect: (auth: unknown, provider: unknown) => Promise<void>;
  getRedirectResult: (auth: unknown) => Promise<{ user: FirebaseAuthUser } | null>;
  onAuthStateChanged: (
    auth: unknown,
    callback: (user: FirebaseAuthUser | null) => void,
  ) => () => void;
  signOut: (auth: unknown) => Promise<void>;
};

type FirebaseAppModule = {
  getApps: () => unknown[];
  initializeApp: (config: Record<string, string>) => unknown;
  getApp: () => unknown;
};

export type SocialProvider = "google" | "apple" | "outlook";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain =
  (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ||
  (projectId ? `${projectId}.firebaseapp.com` : "");

export const firebaseAuthReady = Boolean(projectId && apiKey && authDomain);

let authPromise: Promise<{ auth: unknown; authModule: FirebaseAuthModule }> | null = null;
const firebaseAppUrl = "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
const firebaseAuthUrl = "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

async function loadAuth() {
  if (!firebaseAuthReady) throw new Error("Firebase Auth no configurado");
  if (!authPromise) {
    authPromise = Promise.all([
      import(/* @vite-ignore */ firebaseAppUrl),
      import(/* @vite-ignore */ firebaseAuthUrl),
    ]).then(([appModuleRaw, authModuleRaw]) => {
      const appModule = appModuleRaw as FirebaseAppModule;
      const authModule = authModuleRaw as FirebaseAuthModule;
      const app = appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp({
            apiKey,
            authDomain,
            projectId,
          });
      return { auth: authModule.getAuth(app), authModule };
    });
  }
  return authPromise;
}

function providerFor(authModule: FirebaseAuthModule, provider: SocialProvider) {
  if (provider === "google") return new authModule.GoogleAuthProvider();
  const oauth = new authModule.OAuthProvider(provider === "apple" ? "apple.com" : "microsoft.com");
  oauth.addScope?.("email");
  oauth.addScope?.("profile");
  return oauth;
}

export function profileFromAuthUser(user: FirebaseAuthUser): Partial<CustomerProfile> {
  return {
    name: user.displayName || "",
    email: user.email || "",
    authUid: user.uid,
    provider: user.providerData?.[0]?.providerId || "",
    marketingOptIn: true,
  };
}

export async function signInSocial(provider: SocialProvider) {
  const { auth, authModule } = await loadAuth();
  const selectedProvider = providerFor(authModule, provider);
  try {
    const result = await authModule.signInWithPopup(auth, selectedProvider);
    return result.user;
  } catch (error) {
    const code = String((error as { code?: string }).code || "");
    if (code.includes("popup") || code.includes("cancelled")) {
      await authModule.signInWithRedirect(auth, selectedProvider);
      return null;
    }
    throw error;
  }
}

export async function handleAuthRedirect() {
  const { auth, authModule } = await loadAuth();
  const result = await authModule.getRedirectResult(auth);
  return result?.user || null;
}

export async function watchAuth(callback: (user: FirebaseAuthUser | null) => void) {
  const { auth, authModule } = await loadAuth();
  return authModule.onAuthStateChanged(auth, callback);
}

export async function signOutSocial() {
  const { auth, authModule } = await loadAuth();
  await authModule.signOut(auth);
}
