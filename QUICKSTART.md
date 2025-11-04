# 🚀 Quick Start Guide

Get up and running with Keynote Tracker in 5 minutes!

## Step 1: Install Bun

If you haven't already, install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal after installation.

## Step 2: Install Dependencies

```bash
cd keynote-tracker
bun install
```

## Step 3: Run the App

```bash
bun run start
```

That's it! The app will:
1. Fetch announcements from all sources
2. Cache them locally
3. Display an interactive menu

## Common Commands

```bash
# Interactive mode (default)
bun run start

# Force refresh all sources
bun run start refresh

# View specific source
bun run start list nvidia

# Quick access (shorthand)
bun run start apple

# Get help
bun run start help
```

## First Time Use

On first run, the app will:
- Fetch data from all 5 sources (takes ~10-30 seconds)
- Save announcements to `data/announcements.json`
- Display the source selector

## Navigation

- Use **↑/↓** arrow keys to navigate
- Press **Enter** to select
- Press **Ctrl+C** to exit

## Tips

1. **Speed up launches**: Data is cached for 24 hours, so subsequent launches are instant
2. **Fresh data**: Use `refresh` command to force update
3. **Go global**: Run `bun link` to use `keynote-tracker` command anywhere
4. **Filter sources**: Use `list <source>` to jump directly to a source

## Troubleshooting

**No data showing?**
- Check internet connection
- Try: `bun run start refresh`

**Permission issues?**
- Run: `chmod +x src/index.js`

**Bun not found?**
- Make sure Bun is installed and in your PATH
- Restart terminal after installing Bun

## What's Next?

- Browse different sources
- Read historical announcements
- Check back daily for new updates
- Add your own sources (see README.md)

Happy tracking! 📡

