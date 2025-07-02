import { config } from "./config";
import { processMultipleApps } from "./core/app-processor";
import { closeBrowserSession, createBrowserSession } from "./core/browser";
import { fetchAppData, getMockAppData } from "./services/api";
import type { Config, ProcessingResult } from "./types";
import { logger } from "./utils/logger";
import { runInteractiveCLI } from "./cli/interactive";
import chalk from "chalk";

interface CommandLineArgs {
  platform?: string;
  pages?: string[];
  apps?: string[];
  // dryRun?: boolean;
  mock?: boolean;
  help?: boolean;
  parallelPages?: boolean;
  logLevel?: string;
  interactive?: boolean;
}

const parseCommandLineArgs = (): CommandLineArgs => {
  const args: CommandLineArgs = {};
  const argv = process.argv.slice(2);

  //* If no args provided, enable interactive mode
  if (argv.length === 0) {
    args.interactive = true;
    return args;
  }

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--platform":
        args.platform = argv[++i];
        break;
      case "--pages":
        args.pages = argv[++i]?.split(",") || [];
        break;
      case "--apps":
        args.apps = argv[++i]?.split(",") || [];
        break;
      // case "--dry-run":
      //   args.dryRun = true;
      //   break;
      // case "--mock":
      //   args.mock = true;
      //   break;
      case "--parallel-pages":
        args.parallelPages = true;
        break;
      case "--log-level":
        args.logLevel = argv[++i];
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
    }
  }

  return args;
};

const showHelp = (): void => {
  console.log(
    chalk.cyan(`
🚀 App Automation Tool

Usage: 
  bun run src/main.ts                    # Interactive mode
  bun run src/main.ts [options]          # Direct mode

Options:
  --platform <name>     Platform: google_play, app_store, all
  --pages <pages>       Comma-separated pages to process
  --apps <app_ids>      Comma-separated app IDs
  --parallel-pages     Process pages in parallel
  --log-level <level>  debug, info, warn, error
  --help, -h           Show this help

Examples:
  bun run src/main.ts --platform google_play
  bun run src/main.ts --platform app_store --apps 366,367
  bun run src/main.ts --platform all --parallel-pages
  `)
  );
};

const generateReport = (results: ProcessingResult[]): void => {
  const summary = {
    total: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    byPlatform: {} as Record<
      string,
      { total: number; successful: number; failed: number }
    >,
  };

  results.forEach((result) => {
    if (!summary.byPlatform[result.platform]) {
      summary.byPlatform[result.platform] = {
        total: 0,
        successful: 0,
        failed: 0,
      };
    }
    summary.byPlatform[result.platform].total++;
    if (result.success) {
      summary.byPlatform[result.platform].successful++;
    } else {
      summary.byPlatform[result.platform].failed++;
    }
  });

  logger.section("PROCESSING SUMMARY");
  logger.success(
    `Total: ${summary.total} | Success: ${summary.successful} | Failed: ${summary.failed}`
  );

  Object.entries(summary.byPlatform).forEach(([platform, stats]) => {
    console.log(chalk.bold(`\n${platform.toUpperCase()}:`));
    console.log(`  ✅ Success: ${chalk.green(stats.successful)}`);
    console.log(`  ❌ Failed: ${chalk.red(stats.failed)}`);
    console.log(`  📊 Total: ${stats.total}`);
  });

  const failedResults = results.filter((r) => !r.success);
  if (failedResults.length > 0) {
    logger.section("ERRORS");
    failedResults.forEach((result) => {
      logger.error(
        `${result.app_id} (${result.platform}/${
          result.page
        }): ${result.errors.join(", ")}`
      );
    });
  }
};

const processPlatform = async (
  platformName: string,
  pageNames: string[],
  appData: any[],
  settings: Config["settings"],
  selectedApps?: string[]
): Promise<ProcessingResult[]> => {
  const platform = config.platforms[platformName];
  if (!platform) {
    throw new Error(`Platform not found: ${platformName}`);
  }

  const availablePages = Object.keys(platform.pages);
  const validPages = pageNames.filter((page) => availablePages.includes(page));

  if (validPages.length === 0) {
    throw new Error(
      `No valid pages found. Available: ${availablePages.join(", ")}`
    );
  }

  const createSession = () =>
    createBrowserSession(platformName as any, { validateAuth: false });
  const filteredApps = appData;
  // ? appData.filter((app) => selectedApps.includes(app.app_id))
  // : appData;

  logger.progress(`Processing ${filteredApps.length} apps on ${platformName}`);
  logger.debug(`Filtered apps: ${JSON.stringify(filteredApps)}`);

  return await processMultipleApps(
    filteredApps,
    platform,
    platformName,
    validPages,
    settings,
    createSession,
    closeBrowserSession,
    selectedApps
  );
};

const main = async (): Promise<void> => {
  try {
    const args = parseCommandLineArgs();

    if (args.help) {
      showHelp();
      return;
    }

    let processingConfig: any;

    if (args.interactive) {
      // Interactive mode
      processingConfig = await runInteractiveCLI();
      logger.setLevel(processingConfig.logLevel);
    } else {
      // Direct mode with args
      logger.setLevel((args.logLevel as any) || "info");
      processingConfig = {
        platforms:
          args.platform === "all"
            ? Object.keys(config.platforms)
            : [args.platform || "google_play"],
        pages: Object.fromEntries(
          (args.platform === "all"
            ? Object.keys(config.platforms)
            : [args.platform || "google_play"]
          ).map((p) => [
            p,
            args.pages || Object.keys(config.platforms[p]?.pages || {}),
          ])
        ),
        apps: args.apps || config.selected_apps || [],
        // dryRun: args.dryRun || false,
        // mock: args.mock || false,
        parallelPages: args.parallelPages || false,
      };
    }

    const settings = {
      ...config.settings,
      // dry_run: processingConfig.dryRun,
    };

    // if (settings.dry_run) {
    //   logger.warn("DRY RUN MODE - No actual changes will be made");
    // }

    logger.progress("Fetching app data...");
    const appData = await fetchAppData();
    // const appData = processingConfig.mock
    //   ? getMockAppData()
    //   : await fetchAppData();
    logger.success(`Loaded ${appData.length} apps`);

    const allResults: ProcessingResult[] = [];

    logger.info(
      `Processing ${
        processingConfig.apps.length
      } apps on ${processingConfig.platforms.join(", ")}`
    );

    for (const platformName of processingConfig.platforms) {
      try {
        logger.section(`Processing ${platformName.toUpperCase()}`);

        const pagesToProcess = processingConfig.pages[platformName] || [];
        const results = await processPlatform(
          platformName,
          pagesToProcess,
          appData,
          settings,
          processingConfig.apps
        );

        allResults.push(...results);
        logger.success(`Completed ${platformName}`);
      } catch (error) {
        logger.error(`Failed to process ${platformName}`, error);
      }
    }

    generateReport(allResults);
    logger.success("All processing completed!");
  } catch (error) {
    logger.error("Application failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n👋 Gracefully shutting down..."));
  process.exit(0);
});

if (import.meta.main) {
  main();
}

export { main };
