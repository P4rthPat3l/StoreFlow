import {
  runAuthSetup,
  setupAuthentication,
  validateAuthSession,
  checkAuthFile,
} from "../core/auth";
import { logger } from "../utils/logger";

interface AuthCliArgs {
  platform?: "google_play" | "app_store";
  force?: boolean;
  validate?: boolean;
  help?: boolean;
}

const parseAuthArgs = (): AuthCliArgs => {
  const args: AuthCliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--platform":
        const platform = argv[++i] as "google_play" | "app_store";
        if (platform === "google_play" || platform === "app_store") {
          args.platform = platform;
        } else {
          logger.error(
            `Invalid platform: ${platform}. Use 'google_play' or 'app_store'`
          );
          process.exit(1);
        }
        break;
      case "--force":
        args.force = true;
        break;
      case "--validate":
        args.validate = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
    }
  }

  return args;
};

const showAuthHelp = (): void => {
  console.log(`
🔐 Authentication Setup Tool
============================

This tool helps you set up authentication sessions for Google Play Console and App Store Connect.

Usage: bun run src/scripts/setup-auth.ts [options]

Options:
  --platform <platform>  Setup auth for specific platform (google_play, app_store)
  --force               Force re-authentication even if session exists
  --validate            Only validate existing authentication sessions
  --help, -h            Show this help message

Examples:
  # Setup authentication for all platforms
  bun run src/scripts/setup-auth.ts

  # Setup only Google Play Console
  bun run src/scripts/setup-auth.ts --platform google_play

  # Force re-authentication for App Store
  bun run src/scripts/setup-auth.ts --platform app_store --force

  # Validate existing sessions
  bun run src/scripts/setup-auth.ts --validate

What this tool does:
===================
1. 🌐 Opens a browser window for the platform
2. 🔍 Checks if you're already logged in
3. ⏳ Waits for you to manually log in (if needed)
4. 💾 Saves your session for future automation
5. ✅ Validates the session works correctly

Important Notes:
===============
- 🔒 Sessions are saved locally and encrypted by Playwright
- 📱 You may need to complete 2FA during setup
- 🕐 Sessions typically last for weeks/months
- 🔄 Run with --force to refresh expired sessions
- 🚫 Never share auth files with others

Security:
========
- Auth files contain encrypted session data
- No passwords are stored in plain text
- Sessions use the same security as your browser
- Files are stored locally on your machine only
  `);
};

const validateAllSessions = async (): Promise<void> => {
  const platforms: Array<"google_play" | "app_store"> = [
    "google_play",
    "app_store",
  ];

  logger.info(`🔍 Validating all authentication sessions...`);

  for (const platform of platforms) {
    logger.info(`\n📱 Checking ${platform.replace("_", " ").toUpperCase()}...`);

    if (!checkAuthFile(platform)) {
      logger.warn(`❌ No auth file found for ${platform}`);
      continue;
    }

    const isValid = await validateAuthSession(platform);
    if (isValid) {
      logger.info(`✅ ${platform} session is valid`);
    } else {
      logger.warn(
        `❌ ${platform} session is invalid - run setup to re-authenticate`
      );
    }
  }
};

const main = async (): Promise<void> => {
  try {
    const args = parseAuthArgs();

    if (args.help) {
      showAuthHelp();
      return;
    }

    logger.info(`🔐 Authentication Setup Tool`);
    logger.info(`${"=".repeat(40)}\n`);

    if (args.validate) {
      await validateAllSessions();
      return;
    }

    if (args.platform) {
      // Setup specific platform
      logger.info(
        `🎯 Setting up authentication for ${args.platform
          .replace("_", " ")
          .toUpperCase()}`
      );
      const success = await setupAuthentication({
        platform: args.platform,
        force: args.force,
      });

      if (success) {
        logger.info(`\n🎉 Authentication setup completed successfully!`);
        logger.info(`You can now run the main automation tool.`);
      } else {
        logger.error(`\n❌ Authentication setup failed.`);
        logger.error(`Please try again or check your internet connection.`);
        process.exit(1);
      }
    } else {
      await runAuthSetup();
    }

    logger.info(`\n📚 Next steps:`);
    logger.info(`1. Update your app mappings in the config files`);
    logger.info(`2. Run the main automation tool:`);
    logger.info(`   bun run src/main.ts --platform google_play --dry-run`);
  } catch (error) {
    logger.error(`💥 Authentication setup failed`, error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  logger.info("\n👋 Authentication setup interrupted");
  process.exit(0);
});

if (import.meta.main) {
  main();
}

export { main };
