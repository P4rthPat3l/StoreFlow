# AppFlowSync

Automated application synchronization tool for managing app data across different platforms (Google Play and App Store).

## Features

- Automated synchronization of app data between platforms
- Interactive CLI interface for manual control
- Parallel processing capabilities
- Browser automation using Playwright
- Configurable settings for each platform
- Comprehensive logging and error handling
- Mock data support for testing

## Requirements

- Node.js (latest LTS version)
- Bun (recommended) or npm
- TypeScript ^5
- Playwright ^1.53.1
- Sharp ^0.34.2

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/AppFlowSync.git
cd AppFlowSync
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment:

   a. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

````

   b. Update `.env` with your configuration:
   - API Configuration:
     ```
     API_URL=https://manage.sparissimofood.com/api/restaurants/get-app-details
     API_TIMEOUT=30000
     ```

   - Browser Configuration:
     ```
     BROWSER_HEADLESS=false
     BROWSER_SLOW_MO=100
     BROWSER_TIMEOUT=30000
     ```

   - Authentication:
     ```
     AUTH_FILE=auth.json
     GOOGLE_PLAY_AUTH_FILE=google-play-auth.json
     APP_STORE_AUTH_FILE=app-store-auth.json
     ```

   - Logging:
     ```
     LOG_LEVEL=info
     DEBUG=false
     ```

   - Processing Settings:
     ```
     MAX_RETRIES=3
     PROCESS_DELAY=2000
     ```

4. Set up authentication:

   a. Run the tool to generate auth files:
   ```bash
   bun run index.ts
````

This will create the following authentication files:

- `auth.json`: Main authentication file
- `google-play-auth.json`: Google Play authentication
- `app-store-auth.json`: App Store authentication

b. For platform-specific authentication data:

```bash
mkdir -p auth-data app-store-auth-data
```

## Usage

### Command Line Interface

The tool can be run with various command line options:

```bash
# Basic usage
bun run index.ts

# With specific options
bun run index.ts \
  --platform google-play \
  --pages "store-listing,pricing" \
  --apps "app1,app2" \
  --parallel-pages
```

Available options:

- `--platform`: Target platform (google-play or app-store)
- `--pages`: Comma-separated list of pages to process
- `--apps`: Comma-separated list of apps to process
- `--parallel-pages`: Process pages in parallel
- `--interactive`: Enable interactive CLI mode
- `--logLevel`: Set logging level (debug, info, warn, error)

### Interactive Mode

Run the tool without any arguments to enter interactive mode:

```bash
bun run index.ts
```

The interactive mode will guide you through:

1. Platform selection
2. Page selection
3. App selection
4. Processing options

## Configuration

The tool uses configuration files located in the `src/config` directory:

- `google-play/index.ts`: Google Play platform configuration
- `app-store/index.ts`: App Store platform configuration

Platform-specific settings can be configured in the `.env` file and platform-specific auth files.

## Development

### Running Tests

```bash
bun test
# or
npm test
```

### Building

```bash
bun run build
# or
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
