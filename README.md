# App Store Automation Tool

A TypeScript-based automation tool built with Bun and Playwright for streamlining app submission processes across Google Play Console and App Store Connect.

## Features

- 🚀 **Multi-Platform Support**: Google Play Console and App Store Connect
- 🔧 **Modular Architecture**: Easily extensible for new platforms
- 🛡️ **Type Safety**: Full TypeScript support with strict types
- 🔄 **Retry Logic**: Robust error handling with configurable retries
- 🎯 **Selective Processing**: Process specific apps and pages
- 🧪 **Dry Run Mode**: Test without making actual changes
- 📊 **Detailed Reporting**: Comprehensive processing summaries

## Quick Start

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up authentication**:

   - Run the tool once to create auth sessions
   - Manual login will be required for first-time setup

3. **Configure your apps**:

   - Update `src/config/google-play/index.ts` with your app mappings
   - Update `src/config/app-store/index.ts` with your app mappings

4. **Run the tool**:

   ```bash
   # Process all apps on Google Play
   bun run src/main.ts --platform google_play

   # Dry run for specific apps
   bun run src/main.ts --platform google_play --apps 366,367 --dry-run

   # Process specific pages
   bun run src/main.ts --platform google_play --pages data_safety
   ```

## Usage Examples

```bash
# Process all platforms
bun run src/main.ts --platform all

# Use mock data for testing
bun run src/main.ts --platform google_play --mock --dry-run

# Process specific apps and pages
bun run src/main.ts --platform app_store --apps 366 --pages app_information
```

## Architecture

The tool follows functional programming principles with a modular architecture:

- `src/types/` - Type definitions
- `src/config/` - Platform-specific configurations
- `src/core/` - Core processing logic
- `src/utils/` - Utility functions
- `src/services/` - External service integrations

## Configuration

Each platform has its own configuration structure:

- **Pages**: Define URL templates and form fields
- **Fields**: Specify selectors, actions, and validation
- **Modals**: Handle dynamic pop-ups and forms
- **App Mappings**: Map API app IDs to platform-specific IDs

## Contributing

1. Follow functional programming principles
2. Maintain type safety
3. Add comprehensive error handling
4. Update documentation for new features
