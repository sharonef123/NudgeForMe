const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

let tokenClient: any = null;
let accessToken: string | null = null;

export const initGoogleAuth = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            accessToken = response.access_token;
            localStorage.setItem("google_token", response.access_token);
          }
        },
      });
      resolve();
    };
    document.head.appendChild(script);
  });
};

export const signInGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject("Google Auth לא אותחל"); return; }
    tokenClient.callback = (response: any) => {
      if (response.access_token) {
        accessToken = response.access_token;
        localStorage.setItem("google_token", response.access_token);
        resolve(response.access_token);
      } else {
        reject("התחברות נכשלה");
      }
    };
    tokenClient.requestAccessToken();
  });
};

export const signOutGoogle = () => {
  accessToken = null;
  localStorage.removeItem("google_token");
  if ((window as any).google?.accounts?.oauth2) {
    (window as any).google.accounts.oauth2.revoke(accessToken || "", () => {});
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  return localStorage.getItem("google_token");
};

export const isSignedIn = (): boolean => {
  return !!getAccessToken();
};