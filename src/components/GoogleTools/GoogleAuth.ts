const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

let tokenClient: any = null;
let scriptLoaded = false;

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

// טוען את הסקריפט רק כשצריך — לא אוטומטית
const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (scriptLoaded && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    // הסר סקריפט ישן אם קיים
    const old = document.querySelector('script[src*="accounts.google.com/gsi"]');
    if (old) old.remove();

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("נכשל טעינת Google script"));
    document.head.appendChild(script);
  });
};

// initGoogleAuth — קרא רק כשהמשתמש לוחץ התחבר
export const initGoogleAuth = async (): Promise<void> => {
  await loadGoogleScript();
  if (tokenClient) return; // כבר אותחל

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: () => {},
  });
};

export const signInGoogle = async (): Promise<string> => {
  // אתחל רק עכשיו — כשהמשתמש לחץ
  await initGoogleAuth();

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response.error);
        return;
      }
      if (response.access_token) {
        const expiresAt = Date.now() + (response.expires_in || 3600) * 1000;
        localStorage.setItem("google_token", response.access_token);
        localStorage.setItem("google_token_expires", String(expiresAt));
        resolve(response.access_token);
      } else {
        reject("לא התקבל access token");
      }
    };
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

export const signOutGoogle = (): void => {
  const token = localStorage.getItem("google_token");
  localStorage.removeItem("google_token");
  localStorage.removeItem("google_token_expires");
  localStorage.removeItem("google_user");
  tokenClient = null;
  scriptLoaded = false;

  // הסר את הסקריפט מה-DOM
  const script = document.querySelector('script[src*="accounts.google.com/gsi"]');
  if (script) script.remove();

  if (token && (window as any).google?.accounts?.oauth2) {
    (window as any).google.accounts.oauth2.revoke(token, () => {});
  }
};

export const getAccessToken = (): string | null => {
  const token = localStorage.getItem("google_token");
  const expiresAt = Number(localStorage.getItem("google_token_expires") || 0);
  if (token && Date.now() < expiresAt) return token;
  if (token) {
    localStorage.removeItem("google_token");
    localStorage.removeItem("google_token_expires");
  }
  return null;
};

export const isSignedIn = (): boolean => !!getAccessToken();

export const fetchGoogleUser = async (): Promise<GoogleUser | null> => {
  const token = getAccessToken();
  if (!token) return null;
  const cached = localStorage.getItem("google_user");
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user: GoogleUser = {
      name: data.name || "משתמש",
      email: data.email || "",
      picture: data.picture || "",
    };
    localStorage.setItem("google_user", JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
};