# 📦 Installation & Setup Guide

Complete installation instructions for Keynote Tracker.

## Prerequisites

### 1. Install Bun Runtime

Bun is required to run this application. Install it using one of these methods:

#### macOS / Linux / WSL

```bash
curl -fsSL https://bun.sh/install | bash
```

#### After Installation

Restart your terminal or run:

```bash
source ~/.bashrc  # or ~/.zshrc depending on your shell
```

Verify installation:

```bash
bun --version
```

You should see something like `1.0.0` or higher.

## Project Setup

### Option 1: Clone from Repository (Recommended)

```bash
git clone https://github.com/yourusername/keynote-tracker.git
cd keynote-tracker
bun install
```

### Option 2: Download ZIP

1. Download the project ZIP
2. Extract to a directory
3. Navigate to the directory
4. Run `bun install`

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd keynote-tracker
```

### 2. Install Dependencies

```bash
bun install
```

This will install:
- `ink` - React for CLI interfaces
- `react` - React library
- `ink-select-input` - Interactive selection component
- `ink-spinner` - Loading spinners
- `ink-box` - Box component for layout
- `axios` - HTTP client
- `rss-parser` - RSS feed parser
- `date-fns` - Date formatting utilities

### 3. Make CLI Executable

```bash
chmod +x src/index.js
```

### 4. Test the Application

```bash
bun run start
```

On first run, the app will:
1. Create the `data` directory
2. Fetch announcements from all sources (~10-30 seconds)
3. Save data to `data/announcements.json`
4. Display the interactive menu

## Optional: Global Installation

To use `keynote-tracker` command from anywhere:

```bash
bun link
```

Now you can run from any directory:

```bash
keynote-tracker
```

## Building Standalone Executables

You can create standalone executables that don't require Bun or Node.js to be installed:

### Build for Your Platform

```bash
# macOS (Apple Silicon/Intel)
bun run build:macos

# Linux
bun run build:linux

# Windows
bun run build:windows

# Build all platforms
bun run build:all
```

### Distributing Executables

The compiled executables will be in the `dist/` directory:

- **macOS**: `dist/keynote-tracker-macos`
- **Linux**: `dist/keynote-tracker-linux`
- **Windows**: `dist/keynote-tracker-windows.exe`

**Important**: When distributing, you must include both files together:
1. The executable file (e.g., `keynote-tracker-macos`)
2. The `yoga.wasm` file (automatically copied to `dist/` during build)

Both files must be in the same directory for the executable to work.

### Data Storage

- **Development mode**: Data is stored in the project's `data/` directory
- **Compiled executable**: Data is stored in `~/.keynote-tracker/data/` (user's home directory)

This ensures the compiled executable can run from any location without requiring write access to its installation directory.

## Verify Installation

Run the following to ensure everything works:

```bash
# Test basic functionality
bun run start

# Test refresh
bun run start refresh

# Test specific source
bun run start list nvidia

# Test help
bun run start help
```

## Directory Structure After Installation

```
keynote-tracker/
├── node_modules/          # Dependencies (auto-generated)
├── data/                  # Cache directory
│   └── announcements.json # Cached data (auto-generated)
├── src/                   # Source code
├── package.json
├── bunfig.toml
└── README.md
```

## Troubleshooting Installation

### Bun command not found

**Problem**: `command not found: bun`

**Solution**:
1. Verify Bun is installed: Check `~/.bun/bin/bun` exists
2. Add to PATH: `export PATH="$HOME/.bun/bin:$PATH"`
3. Restart terminal
4. Try installation again

### Permission denied

**Problem**: `Permission denied` when running the CLI

**Solution**:
```bash
chmod +x src/index.js
```

### Dependencies not installing

**Problem**: Errors during `bun install`

**Solution**:
1. Remove node_modules: `rm -rf node_modules`
2. Clear Bun cache: `rm -rf ~/.bun/install/cache`
3. Reinstall: `bun install`

### Module not found errors

**Problem**: `Cannot find module` errors

**Solution**:
1. Ensure you're in the project directory
2. Run `bun install` again
3. Check that all source files are present

### Compiled executable errors

**Problem**: `Cannot find module './yoga.wasm'`

**Solution**:
- This happens when the `yoga.wasm` file is missing from the dist directory
- The build scripts automatically copy this file, but if you moved the executable:
  ```bash
  # Copy yoga.wasm to the same directory as your executable
  cp node_modules/yoga-wasm-web/dist/yoga.wasm dist/
  ```
- When distributing, always include both the executable and `yoga.wasm` in the same directory

**Problem**: `EROFS: read-only file system, mkdir '/data'`

**Solution**:
- This issue has been fixed in the current version
- The app now stores data in `~/.keynote-tracker/data/` for compiled executables
- If you see this error, rebuild the executable:
  ```bash
  bun run build:macos  # or your target platform
  ```

**Problem**: Many empty horizontal boxes/lines when running compiled executable

**Solution**:
- This UI rendering issue has been fixed in the current version
- The issue was caused by improper terminal size detection in compiled mode
- If you see this, rebuild the executable with the latest code:
  ```bash
  bun run build:macos  # or your target platform
  ```

### Network errors during first run

**Problem**: Timeout or network errors when fetching

**Solution**:
1. Check internet connection
2. Wait a moment and try again
3. Some RSS feeds may be temporarily unavailable
4. The app will continue with available sources

## Updating

To update to the latest version:

```bash
cd keynote-tracker
git pull origin main  # if using git
bun install           # update dependencies
```

## Uninstallation

To remove Keynote Tracker:

```bash
# If globally linked
bun unlink

# Remove the directory
cd ..
rm -rf keynote-tracker
```

To remove Bun (if desired):

```bash
rm -rf ~/.bun
# Remove from PATH in your shell config file
```

## System Requirements

- **OS**: macOS, Linux, or Windows (WSL)
- **RAM**: 100MB minimum
- **Disk**: 50MB for app + dependencies
- **Network**: Internet connection for fetching announcements

## Next Steps

After successful installation:

1. Read [QUICKSTART.md](QUICKSTART.md) for usage guide
2. Read [README.md](README.md) for detailed documentation
3. Check [CONTRIBUTING.md](CONTRIBUTING.md) to add features

## Support

If installation fails:

1. Check this guide's troubleshooting section
2. Verify all prerequisites are met
3. Check [GitHub Issues](https://github.com/yourusername/keynote-tracker/issues)
4. Create a new issue with:
   - Your OS and version
   - Bun version (`bun --version`)
   - Error messages
   - Steps you tried

---

**Ready?** Run `bun run start` to begin! 🚀

