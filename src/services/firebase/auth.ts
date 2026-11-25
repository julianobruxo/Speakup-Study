import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseServices, isFirebaseConfigured } from "./config";

export interface AuthStatus {
  configured: boolean;
  ready: boolean;
  uid: string | null;
  isAnonymous: boolean;
  isGoogleLinked: boolean;
}

export interface GoogleConnectResult {
  status: "linked" | "signed_in_existing" | "cancelled" | "unconfigured" | "error";
  uid?: string;
  message: string;
}

let pendingAnonymousSignIn: Promise<User | null> | null = null;

function isGoogleUser(user: User | null): boolean {
  if (!user) return false;
  return user.providerData.some((info) => info.providerId === "google.com");
}

function toAuthStatus(user: User | null, ready: boolean): AuthStatus {
  return {
    configured: isFirebaseConfigured(),
    ready,
    uid: user?.uid ?? null,
    isAnonymous: Boolean(user?.isAnonymous),
    isGoogleLinked: isGoogleUser(user),
  };
}

export async function ensureAnonymousSession(): Promise<User | null> {
  const services = getFirebaseServices();
  if (!services) return null;
  if (services.auth.currentUser) return services.auth.currentUser;

  if (!pendingAnonymousSignIn) {
    pendingAnonymousSignIn = signInAnonymously(services.auth)
      .then((credential) => credential.user)
      .catch(() => null)
      .finally(() => {
        pendingAnonymousSignIn = null;
      });
  }

  return pendingAnonymousSignIn;
}

export function subscribeAuthStatus(
  onStatus: (status: AuthStatus) => void,
): () => void {
  const services = getFirebaseServices();
  if (!services) {
    onStatus({
      configured: false,
      ready: true,
      uid: null,
      isAnonymous: false,
      isGoogleLinked: false,
    });
    return () => {};
  }

  return onAuthStateChanged(services.auth, (user) => {
    if (!user) {
      onStatus(toAuthStatus(null, false));
      void ensureAnonymousSession().then((anon) => {
        if (!anon) onStatus(toAuthStatus(null, true));
      });
      return;
    }
    onStatus(toAuthStatus(user, true));
  });
}

export async function connectGoogleAccount(): Promise<GoogleConnectResult> {
  const services = getFirebaseServices();
  if (!services) {
    return {
      status: "unconfigured",
      message: "Sincronização em nuvem indisponível neste ambiente.",
    };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const current = services.auth.currentUser ?? (await ensureAnonymousSession());
    if (current && current.isAnonymous) {
      try {
        const linked = await linkWithPopup(current, provider);
        return {
          status: "linked",
          uid: linked.user.uid,
          message: "Conta Google vinculada! Seu XP e perfil foram preservados.",
        };
      } catch (linkError) {
        const code = (linkError as { code?: string })?.code ?? "";
        if (code === "auth/credential-already-in-use") {
          const credential = GoogleAuthProvider.credentialFromError(
            linkError as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
          );
          const signedIn = credential
            ? await signInWithCredential(services.auth, credential)
            : await signInWithPopup(services.auth, provider);
          return {
            status: "signed_in_existing",
            uid: signedIn.user.uid,
            message:
              "Entrou na sua conta Google existente. Seu progresso foi sincronizado.",
          };
        }
        if (code === "auth/popup-blocked") {
          return {
            status: "error",
            message:
              "O navegador bloqueou o pop-up do Google. Permita pop-ups e tente novamente.",
          };
        }
        if (
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request"
        ) {
          return {
            status: "cancelled",
            message: "Conexão com Google cancelada.",
          };
        }
        return {
          status: "error",
          message:
            "Não foi possível conectar com o Google agora. Tente novamente.",
        };
      }
    }

    const signedIn = await signInWithPopup(services.auth, provider);
    return {
      status: "signed_in_existing",
      uid: signedIn.user.uid,
      message: "Conta Google conectada com sucesso.",
    };
  } catch (error) {
    const code = (error as { code?: string })?.code ?? "";
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return {
        status: "cancelled",
        message: "Conexão com Google cancelada.",
      };
    }
    if (code === "auth/popup-blocked") {
      return {
        status: "error",
        message:
          "O navegador bloqueou o pop-up do Google. Permita pop-ups e tente novamente.",
      };
    }
    return {
      status: "error",
      message: "Não foi possível entrar com o Google agora. Tente novamente.",
    };
  }
}

export async function signOutToAnonymous(): Promise<void> {
  const services = getFirebaseServices();
  if (!services) return;
  try {
    await signOut(services.auth);
    await ensureAnonymousSession();
  } catch {
    // Keep local offline session intact if sign-out fails.
  }
}
