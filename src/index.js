#!/usr/bin/env bun
import React from 'react';
import { render, Box } from 'ink';
import App from './components/App.jsx';
import { getAvailableSources } from './services/dataFetcher.js';
import { getConfigPath } from './services/configManager.js';

/**
 * Get valid source keys
 */
function getValidSourceKeys() {
    try {
        const sources = getAvailableSources();
        return sources.map(s => s.key);
    } catch (error) {
        console.error('Error loading sources:', error.message);
        return [];
    }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);

    const config = {
        forceRefresh: false,
        specificSource: null,
        showHelp: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case 'refresh':
            case '--refresh':
            case '-r':
                config.forceRefresh = true;
                break;

            case 'list':
            case '--list':
            case '-l':
                if (i + 1 < args.length) {
                    config.specificSource = args[i + 1];
                    i++;
                }
                break;

            case 'help':
            case '--help':
            case '-h':
                config.showHelp = true;
                break;

            default:
                // Check if it's a source name without 'list' prefix
                const validSources = getValidSourceKeys();
                if (validSources.includes(arg.toLowerCase())) {
                    config.specificSource = arg.toLowerCase();
                }
        }
    }

    return config;
}

/**
 * Display help information
 */
function showHelp() {
    const sources = getAvailableSources();
    const configPath = getConfigPath();
    
    // Build sources list dynamically
    let sourcesList = '';
    sources.forEach(source => {
        const padding = ' '.repeat(Math.max(0, 20 - source.key.length));
        sourcesList += `  ${source.key}${padding}${source.description}\n`;
    });
    
    // Use first source as example if available
    const exampleSource = sources.length > 0 ? sources[0].key : 'nvidia';
    
    console.log(`
┌─────────────────────────────────────────────────────┐
│         Keynote Tracker - CLI Tool                 │
│  Track announcements from major tech keynotes       │
└─────────────────────────────────────────────────────┘

USAGE:
  keynote-tracker [command] [options]

COMMANDS:
  (no command)         Launch interactive mode
  refresh              Force refresh all sources
  list <source>        List announcements for a specific source
  help                 Show this help message

OPTIONS:
  -r, --refresh        Force refresh data before displaying
  -l, --list <source>  List announcements from a specific source
  -h, --help          Show help

AVAILABLE SOURCES:
${sourcesList}
EXAMPLES:
  keynote-tracker
    Launch interactive mode

  keynote-tracker refresh
    Refresh all sources and launch interactive mode

  keynote-tracker list ${exampleSource}
    Show ${exampleSource} announcements

  keynote-tracker ${exampleSource}
    Show ${exampleSource} announcements (shorthand)

KEYBOARD SHORTCUTS:
  ↑/↓                 Navigate items
  Enter               Select item
  Ctrl+C              Exit

CONFIGURATION:
  Sources are configured in: ${configPath}
  Edit this file to add, remove, or modify sources.

NOTES:
  - Data is cached locally for 24 hours
  - Use 'refresh' to force update all sources
  - Historical announcements are preserved locally

For more information, visit: https://github.com/yourusername/keynote-tracker
  `);
    process.exit(0);
}

/**
 * Main entry point
 */
function main() {
    const config = parseArgs();

    if (config.showHelp) {
        showHelp();
        return;
    }

    // Render the Ink app with explicit constraints to prevent screen filling
    // Use stdout directly and disable alternate screen buffer
    const { unmount } = render(
        <Box flexDirection="column" flexShrink={1}>
            <App
                forceRefresh={config.forceRefresh}
                specificSource={config.specificSource}
            />
        </Box>,
        {
            stdout: process.stdout,
            stdin: process.stdin,
            patchConsole: false,
            debug: false
        }
    );
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Unexpected error:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error.message);
    process.exit(1);
});

// Run the application
main();

