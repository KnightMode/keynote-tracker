import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TableView from './TableView.jsx';
import { formatRelativeTime } from '../utils/dateFormatter.js';

/**
 * Announcement list with table layout (k9s style)
 * Shows: Date | Title | Category | Tags
 */
export default function AnnouncementList({
    announcements,
    sourceName,
    onSelect,
    selectedAnnouncement,
    isActive = true
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    // Number of items to display at once (fits most terminal heights)
    const VISIBLE_ITEMS = 15;

    // Reset to top when announcements list changes (new source selected)
    useEffect(() => {
        setSelectedIndex(0);
        setScrollOffset(0);
    }, [announcements]);

    // Handle keyboard input
    useInput((input, key) => {
        if (!isActive) return;

        if (key.upArrow) {
            setSelectedIndex(prev => {
                const newIndex = Math.max(0, prev - 1);
                // Adjust scroll offset if moving above visible window
                if (newIndex < scrollOffset) {
                    setScrollOffset(newIndex);
                }
                return newIndex;
            });
        } else if (key.downArrow) {
            setSelectedIndex(prev => {
                const newIndex = Math.min(announcements.length - 1, prev + 1);
                // Adjust scroll offset if moving below visible window
                if (newIndex >= scrollOffset + VISIBLE_ITEMS) {
                    setScrollOffset(newIndex - VISIBLE_ITEMS + 1);
                }
                return newIndex;
            });
        } else if (key.return) {
            onSelect(announcements[selectedIndex]);
        }
    });

    if (!announcements || announcements.length === 0) {
        return (
            <Box flexDirection="column" padding={2}>
                <Box>
                    <Text color="yellow">No announcements found</Text>
                </Box>
                <Box marginTop={1}>
                    <Text dimColor>Try refreshing sources</Text>
                </Box>
            </Box>
        );
    }

    // Calculate visible window of announcements
    const visibleAnnouncements = announcements.slice(
        scrollOffset,
        scrollOffset + VISIBLE_ITEMS
    );

    // Prepare table data for visible items only
    const tableData = visibleAnnouncements.map(announcement => {
        const date = formatRelativeTime(announcement.date);
        const title = announcement.title || 'Untitled';
        const category = announcement.category || 'General';
        const tags = announcement.tags && announcement.tags.length > 0
            ? announcement.tags.slice(0, 2).join(', ')
            : '-';

        return {
            date,
            title,
            category,
            tags
        };
    });

    // Define columns
    const columns = [
        {
            key: 'date',
            header: 'Date',
            width: 12,
            align: 'left',
            color: 'green'
        },
        {
            key: 'title',
            header: 'Title',
            maxWidth: 80,
            align: 'left',
            wrap: true
        },
        {
            key: 'category',
            header: 'Category',
            width: 15,
            align: 'left',
            color: 'magenta'
        },
        {
            key: 'tags',
            header: 'Tags',
            width: 20,
            align: 'left',
            color: 'blue',
            dimmed: true
        }
    ];

    // Calculate relative selected index within visible window
    const relativeSelectedIndex = selectedIndex - scrollOffset;

    return (
        <Box flexDirection="column">
            <TableView
                columns={columns}
                data={tableData}
                selectedIndex={relativeSelectedIndex}
                showHeader={true}
            />

            {/* Scroll indicator */}
            {announcements.length > VISIBLE_ITEMS && (
                <Box marginTop={1}>
                    <Text dimColor>
                        Showing {scrollOffset + 1}-{Math.min(scrollOffset + VISIBLE_ITEMS, announcements.length)} of {announcements.length} announcements
                    </Text>
                </Box>
            )}
        </Box>
    );
}
