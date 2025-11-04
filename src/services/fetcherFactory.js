import Parser from 'rss-parser';
import axios from 'axios';

/**
 * Get a nested field value from an object using dot notation or direct access
 */
function getFieldValue(item, fieldPath, fallbackPath = null) {
    if (!fieldPath) return null;
    
    // Try primary field path
    let value = item[fieldPath];
    
    // If not found and fallback exists, try fallback
    if ((value === undefined || value === null) && fallbackPath) {
        value = item[fallbackPath];
    }
    
    return value || null;
}

/**
 * Create an RSS fetcher for a feed configuration
 */
function createRssFetcher(sourceKey, feedConfig) {
    const parser = new Parser({
        customFields: {
            item: ['description', 'content', 'content:encoded']
        }
    });
    
    return async () => {
        const announcements = [];
        
        try {
            const feed = await parser.parseURL(feedConfig.url);
            const limit = feedConfig.limit || 20;
            const items = feed.items.slice(0, limit);
            
            // Default field mappings
            const fields = feedConfig.fields || {
                title: 'title',
                date: 'pubDate',
                description: 'contentSnippet',
                content: 'content',
                link: 'link',
                tags: 'categories'
            };
            
            for (const item of items) {
                // Extract fields with fallback support
                const title = getFieldValue(item, fields.title, fields.titleFallback) || 'Untitled';
                const date = getFieldValue(item, fields.date, fields.dateFallback) || item.isoDate;
                let description = getFieldValue(item, fields.description, fields.descriptionFallback);
                const content = getFieldValue(item, fields.content, fields.contentFallback);
                const link = getFieldValue(item, fields.link, fields.linkFallback);
                const tags = getFieldValue(item, fields.tags, fields.tagsFallback) || [];
                
                // Use content for description if description is not available
                if (!description && content) {
                    description = typeof content === 'string' ? content.substring(0, 300) : '';
                }
                
                announcements.push({
                    source: sourceKey,
                    title,
                    date,
                    description: description || '',
                    content: content || '',
                    link,
                    category: feedConfig.category || 'general',
                    tags: Array.isArray(tags) ? tags : []
                });
            }
        } catch (error) {
            console.error(`Error fetching RSS feed from ${feedConfig.url}:`, error.message);
        }
        
        return announcements;
    };
}

/**
 * Create a GitHub releases fetcher for a feed configuration
 */
function createGithubFetcher(sourceKey, feedConfig) {
    return async () => {
        const announcements = [];
        
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${feedConfig.repo}/releases`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'keynote-tracker',
                        ...(feedConfig.headers || {})
                    },
                    timeout: 10000
                }
            );
            
            const limit = feedConfig.limit || 20;
            const releases = response.data.slice(0, limit);
            
            // Default field mappings for GitHub
            const fields = feedConfig.fields || {
                title: 'name',
                titleFallback: 'tag_name',
                date: 'published_at',
                dateFallback: 'created_at',
                description: 'body',
                content: 'body',
                link: 'html_url'
            };
            
            for (const release of releases) {
                const title = getFieldValue(release, fields.title, fields.titleFallback) || release.tag_name;
                const date = getFieldValue(release, fields.date, fields.dateFallback);
                const body = getFieldValue(release, fields.description, fields.descriptionFallback) || '';
                const content = getFieldValue(release, fields.content, fields.contentFallback) || body;
                const link = getFieldValue(release, fields.link, fields.linkFallback);
                
                // Handle tag logic
                let tags = [];
                if (feedConfig.tagLogic) {
                    try {
                        // Create a safe evaluation context
                        const evalContext = {
                            prerelease: release.prerelease,
                            draft: release.draft,
                            tag_name: release.tag_name
                        };
                        // Simple tag logic evaluation
                        const tagLogic = feedConfig.tagLogic;
                        if (tagLogic.includes('prerelease')) {
                            tags = release.prerelease ? ['prerelease'] : ['release'];
                        }
                    } catch (error) {
                        console.error('Error evaluating tagLogic:', error.message);
                        tags = ['release'];
                    }
                } else {
                    tags = release.prerelease ? ['prerelease'] : ['release'];
                }
                
                announcements.push({
                    source: sourceKey,
                    title,
                    date,
                    description: body ? body.substring(0, 300) : 'New release',
                    content,
                    link,
                    category: feedConfig.category || 'release',
                    tags
                });
            }
        } catch (error) {
            console.error(`Error fetching GitHub releases for ${feedConfig.repo}:`, error.message);
            
            // Add a placeholder announcement on error
            announcements.push({
                source: sourceKey,
                title: `${feedConfig.repo} - Check GitHub for updates`,
                date: new Date().toISOString(),
                description: `Visit GitHub for the latest releases from ${feedConfig.repo}`,
                content: `Unable to fetch releases. Please check: https://github.com/${feedConfig.repo}/releases`,
                link: `https://github.com/${feedConfig.repo}/releases`,
                category: feedConfig.category || 'info',
                tags: ['error']
            });
        }
        
        return announcements;
    };
}

/**
 * Create a custom API fetcher for a feed configuration
 */
function createApiFetcher(sourceKey, feedConfig) {
    return async () => {
        const announcements = [];
        
        try {
            const response = await axios({
                method: feedConfig.method || 'GET',
                url: feedConfig.url,
                headers: feedConfig.headers || { 'User-Agent': 'keynote-tracker' },
                timeout: feedConfig.timeout || 10000
            });
            
            let data = response.data;
            
            // Apply transformation if provided
            if (feedConfig.transform) {
                try {
                    // Create a function from the transform string
                    const transformFn = new Function('data', feedConfig.transform);
                    data = transformFn(data);
                } catch (error) {
                    console.error(`Error applying transform for ${sourceKey}:`, error.message);
                    return announcements;
                }
            }
            
            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.error(`Transform for ${sourceKey} did not return an array`);
                return announcements;
            }
            
            const limit = feedConfig.limit || 20;
            const items = data.slice(0, limit);
            
            for (const item of items) {
                announcements.push({
                    source: sourceKey,
                    title: item.title || 'Untitled',
                    date: item.date || new Date().toISOString(),
                    description: item.description || '',
                    content: item.content || item.description || '',
                    link: item.link || '#',
                    category: item.category || feedConfig.category || 'general',
                    tags: item.tags || []
                });
            }
        } catch (error) {
            console.error(`Error fetching custom API from ${feedConfig.url}:`, error.message);
        }
        
        return announcements;
    };
}

/**
 * Create a fetcher function for a source based on its configuration
 */
export function createSourceFetcher(sourceKey, sourceConfig) {
    const fetchers = sourceConfig.feeds.map(feedConfig => {
        switch (feedConfig.type) {
            case 'rss':
                return createRssFetcher(sourceKey, feedConfig);
            case 'github':
                return createGithubFetcher(sourceKey, feedConfig);
            case 'api':
                return createApiFetcher(sourceKey, feedConfig);
            default:
                throw new Error(`Unknown feed type: ${feedConfig.type}`);
        }
    });
    
    // Return a function that fetches from all feeds and combines results
    return async () => {
        const allAnnouncements = [];
        
        for (const fetcher of fetchers) {
            const announcements = await fetcher();
            allAnnouncements.push(...announcements);
        }
        
        return allAnnouncements;
    };
}

/**
 * Build the SOURCES object from configuration
 */
export function buildSourcesFromConfig(config) {
    const sources = {};
    
    Object.entries(config.sources).forEach(([key, sourceConfig]) => {
        sources[key] = {
            name: sourceConfig.name,
            description: sourceConfig.description,
            fetcher: createSourceFetcher(key, sourceConfig)
        };
    });
    
    return sources;
}

