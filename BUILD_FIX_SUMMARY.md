# Build Fix Summary

## Issues Fixed

### 1. UI Rendering Issues (Empty Boxes)

**Error:**
Many empty horizontal boxes/lines appearing when running the compiled executable, especially during loading and refresh operations.

**Root Cause:**
The Ink UI library was trying to fill the entire terminal height with `height="100%"` properties, causing excessive empty boxes to be rendered in compiled executables.

**Solution:**
Fixed all view containers to prevent height expansion:
- **Removed** `height="100%"` from all root Box containers
- Added `alignSelf="flex-start"` to keep content at the top
- Set `flexShrink={0}` on all bordered content boxes  
- Set explicit `height={3}` on HeaderBar component
- Added `width="80"` constraint to loading view

This ensures proper layout rendering in both development and compiled modes, with content staying at the top of the screen instead of filling the entire terminal height.

### 2. Missing `yoga.wasm` Module Error

**Error:**
```
error: Cannot find module './yoga.wasm' from '/$bunfs/root/keynote-tracker-macos'
```

**Root Cause:**
Bun's `--compile` flag doesn't automatically bundle WebAssembly (`.wasm`) files. The Ink library (used for the CLI UI) depends on `yoga.wasm` for layout calculations.

**Solution:**
Updated all build scripts in `package.json` to automatically copy `yoga.wasm` to the `dist/` directory after compilation:

```json
"build:macos": "bun build ./src/index.js --compile --target=bun-darwin-arm64 --outfile dist/keynote-tracker-macos && cp node_modules/yoga-wasm-web/dist/yoga.wasm dist/"
```

### 2. Read-Only Filesystem Error

**Error:**
```
Error: EROFS: read-only file system, mkdir '/data'
```

**Root Cause:**
The compiled executable runs in a bundled filesystem (`$bunfs`) which is read-only. The app was trying to create a data directory using a relative path (`../../data`), which resolved to a location inside the read-only bundle.

**Solution:**
Modified `src/services/storage.js` to intelligently choose the data directory:
- **Development mode**: Uses the project's `data/` directory (relative path)
- **Compiled executable**: Uses `~/.keynote-tracker/data/` in the user's home directory

The detection logic checks if the code is running from a bundled filesystem:
```javascript
const isCompiled = __dirname.includes('$bunfs') || __dirname.includes('keynote-tracker-');
```

## Files Modified

1. **package.json** - Updated all build scripts to copy `yoga.wasm`
2. **src/services/storage.js** - Added smart data directory detection for dev vs. compiled modes
3. **src/components/App.jsx** - Added:
   - Height constraints and flexShrink properties to all views
   - Beautiful ASCII art banner on startup with brand identity
   - Minimum splash screen display time (2.5 seconds) to ensure users can see the banner
4. **src/components/HeaderBar.jsx** - Added explicit height and flexShrink to prevent excessive rendering
5. **INSTALLATION.md** - Added documentation for:
   - Building standalone executables
   - Distributing executables with `yoga.wasm`
   - Data storage locations
   - Troubleshooting common build issues

## Distribution Requirements

When distributing compiled executables, both files must be in the same directory:
1. The executable (e.g., `keynote-tracker-macos`)
2. The `yoga.wasm` file

## Data Storage Locations

- **Development**: `<project-root>/data/announcements.json`
- **Compiled**: `~/.keynote-tracker/data/announcements.json`

## Testing

Verified that:
- ✅ Development mode works (`bun run start`)
- ✅ Compiled executable runs without errors
- ✅ Help command works in compiled mode
- ✅ Data directory is created in the correct location
- ✅ Build scripts automatically copy required files
- ✅ UI rendering is constrained and displays correctly (no empty boxes)
- ✅ All views (sources, announcements, details) render properly

## Build Commands

```bash
# Build for specific platform
bun run build:macos    # macOS (Apple Silicon/Intel)
bun run build:linux    # Linux x64
bun run build:windows  # Windows x64

# Build for all platforms
bun run build:all
```

## Notes

- The `yoga.wasm` file is approximately 400KB
- The compiled executables are self-contained except for the WASM file
- No additional runtime (Node.js/Bun) is required on the target machine
- Data is stored persistently in the user's home directory for compiled builds

