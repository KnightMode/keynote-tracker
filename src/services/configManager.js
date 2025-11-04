import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the user's config directory
 */
function getConfigDirectory() {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join(homeDir, '.config', 'keynote-tracker');
}

/**
 * Get the user's config file path
 */
function getUserConfigPath() {
    return path.join(getConfigDirectory(), 'sources.yaml');
}

/**
 * Get the default config file path (bundled with the app)
 */
function getDefaultConfigPath() {
    return path.join(__dirname, '..', 'config', 'sources.default.yaml');
}

/**
 * Ensure the config directory exists
 */
function ensureConfigDirectory() {
    const configDir = getConfigDirectory();
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
}

/**
 * Initialize user config by copying default if it doesn't exist
 */
function initializeUserConfig() {
    ensureConfigDirectory();
    
    const userConfigPath = getUserConfigPath();
    const defaultConfigPath = getDefaultConfigPath();
    
    if (!fs.existsSync(userConfigPath)) {
        try {
            const defaultConfig = fs.readFileSync(defaultConfigPath, 'utf8');
            fs.writeFileSync(userConfigPath, defaultConfig, 'utf8');
            console.log(`Created default configuration at: ${userConfigPath}`);
        } catch (error) {
            throw new Error(`Failed to initialize config: ${error.message}`);
        }
    }
}

/**
 * Load and parse YAML configuration
 */
function loadConfig(configPath) {
    try {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        return config;
    } catch (error) {
        throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
}

/**
 * Validate source configuration
 */
function validateSourceConfig(sourceKey, sourceConfig) {
    if (!sourceConfig.name) {
        throw new Error(`Source '${sourceKey}' is missing required field: name`);
    }
    
    if (!sourceConfig.description) {
        throw new Error(`Source '${sourceKey}' is missing required field: description`);
    }
    
    if (!sourceConfig.feeds || !Array.isArray(sourceConfig.feeds)) {
        throw new Error(`Source '${sourceKey}' is missing required field: feeds (must be an array)`);
    }
    
    sourceConfig.feeds.forEach((feed, index) => {
        if (!feed.type) {
            throw new Error(`Source '${sourceKey}' feed[${index}] is missing required field: type`);
        }
        
        if (!['rss', 'github', 'api'].includes(feed.type)) {
            throw new Error(`Source '${sourceKey}' feed[${index}] has invalid type: ${feed.type} (must be rss, github, or api)`);
        }
        
        if (feed.type === 'rss' && !feed.url) {
            throw new Error(`Source '${sourceKey}' feed[${index}] (rss) is missing required field: url`);
        }
        
        if (feed.type === 'github' && !feed.repo) {
            throw new Error(`Source '${sourceKey}' feed[${index}] (github) is missing required field: repo`);
        }
        
        if (feed.type === 'api' && !feed.url) {
            throw new Error(`Source '${sourceKey}' feed[${index}] (api) is missing required field: url`);
        }
    });
}

/**
 * Validate entire configuration
 */
function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        throw new Error('Invalid config: must be an object');
    }
    
    if (!config.sources || typeof config.sources !== 'object') {
        throw new Error('Invalid config: missing sources object');
    }
    
    // Validate each source
    Object.entries(config.sources).forEach(([key, source]) => {
        validateSourceConfig(key, source);
    });
    
    return true;
}

/**
 * Load sources configuration from user config directory
 */
export function loadSourcesConfig() {
    try {
        // Initialize user config if needed
        initializeUserConfig();
        
        // Load user config
        const userConfigPath = getUserConfigPath();
        const config = loadConfig(userConfigPath);
        
        // Validate config
        validateConfig(config);
        
        return config;
    } catch (error) {
        console.error('Error loading sources config:', error.message);
        
        // Try to fall back to default config
        try {
            const defaultConfigPath = getDefaultConfigPath();
            const config = loadConfig(defaultConfigPath);
            validateConfig(config);
            console.log('Using default configuration as fallback');
            return config;
        } catch (fallbackError) {
            throw new Error(`Failed to load config: ${error.message}. Fallback also failed: ${fallbackError.message}`);
        }
    }
}

/**
 * Get configuration file path for user reference
 */
export function getConfigPath() {
    return getUserConfigPath();
}

/**
 * Reload configuration (useful for CLI commands)
 */
export function reloadConfig() {
    return loadSourcesConfig();
}

