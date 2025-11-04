import { loadSourcesConfig } from './configManager.js';
import { buildSourcesFromConfig } from './fetcherFactory.js';
import { updateSourceAnnouncements } from './storage.js';

// Load sources dynamically from configuration
let SOURCES = {};
let configLoaded = false;

/**
 * Initialize sources from configuration
 */
function initializeSources() {
    if (!configLoaded) {
        try {
            const config = loadSourcesConfig();
            SOURCES = buildSourcesFromConfig(config);
            configLoaded = true;
        } catch (error) {
            console.error('Failed to load sources configuration:', error.message);
            throw error;
        }
    }
}

/**
 * Get the SOURCES object (lazy initialization)
 */
export function getSources() {
    initializeSources();
    return SOURCES;
}

/**
 * Fetch announcements from a specific source
 */
export async function fetchSourceAnnouncements(sourceKey) {
    initializeSources();
    
    const source = SOURCES[sourceKey];
    
    if (!source) {
        throw new Error(`Unknown source: ${sourceKey}`);
    }
    
    try {
        const announcements = await source.fetcher();
        await updateSourceAnnouncements(sourceKey, announcements);
        return {
            success: true,
            source: sourceKey,
            count: announcements.length,
            announcements
        };
    } catch (error) {
        return {
            success: false,
            source: sourceKey,
            error: error.message,
            announcements: []
        };
    }
}

/**
 * Fetch announcements from all sources in parallel
 */
export async function fetchAllAnnouncements(onProgress) {
    initializeSources();
    
    const sourceKeys = Object.keys(SOURCES);
    const results = [];
    
    // Fetch all sources with rate limiting
    for (let i = 0; i < sourceKeys.length; i++) {
        const sourceKey = sourceKeys[i];
        
        if (onProgress) {
            onProgress({
                current: i + 1,
                total: sourceKeys.length,
                source: SOURCES[sourceKey].name
            });
        }
        
        const result = await fetchSourceAnnouncements(sourceKey);
        results.push(result);
        
        // Add small delay between requests to avoid rate limiting
        if (i < sourceKeys.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
        successful,
        failed,
        totalAnnouncements: successful.reduce((sum, r) => sum + r.count, 0)
    };
}

/**
 * Get list of available sources
 */
export function getAvailableSources() {
    initializeSources();
    
    return Object.entries(SOURCES).map(([key, value]) => ({
        key,
        name: value.name,
        description: value.description
    }));
}

/**
 * Get source metadata
 */
export function getSourceInfo(sourceKey) {
    initializeSources();
    
    return SOURCES[sourceKey] || null;
}

/**
 * Reload sources from configuration (useful for config changes)
 */
export function reloadSources() {
    configLoaded = false;
    initializeSources();
    return SOURCES;
}
