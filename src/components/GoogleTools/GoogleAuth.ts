const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

let tokenClient: any = null;
let accessToken: string | null = null;

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

// טעינת הסקריפט של Google
const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

export const initGoogleAuth = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  await loadGoogleScript();

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: () => {},
  });
};

export const signInGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject("Google Auth לא אותחל — קרא ל-initGoogleAuth קודם");
      return;
    }
    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response.error);
        return;
      }
      if (response.access_token) {
        accessToken = response.access_token;
        const expiresAt = Date.now() + (response.expires_in || 3600) * 1000;
        localStorage.setItem("google_token", response.access_token);
        localStorage.setItem("google_token_expires", String(expiresAt));
        resolve(response.access_token);
      } else {
        reject("לא התקבל access token");
      }
    };
    tokenClient.requestAccessToken({ prompt: "" });
  });
};

export const signOutGoogle = (): void => {
  const token = accessToken || localStorage.getItem("google_token");
  accessToken = null;
  localStorage.removeItem("google_token");
  localStorage.removeItem("google_token_expires");
  localStorage.removeItem("google_user");

  if (token && (window as any).google?.accounts?.oauth2) {
    (window as any).google.accounts.oauth2.revoke(token, () => {
      console.log("Google token revoked");
    });
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;

  const token = localStorage.getItem("google_token");
  const expiresAt = Number(localStorage.getItem("google_token_expires") || 0);

  // בדוק תוקף
  if (token && Date.now() < expiresAt) {
    accessToken = token;
    return token;
  }

  // פג תוקף — נקה
  if (token) {
    localStorage.removeItem("google_token");
    localStorage.removeItem("google_token_expires");
  }
  return null;
};

export const isSignedIn = (): boolean => {
  return !!getAccessToken();
};

// שלוף פרטי משתמש מ-Google
export const fetchGoogleUser = async (): Promise<GoogleUser | null> => {
  const token = getAccessToken();
  if (!token) return null;

  // נסה cache קודם
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