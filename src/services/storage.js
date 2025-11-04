import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { isCacheStale, getCurrentTimestamp, mergeAnnouncements } from '../utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use user data directory for cross-platform compatibility
// This works for both development and compiled executables
function getDataDir() {
  // Try to use development data directory if it exists and is writable
  const devDataDir = join(__dirname, '../../data');
  
  // Check if we're in a compiled executable (bunfs indicates bundled filesystem)
  const isCompiled = __dirname.includes('$bunfs') || __dirname.includes('keynote-tracker-');
  
  if (!isCompiled && existsSync(devDataDir)) {
    try {
      // Test if directory is writable
      mkdirSync(devDataDir, { recursive: true });
      return devDataDir;
    } catch (e) {
      // Fall through to user data directory
    }
  }
  
  // Use user data directory for compiled builds or if dev directory is not writable
  const userDataDir = join(homedir(), '.keynote-tracker', 'data');
  return userDataDir;
}

const DATA_DIR = getDataDir();
const DATA_FILE = join(DATA_DIR, 'announcements.json');

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Initialize storage with default structure
 */
async function initializeStorage() {
  ensureDataDir();
  
  const defaultData = {
    lastFetch: null,
    sources: {},
    announcements: []
  };
  
  try {
    await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  } catch (error) {
    console.error('Error initializing storage:', error.message);
    return defaultData;
  }
}

/**
 * Load all data from storage
 */
export async function loadData() {
  ensureDataDir();
  
  try {
    if (!existsSync(DATA_FILE)) {
      return await initializeStorage();
    }
    
    const content = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading data:', error.message);
    return await initializeStorage();
  }
}

/**
 * Save all data to storage
 */
export async function saveData(data) {
  ensureDataDir();
  
  try {
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving data:', error.message);
    return false;
  }
}

/**
 * Get announcements for a specific source
 */
export async function getAnnouncementsBySource(source) {
  const data = await loadData();
  return data.announcements.filter(a => a.source === source);
}

/**
 * Get all announcements
 */
export async function getAllAnnouncements() {
  const data = await loadData();
  return data.announcements;
}

/**
 * Update announcements for a specific source
 */
export async function updateSourceAnnouncements(source, newAnnouncements) {
  const data = await loadData();
  
  // Remove existing announcements from this source
  const otherAnnouncements = data.announcements.filter(a => a.source !== source);
  
  // Merge with new announcements
  const mergedAnnouncements = mergeAnnouncements(otherAnnouncements, newAnnouncements);
  
  // Update source last fetch time
  if (!data.sources) {
    data.sources = {};
  }
  data.sources[source] = {
    lastFetch: getCurrentTimestamp(),
    count: newAnnouncements.length
  };
  
  data.announcements = mergedAnnouncements;
  data.lastFetch = getCurrentTimestamp();
  
  await saveData(data);
  return mergedAnnouncements;
}

/**
 * Check if data needs refresh
 */
export async function needsRefresh() {
  const data = await loadData();
  return isCacheStale(data.lastFetch);
}

/**
 * Get cache status
 */
export async function getCacheStatus() {
  const data = await loadData();
  return {
    lastFetch: data.lastFetch,
    isStale: isCacheStale(data.lastFetch),
    totalAnnouncements: data.announcements.length,
    sources: data.sources || {}
  };
}

/**
 * Clear all cached data
 */
export async function clearCache() {
  return await initializeStorage();
}

