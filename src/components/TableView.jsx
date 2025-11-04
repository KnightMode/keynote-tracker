import React from 'react';
import { Box, Text } from 'ink';

/**
 * Generic table component for displaying data in columns
 * Inspired by k9s table layout
 */
export default function TableView({ 
  columns, 
  data, 
  selectedIndex = 0,
  onSelect,
  showHeader = true 
}) {
  // Calculate column widths based on content
  const calculateColumnWidths = () => {
    const widths = columns.map(col => col.width || col.header.length);
    
    data.forEach(row => {
      columns.forEach((col, idx) => {
        const value = row[col.key] || '';
        const valueLength = String(value).length;
        if (!col.width && valueLength > widths[idx]) {
          widths[idx] = Math.min(valueLength, col.maxWidth || 60);
        }
      });
    });
    
    return widths;
  };
  
  const columnWidths = calculateColumnWidths();
  
  // Pad or truncate text to fit column width
  const fitToWidth = (text, width, align = 'left') => {
    const str = String(text || '');
    if (str.length > width) {
      return str.substring(0, width - 1) + '…';
    }
    if (align === 'right') {
      return str.padStart(width, ' ');
    }
    return str.padEnd(width, ' ');
  };
  
  // Render table header
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <Box flexDirection="column">
        <Box>
          {columns.map((col, idx) => (
            <Box key={col.key} width={columnWidths[idx] + 2} marginRight={1}>
              <Text bold color="cyan">
                {fitToWidth(col.header, columnWidths[idx], col.align)}
              </Text>
            </Box>
          ))}
        </Box>
        
        <Box>
          {columns.map((col, idx) => (
            <Box key={`sep-${col.key}`} width={columnWidths[idx] + 2} marginRight={1}>
              <Text dimColor>{'─'.repeat(columnWidths[idx])}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  // Render table row
  const renderRow = (row, index) => {
    const isSelected = index === selectedIndex;
    
    return (
      <Box key={index}>
        {columns.map((col, idx) => {
          let value = row[col.key];
          
          // Apply custom formatter if provided
          if (col.format && value) {
            value = col.format(value, row);
          }
          
          // Check if wrapping is enabled for this column
          const shouldWrap = col.wrap === true;
          const prefix = idx === 0 ? (isSelected ? '▶ ' : '  ') : '';
          const availableWidth = columnWidths[idx] - prefix.length;
          const safeWidth = Math.max(1, availableWidth);
          
          return (
            <Box key={col.key} width={columnWidths[idx] + 2} marginRight={1}>
              <Text 
                color={isSelected ? 'black' : col.color}
                backgroundColor={isSelected ? 'cyan' : undefined}
                bold={isSelected}
                dimColor={!isSelected && col.dimmed}
                wrap={shouldWrap ? 'wrap' : undefined}
              >
                {shouldWrap ? (
                  // For wrapped text, show prefix (only on first column) and full value
                  prefix + value
                ) : (
                  // For non-wrapped text, use fitToWidth with available width
                  prefix + fitToWidth(value, safeWidth, col.align)
                )}
              </Text>
            </Box>
          );
        })}
      </Box>
    );
  };
  
  return (
    <Box flexDirection="column">
      {renderHeader()}
      {data.map((row, index) => renderRow(row, index))}
    </Box>
  );
}

