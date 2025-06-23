const SESSION_KEY = 'amplify-session-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SessionCache {
  lastCheck: number;
  isAuthenticated: boolean;
}

const getSessionCache = (): SessionCache | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cachedData = window.localStorage.getItem(SESSION_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting session cache:', error);
    return null;
  }
};

const setSessionCache = (isAuthenticated: boolean): void => {
    if (typeof window === 'undefined') return;
  try {
    const cache: SessionCache = {
      lastCheck: Date.now(),
      isAuthenticated,
    };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting session cache:', error);
  }
};

const shouldRefreshAuth = (): boolean => {
    const cache = getSessionCache();
    if (!cache) return true; // No cache, must refresh
    if (!cache.isAuthenticated) return true; // Not authenticated, always try to refresh
    return Date.now() - cache.lastCheck > CACHE_DURATION; // Cache expired
};

export const sessionManager = {
    getSessionCache,
    setSessionCache,
    shouldRefreshAuth,
}; 