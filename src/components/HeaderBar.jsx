import React from 'react';
import { Box, Text } from 'ink';

/**
 * Top header bar showing context and keyboard shortcuts
 * Inspired by k9s command bar
 */
export default function HeaderBar({ 
  context, 
  shortcuts = [],
  icon = '📡'
}) {
  return (
    <Box 
      flexDirection="column" 
      borderStyle="round" 
      borderColor="cyan" 
      paddingX={1}
      marginBottom={1}
      flexShrink={0}
      flexGrow={0}
      minHeight={0}
    >
      <Box flexShrink={0} flexGrow={0}>
        {/* Context */}
        <Text color="cyan" bold>
          {icon} {context}
        </Text>
        
        <Text dimColor> │ </Text>
        
        {/* Shortcuts */}
        {shortcuts.map((shortcut, index) => (
          <React.Fragment key={index}>
            <Text dimColor>&lt;</Text>
            <Text color="yellow">{shortcut.key}</Text>
            <Text dimColor>&gt;</Text>
            <Text> {shortcut.label}</Text>
            {index < shortcuts.length - 1 && <Text dimColor> • </Text>}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

