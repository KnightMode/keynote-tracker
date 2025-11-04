import React from 'react';
import { Box, Text } from 'ink';
import { formatDateTime } from '../utils/dateFormatter.js';

/**
 * Strip HTML tags from content for terminal display
 */
function stripHtml(html) {
  if (!html) return '';
  
  let cleaned = html
    // Remove style and script tags with their content
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    // Remove common UI text patterns (case insensitive)
    .replace(/\s*read\s+article\s*/gi, '')
    .replace(/\s*read\s+more\s*/gi, '')
    .replace(/\s*continue\s+reading\s*/gi, '')
    .replace(/\s*learn\s+more\s*/gi, '')
    .replace(/\s*click\s+here\s*/gi, '')
    // Clean up whitespace
    .replace(/\t+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
  
  return cleaned;
}

/**
 * Format content for display
 */
function formatContent(text) {
  if (!text) return '';
  
  const cleaned = stripHtml(text);
  return cleaned;
}

/**
 * Full-width announcement detail view (k9s style)
 */
export default function AnnouncementDetail({ announcement }) {
  const formattedDate = formatDateTime(announcement.date);
  const content = formatContent(announcement.content || announcement.description);
  const tags = announcement.tags && announcement.tags.length > 0 
    ? announcement.tags.join(', ') 
    : 'None';
  
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Title Section */}
      <Box marginBottom={1}>
        <Text bold color="cyan" wrap="wrap">
          {announcement.title}
        </Text>
      </Box>
      
      {/* Metadata Table */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text bold color="yellow">Date:     </Text>
          <Text color="green">{formattedDate}</Text>
        </Box>
        
        <Box>
          <Text bold color="yellow">Category: </Text>
          <Text color="magenta">{announcement.category || 'General'}</Text>
        </Box>
        
        {tags !== 'None' && (
          <Box>
            <Text bold color="yellow">Tags:     </Text>
            <Text color="blue">{tags}</Text>
          </Box>
        )}
        
        <Box>
          <Text bold color="yellow">Link:     </Text>
          <Text color="green">{announcement.link}</Text>
        </Box>
      </Box>
      
      {/* Content Section */}
      <Box 
        flexDirection="column" 
        borderStyle="round" 
        borderColor="gray" 
        paddingX={1}
        paddingY={1}
      >
        <Box marginBottom={1}>
          <Text bold color="yellow">Content</Text>
        </Box>
        <Text wrap="wrap">{content}</Text>
      </Box>
      
      {/* Footer Tip */}
      <Box marginTop={1}>
        <Text dimColor italic>
          💡 Copy the link above to read the full article in your browser
        </Text>
      </Box>
    </Box>
  );
}
