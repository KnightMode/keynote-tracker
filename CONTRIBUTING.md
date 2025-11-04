# Contributing to Keynote Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new sources
- 🎨 Enhance UI/UX

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/keynote-tracker.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## 📝 Code Style

- Use ES6+ features
- Follow existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🔧 Adding a New Source

1. Create a new file in `src/services/sources/yoursource.js`:

```javascript
import Parser from 'rss-parser';

const parser = new Parser();

export async function fetchYourSourceAnnouncements() {
  const announcements = [];
  
  try {
    const feed = await parser.parseURL('https://example.com/feed.rss');
    
    for (const item of feed.items.slice(0, 20)) {
      announcements.push({
        source: 'yoursource',
        title: item.title,
        date: item.pubDate || item.isoDate,
        description: item.contentSnippet || '',
        content: item.content || '',
        link: item.link,
        category: 'blog',
        tags: item.categories || []
      });
    }
  } catch (error) {
    console.error('Error fetching YourSource:', error.message);
  }
  
  return announcements;
}
```

2. Register in `src/services/dataFetcher.js`:

```javascript
import { fetchYourSourceAnnouncements } from './sources/yoursource.js';

export const SOURCES = {
  // ... existing sources
  yoursource: {
    name: 'Your Source',
    description: 'Description of your source',
    fetcher: fetchYourSourceAnnouncements
  }
};
```

3. Test your source:
   - Run the app: `bun run start`
   - Select "Refresh All Sources"
   - Verify your source appears and loads data

## 🧪 Testing

Before submitting:

1. Test the basic flow:
   - Launch app
   - Select sources
   - View announcements
   - Read details
   - Navigate back

2. Test your changes:
   - `bun run start` - default mode
   - `bun run start refresh` - force refresh
   - `bun run start list yoursource` - specific source

3. Check for errors:
   - No console errors
   - Graceful error handling
   - Proper fallbacks

## 📋 Pull Request Process

1. Update README.md if needed
2. Test all functionality
3. Commit with clear messages:
   - `feat: Add Microsoft source`
   - `fix: Handle empty RSS feeds`
   - `docs: Update installation guide`

4. Push to your fork
5. Open a Pull Request with:
   - Clear description
   - Screenshots (if UI changes)
   - Testing steps

## 🐛 Reporting Bugs

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment (OS, Bun version)

## 💡 Feature Requests

- Describe the feature
- Explain the use case
- Provide examples
- Consider implementation

## 📚 Documentation

- Keep README.md up to date
- Document new features
- Add inline comments
- Update QUICKSTART.md if needed

## 🎨 UI/UX Guidelines

- Maintain consistency
- Use appropriate colors
- Keep navigation intuitive
- Test keyboard shortcuts
- Consider terminal width limits

## 🔍 Code Review

All contributions will be reviewed for:
- Code quality
- Functionality
- Documentation
- Test coverage
- Style consistency

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make Keynote Tracker better. We appreciate your time and effort!

## Questions?

Feel free to:
- Open an issue
- Start a discussion
- Reach out to maintainers

Happy coding! 🚀

