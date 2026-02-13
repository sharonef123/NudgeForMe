// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
].join(' ');

let tokenClient = null;
let accessToken = null;

export function initGoogleAuth() {
  if (typeof google === 'undefined') {
    console.warn('Google Identity Services not loaded');
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        console.log('✅ Google authenticated');
      }
    },
  });
}

export function requestGoogleAuth() {
  if (!tokenClient) {
    initGoogleAuth();
  }
  
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error('Google Auth not initialized');
  }
}

export function getAccessToken() {
  return accessToken;
}

export function isAuthenticated() {
  return !!accessToken;
}

export async function revokeGoogleAuth() {
  if (accessToken) {
    await google.accounts.oauth2.revoke(accessToken);
    accessToken = null;
    console.log('🔓 Google auth revoked');
  }
}