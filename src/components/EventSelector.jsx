import React, { useState, useEffect } from 'react';
import { Box, useInput } from 'ink';
import TableView from './TableView.jsx';
import { getCacheStatus } from '../services/storage.js';

/**
 * Source selector with table layout (k9s style)
 * Shows: Source | Announcements | Status
 */
export default function EventSelector({ sources, onSelect, selectedSource, isActive = true }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cacheStatus, setCacheStatus] = useState(null);
  
  // Load cache status for announcement counts
  useEffect(() => {
    async function loadStatus() {
      const status = await getCacheStatus();
      setCacheStatus(status);
    }
    loadStatus();
  }, []);
  
  // Find selected source index
  useEffect(() => {
    if (selectedSource) {
      const index = sources.findIndex(s => s.key === selectedSource);
      if (index >= 0) {
        setSelectedIndex(index);
      }
    }
  }, [selectedSource, sources]);
  
  // Handle keyboard input
  useInput((input, key) => {
    if (!isActive) return;
    
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(sources.length - 1, prev + 1));
    } else if (key.return) {
      const source = sources[selectedIndex];
      onSelect(source.key);
    } else if (input === 'r' || input === 'R') {
      onSelect('__refresh__');
    }
  });
  
  // Prepare table data
  const tableData = sources.map(source => {
    const sourceStatus = cacheStatus?.sources?.[source.key];
    const count = sourceStatus?.count || 0;
    const status = count > 0 ? '✓ Cached' : '○ Empty';
    
    return {
      source: source.name,
      count: count.toString().padStart(3, ' '),
      status: status
    };
  });
  
  // Define columns
  const columns = [
    { 
      key: 'source', 
      header: 'Source', 
      width: 18,
      align: 'left'
    },
    { 
      key: 'count', 
      header: 'Announcements', 
      width: 13,
      align: 'right'
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: 15,
      align: 'left',
      color: 'green'
    }
  ];
  
  return (
    <Box flexDirection="column">
      <TableView 
        columns={columns}
        data={tableData}
        selectedIndex={selectedIndex}
        showHeader={true}
      />
    </Box>
  );
}
