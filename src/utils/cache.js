/**
 * Cache utilities for managing data freshness
 */

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if cache is stale
 */
export function isCacheStale(lastFetchTime) {
    if (!lastFetchTime) return true;

    const now = Date.now();
    const timeSinceLastFetch = now - new Date(lastFetchTime).getTime();

    return timeSinceLastFetch > CACHE_DURATION;
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * Deduplicate announcements by URL or title
 */
export function deduplicateAnnouncements(announcements) {
    const seen = new Set();
    const unique = [];

    for (const announcement of announcements) {
        const key = announcement.link || announcement.title;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(announcement);
        }
    }

    return unique;
}

/**
 * Merge new announcements with existing ones
 */
export function mergeAnnouncements(existing, newItems) {
    const combined = [...existing, ...newItems];
    const deduplicated = deduplicateAnnouncements(combined);

    // Sort by date (newest first)
    return deduplicated.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
}

