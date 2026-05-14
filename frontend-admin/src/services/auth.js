export const AUTH_STORAGE_KEY = 'tfms.auth';
export const OFFICER_PROFILE_KEY = 'tfms.officerProfile';
export const DRIVER_CONTEXT_KEY = 'tfms.driverContext';

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth({ accessToken, tokenType, username, role, expiresInSeconds }) {
  const value = {
    accessToken,
    tokenType,
    username,
    role,
    expiresInSeconds,
    savedAt: Date.now(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
  return value;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(OFFICER_PROFILE_KEY);
  localStorage.removeItem(DRIVER_CONTEXT_KEY);
}

export function getAccessToken() {
  return getAuth()?.accessToken || null;
}

export function getRole() {
  return getAuth()?.role || null;
}

export function setOfficerProfile(profile) {
  localStorage.setItem(OFFICER_PROFILE_KEY, JSON.stringify(profile));
}

export function getOfficerProfile() {
  try {
    const raw = localStorage.getItem(OFFICER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDriverContext(context) {
  localStorage.setItem(DRIVER_CONTEXT_KEY, JSON.stringify(context));
}

export function getDriverContext() {
  try {
    const raw = localStorage.getItem(DRIVER_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
