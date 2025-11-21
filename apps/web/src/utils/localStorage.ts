/**
 * LocalStorage utility functions for persisting user data
 */

const STORAGE_KEYS = {
  BOOKMARKS: 'aipush_bookmarks',
  LANGUAGE: 'aipush_language',
  VIEW_MODE: 'aipush_view_mode',
  THEME: 'aipush_theme',
  CUSTOM_NEWS: 'aipush_custom_news',
  CACHED_NEWS: 'aipush_cached_news',
  CACHED_NEWS_TIMESTAMP: 'aipush_cached_news_timestamp',
} as const;

// Cache duration: 5 minutes (to avoid hitting rate limits)
const CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Get bookmarked item IDs
 */
export function getBookmarks(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return new Set();
  }
}

/**
 * Save bookmarked item IDs
 */
export function saveBookmarks(bookmarks: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(Array.from(bookmarks)));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}

/**
 * Get user's preferred language
 */
export function getLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'English';
  } catch (error) {
    console.error('Error loading language:', error);
    return 'English';
  }
}

/**
 * Save user's preferred language
 */
export function saveLanguage(language: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
}

/**
 * Get user's preferred view mode
 */
export function getViewMode(): 'CARD' | 'LIST' {
  try {
    const mode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return (mode === 'CARD' || mode === 'LIST') ? mode : 'CARD';
  } catch (error) {
    console.error('Error loading view mode:', error);
    return 'CARD';
  }
}

/**
 * Save user's preferred view mode
 */
export function saveViewMode(mode: 'CARD' | 'LIST'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (error) {
    console.error('Error saving view mode:', error);
  }
}

/**
 * Get custom news items
 */
export function getCustomNews(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_NEWS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom news:', error);
    return [];
  }
}

/**
 * Save custom news items
 */
export function saveCustomNews(newsItems: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_NEWS, JSON.stringify(newsItems));
  } catch (error) {
    console.error('Error saving custom news:', error);
  }
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

/**
 * Get cached news if it's still valid
 */
export function getCachedNews(): any[] | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.CACHED_NEWS_TIMESTAMP);
    if (!timestamp) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION_MS) {
      // Cache expired
      return null;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_NEWS);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error loading cached news:', error);
    return null;
  }
}

/**
 * Save news to cache with current timestamp
 */
export function saveCachedNews(newsItems: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_NEWS, JSON.stringify(newsItems));
    localStorage.setItem(STORAGE_KEYS.CACHED_NEWS_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Error saving cached news:', error);
  }
}

/**
 * Check if cached news is still valid
 */
export function isCacheValid(): boolean {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.CACHED_NEWS_TIMESTAMP);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp, 10);
    return age <= CACHE_DURATION_MS;
  } catch (error) {
    return false;
  }
}
