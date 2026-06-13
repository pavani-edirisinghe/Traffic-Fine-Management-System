export const AUTH_STORAGE_KEY = 'tfms.auth';
export const OFFICER_PROFILE_KEY = 'tfms.officerProfile';
export const DRIVER_CONTEXT_KEY = 'tfms.driverContext';
const OFFICER_TOKEN_HISTORY_PREFIX = 'tfms.officerTokenHistory';
const OFFICER_NOTIFICATION_PREFIX = 'tfms.officerNotifications';

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

function getOfficerTokenHistoryKey(officerId) {
  return `${OFFICER_TOKEN_HISTORY_PREFIX}.${officerId || 'unknown'}`;
}

export function getOfficerTokenHistory(officerId) {
  try {
    const raw = localStorage.getItem(getOfficerTokenHistoryKey(officerId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setOfficerTokenHistory(officerId, history) {
  localStorage.setItem(getOfficerTokenHistoryKey(officerId), JSON.stringify(history));
  return history;
}

export function appendOfficerTokenHistory(officerId, tokenRecord) {
  const currentHistory = getOfficerTokenHistory(officerId);
  const nextHistory = [tokenRecord, ...currentHistory];
  setOfficerTokenHistory(officerId, nextHistory);
  return nextHistory;
}

function getStorageRecordsByPrefix(prefix) {
  const records = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.startsWith(prefix)) {
      records.push({ key, value: localStorage.getItem(key) });
    }
  }
  return records;
}

export function resolveIssuedDriverToken(inputToken) {
  const normalizedToken = (inputToken || '').trim();
  if (!normalizedToken) {
    return null;
  }

  const tokenHistoryEntries = getStorageRecordsByPrefix(OFFICER_TOKEN_HISTORY_PREFIX);
  for (const entry of tokenHistoryEntries) {
    try {
      const history = entry.value ? JSON.parse(entry.value) : [];
      const matchedRecord = history.find(
        (record) => record.tokenCode === normalizedToken || record.accessToken === normalizedToken
      );
      if (matchedRecord?.accessToken) {
        return matchedRecord.accessToken;
      }
    } catch {
      // Ignore malformed storage entries and continue searching.
    }
  }

  return normalizedToken;
}

export function getOfficerNotifications(officerId) {
  try {
    const raw = localStorage.getItem(`${OFFICER_NOTIFICATION_PREFIX}.${officerId || 'unknown'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendOfficerNotification(officerId, notificationRecord) {
  const currentHistory = getOfficerNotifications(officerId);
  const nextHistory = [notificationRecord, ...currentHistory];
  localStorage.setItem(
    `${OFFICER_NOTIFICATION_PREFIX}.${officerId || 'unknown'}`,
    JSON.stringify(nextHistory)
  );
  return nextHistory;
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

export function parseJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
