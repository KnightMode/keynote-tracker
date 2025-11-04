import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { cursorTo, clearScreenDown } from 'node:readline';
import HeaderBar from './HeaderBar.jsx';
import EventSelector from './EventSelector.jsx';
import AnnouncementList from './AnnouncementList.jsx';
import AnnouncementDetail from './AnnouncementDetail.jsx';
import { getAvailableSources, fetchAllAnnouncements, getSourceInfo } from '../services/dataFetcher.js';
import { getAllAnnouncements, getAnnouncementsBySource, getCacheStatus } from '../services/storage.js';

/**
 * Main App Component - K9s-inspired single-pane layout
 * Views: sources -> announcements -> details
 */
export default function App({ forceRefresh = false, specificSource = null }) {
  // View state: 'sources' | 'announcements' | 'details'
  const [currentView, setCurrentView] = useState('sources');
  const [selectedSource, setSelectedSource] = useState(specificSource);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [splashStartTime] = useState(Date.now());
  const hasClearedLoadingRef = useRef(false);
  
  const { stdout } = useStdout();

  const clearScreen = useCallback(() => {
    if (stdout && stdout.isTTY) {
      try {
        cursorTo(stdout, 0, 0);
        clearScreenDown(stdout);
      } catch (error) {
        stdout.write('\u001b[H');
        stdout.write('\u001b[J');
      }
    }
  }, [stdout]);

  useEffect(() => {
    if (loading) {
      clearScreen();
    }
  }, [loading, clearScreen]);

  useEffect(() => {
    if (loading) {
      clearScreen();
    }
  }, [loadingMessage, loading, clearScreen]);

  // Global keyboard shortcuts
  useInput((input, key) => {
    // Q to quit (from any view)
    if (input === 'q' || input === 'Q') {
      process.exit(0);
    }
    
    // ESC to go back
    if (key.escape) {
      handleBack();
    }
  });
  
  // Ensure minimum splash screen display time
  const finishLoading = async () => {
    const MINIMUM_SPLASH_TIME = 2500; // 2.5 seconds minimum display
    const elapsedTime = Date.now() - splashStartTime;
    const remainingTime = Math.max(0, MINIMUM_SPLASH_TIME - elapsedTime);
    
    if (remainingTime > 0) {
      setLoadingMessage('Ready! Starting in a moment...');
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    clearScreen();
    hasClearedLoadingRef.current = true;
    
    setShowSplash(false);
    setLoading(false);
  };

  // Load initial data
  useEffect(() => {
    async function initialize() {
      try {
        setLoadingMessage('Loading cache status...');
        const status = await getCacheStatus();
        setCacheStatus(status);
        
        setLoadingMessage('Loading announcements...');
        const data = await getAllAnnouncements();
        
        // Check if we need to refresh
        const needsRefresh = forceRefresh || status.isStale || data.length === 0;
        
        if (needsRefresh) {
          setLoadingMessage('Fetching latest announcements...');
          await refreshAllData();
        } else {
          await finishLoading();
          
          if (specificSource) {
            await loadSourceAnnouncements(specificSource);
            setCurrentView('announcements');
          }
        }
      } catch (error) {
        console.error('Error initializing:', error);
        await finishLoading();
      }
    }
    
    initialize();
  }, []);
  
  // Refresh all data from sources
  async function refreshAllData() {
    setLoading(true);
    hasClearedLoadingRef.current = false;
    setLoadingMessage('Fetching from all sources...');
    
    try {
      await fetchAllAnnouncements((progress) => {
        setLoadingMessage(`Fetching ${progress.source} (${progress.current}/${progress.total})...`);
      });
      
      setLoadingMessage('Loading updated data...');
      
      // Reload cache status
      const status = await getCacheStatus();
      setCacheStatus(status);
      
      await finishLoading();
      
      if (specificSource) {
        await loadSourceAnnouncements(specificSource);
        setCurrentView('announcements');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      await finishLoading();
    }
  }
  
  // Load announcements for a specific source
  async function loadSourceAnnouncements(sourceKey) {
    try {
      const sourceData = await getAnnouncementsBySource(sourceKey);
      setAnnouncements(sourceData);
      setSelectedSource(sourceKey);
    } catch (error) {
      console.error('Error loading source announcements:', error);
    }
  }
  
  // Handle source selection
  function handleSourceSelect(sourceKey) {
    if (sourceKey === '__refresh__') {
      refreshAllData();
    } else {
      loadSourceAnnouncements(sourceKey);
      setCurrentView('announcements');
    }
  }
  
  // Handle announcement selection
  function handleAnnouncementSelect(announcement) {
    setSelectedAnnouncement(announcement);
    setCurrentView('details');
  }
  
  // Handle back navigation
  function handleBack() {
    if (currentView === 'details') {
      // Clear selection before changing view to prevent scroll position retention
      setSelectedAnnouncement(null);
      setCurrentView('announcements');
    } else if (currentView === 'announcements') {
      setCurrentView('sources');
      setSelectedSource(null);
      setAnnouncements([]);
    }
  }
  
  // Render loading view
  if (loading) {
    return (
      <Box flexDirection="column" minHeight={0} flexGrow={0}>
        <HeaderBar 
          context="Loading"
          shortcuts={[
            { key: 'q', label: 'Quit' }
          ]}
          icon="⏳"
        />
        
        <Box 
          flexDirection="column" 
          padding={2}
          borderStyle="round"
          borderColor="cyan"
          flexShrink={0}
          flexGrow={0}
          minHeight={0}
          alignSelf="flex-start"
          width={80}
        >
          {/* ASCII Art Banner - Only show during initial splash */}
          {showSplash && (
          <Box flexDirection="column" marginBottom={1} paddingX={2} flexShrink={0} flexGrow={0} minHeight={0}>
            <Text color="cyan" bold>
              ╔══════════════════════════════════════════════════════════════╗
            </Text>
            <Text color="cyan" bold>
              ║                                                              ║
            </Text>
            <Text color="cyan" bold>
              ║   ██╗  ██╗███████╗██╗   ██╗███╗   ██╗ ██████╗ ████████╗███████╗
            </Text>
            <Text color="cyan" bold>
              ║   ██║ ██╔╝██╔════╝╚██╗ ██╔╝████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝
            </Text>
            <Text color="cyan" bold>
              ║   █████╔╝ █████╗   ╚████╔╝ ██╔██╗ ██║██║   ██║   ██║   █████╗  
            </Text>
            <Text color="cyan" bold>
              ║   ██╔═██╗ ██╔══╝    ╚██╔╝  ██║╚██╗██║██║   ██║   ██║   ██╔══╝  
            </Text>
            <Text color="cyan" bold>
              ║   ██║  ██╗███████╗   ██║   ██║ ╚████║╚██████╔╝   ██║   ███████╗
            </Text>
            <Text color="cyan" bold>
              ║   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝
            </Text>
            <Text color="cyan" bold>
              ║                                                              ║
            </Text>
            <Text color="yellow" bold>
              ║              📡  T R A C K E R  📡                          ║
            </Text>
            <Text color="cyan" bold>
              ║                                                              ║
            </Text>
            <Text color="green">
              ║        Track the latest from NVIDIA • Meta • Google         ║
            </Text>
            <Text color="green">
              ║                  Apple • Cursor & More                       ║
            </Text>
            <Text color="cyan" bold>
              ║                                                              ║
            </Text>
            <Text color="cyan" bold>
              ╚══════════════════════════════════════════════════════════════╝
            </Text>
          </Box>
          )}
          
          <Box marginBottom={1} marginTop={1} flexShrink={0}>
            <Text color="cyan" bold>
              ⏳
            </Text>
            <Text color="cyan"> {loadingMessage}</Text>
          </Box>
          
          {cacheStatus && (
            <Box borderStyle="round" borderColor="gray" paddingX={1} flexShrink={0}>
              <Text dimColor>
                📦 Cached: {cacheStatus.totalAnnouncements} announcements
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
  
  // Render sources view
  if (currentView === 'sources') {
    const sources = getAvailableSources();
    
    return (
      <Box flexDirection="column" minHeight={0} flexGrow={0}>
        <HeaderBar 
          key="sources"
          context="Sources"
          shortcuts={[
            { key: 'Enter', label: 'Select' },
            { key: 'r', label: 'Refresh' },
            { key: 'q', label: 'Quit' }
          ]}
          icon="📡"
        />
        
        <Box 
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          paddingX={1}
          paddingY={1}
          flexShrink={0}
          flexGrow={0}
          minHeight={0}
          alignSelf="flex-start"
        >
          <EventSelector
            sources={sources}
            onSelect={handleSourceSelect}
            selectedSource={selectedSource}
            isActive={true}
          />
        </Box>
      </Box>
    );
  }
  
  // Render announcements view
  if (currentView === 'announcements') {
    const sourceInfo = getSourceInfo(selectedSource);
    
    return (
      <Box flexDirection="column" minHeight={0} flexGrow={0}>
        <HeaderBar 
          key={`announcements-${selectedSource}`}
          context={`${sourceInfo?.name || selectedSource} Announcements`}
          shortcuts={[
            { key: 'Enter', label: 'View' },
            { key: 'ESC', label: 'Back' },
            { key: 'q', label: 'Quit' }
          ]}
          icon="📰"
        />
        
        <Box 
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          paddingX={1}
          paddingY={1}
          flexShrink={0}
          flexGrow={0}
          minHeight={0}
          alignSelf="flex-start"
        >
          <AnnouncementList
            key={`list-${selectedSource}-${currentView}`}
            announcements={announcements}
            sourceName={sourceInfo?.name || selectedSource}
            onSelect={handleAnnouncementSelect}
            selectedAnnouncement={selectedAnnouncement}
            isActive={true}
          />
        </Box>
      </Box>
    );
  }
  
  // Render details view
  if (currentView === 'details') {
    const sourceInfo = getSourceInfo(selectedSource);
    
    return (
      <Box flexDirection="column" minHeight={0} flexGrow={0}>
        <HeaderBar 
          key={`details-${selectedSource}`}
          context={`${sourceInfo?.name || selectedSource} › Details`}
          shortcuts={[
            { key: 'ESC', label: 'Back' },
            { key: 'q', label: 'Quit' }
          ]}
          icon="📄"
        />
        
        <Box 
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          paddingX={1}
          paddingY={1}
          flexShrink={0}
          flexGrow={0}
          minHeight={0}
          alignSelf="flex-start"
        >
          <AnnouncementDetail
            announcement={selectedAnnouncement}
          />
        </Box>
      </Box>
    );
  }
  
  return null;
}
