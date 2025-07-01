import { config } from "./config";
import { logger } from "./utils/logger";
import { fetchAppData, getMockAppData } from "./services/api";
import { createBrowserSession, closeBrowserSession } from "./core/browser";
import {
  processAppsInParallel,
  processMultipleApps,
  processPagesInParallel,
} from "./core/app-processor";
import type { ProcessingResult } from "./types";

interface CommandLineArgs {
  platform?: string;
  pages?: string[];
  apps?: string[];
  dryRun?: boolean;
  mock?: boolean;
  help?: boolean;
  parallelApps?: number;
  parallelPages?: boolean;
  maxConcurrent?: number;
}

const parseCommandLineArgs = (): CommandLineArgs => {
  const args: CommandLineArgs = {};
  const argv = process.argv.slice(2);

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
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--mock":
        args.mock = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--parallel-apps":
        args.parallelApps = parseInt(argv[++i]) || 3;
        break;
      case "--parallel-pages":
        args.parallelPages = true;
        break;
      case "--max-concurrent":
        args.maxConcurrent = parseInt(argv[++i]) || 3;
        break;
    }
  }

  return args;
};

const showHelp = (): void => {
  console.log(`
App Automation Tool

Usage: bun run src/main.ts [options]

Options:
  --platform <name>     Platform to process (google_play, app_store, all)
  --pages <pages>       Comma-separated list of pages to process
  --apps <app_ids>      Comma-separated list of app IDs to process
  --dry-run            Run without making actual changes
  --mock               Use mock data instead of API
  --help, -h           Show this help message

Examples:
  bun run src/main.ts --platform google_play --pages data_safety
  bun run src/main.ts --platform app_store --apps 366,367 --dry-run
  bun run src/main.ts --platform all --mock
  `);
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

  // Group by platform
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

  logger.info("=== PROCESSING SUMMARY ===");
  logger.info(`Total operations: ${summary.total}`);
  logger.info(`Successful: ${summary.successful}`);
  logger.info(`Failed: ${summary.failed}`);

  Object.entries(summary.byPlatform).forEach(([platform, stats]) => {
    logger.info(`\n${platform.toUpperCase()}:`);
    logger.info(`  Total: ${stats.total}`);
    logger.info(`  Successful: ${stats.successful}`);
    logger.info(`  Failed: ${stats.failed}`);
  });

  const failedResults = results.filter((r) => !r.success);
  if (failedResults.length > 0) {
    logger.info("\n=== ERRORS ===");
    failedResults.forEach((result) => {
      logger.error(
        `App ${result.app_id} (${result.platform}/${
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
  settings: any,
  selectedApps?: string[],
  parallelOptions?: { apps?: number; pages?: boolean }
): Promise<ProcessingResult[]> => {
  const platform = config.platforms[platformName];
  if (!platform) {
    throw new Error(`Platform not found: ${platformName}`);
  }

  const availablePages = Object.keys(platform.pages);
  const validPages = pageNames.filter((page) => availablePages.includes(page));

  if (validPages.length === 0) {
    throw new Error(
      `No valid pages found. Available pages: ${availablePages.join(", ")}`
    );
  }

  const createSession = () =>
    createBrowserSession(platformName as any, { validateAuth: false });

  // //* Filter apps based on selection
  const filteredApps = selectedApps?.length
    ? appData.filter((app) => selectedApps.includes(app.app_id))
    : appData;

  // //* Parallel apps processing
  // if (parallelOptions?.apps && parallelOptions.apps > 1) {
  //   logger.info(
  //     `\n Processing apps in parallel with ${parallelOptions.apps} concurrent apps`
  //   );
  //   return await processAppsInParallel(
  //     filteredApps,
  //     platform,
  //     platformName,
  //     validPages,
  //     {
  //       ...settings,
  //       max_concurrent: parallelOptions.apps,
  //     },
  //     createSession,
  //     closeBrowserSession,
  //     selectedApps
  //   );
  // }

  // //* Parallel pages processing
  // if (parallelOptions?.pages) {
  //   logger.info(`\nProcessing pages in parallel for each app`);
  //   const allResults: ProcessingResult[] = [];
  //   for (const app of filteredApps) {
  //     const results = await processPagesInParallel(
  //       app,
  //       platform,
  //       platformName,
  //       validPages,
  //       settings
  //     );
  //     allResults.push(...results);
  //   }
  //   return allResults;
  // }

  //* Fallback to sequential processing
  logger.info(`\nProcessing apps sequentially`);
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

    logger.info("Starting App Automation Tool");

    // Merge settings
    const settings = {
      ...config.settings,
      dry_run: args.dryRun || config.settings.dry_run,
    };

    if (settings.dry_run) {
      logger.info("Running in DRY RUN mode - no actual changes will be made");
    }

    // Fetch app data
    const appData = args.mock ? getMockAppData() : await fetchAppData();

    const selectedApps = args.apps || config.selected_apps;
    const platformsToProcess =
      args.platform === "all"
        ? Object.keys(config.platforms)
        : [args.platform || "google_play"];

    const allResults: ProcessingResult[] = [];

    for (const platformName of platformsToProcess) {
      try {
        logger.info(`Processing platform: ${platformName}`);

        const platform = config.platforms[platformName];
        const defaultPages = Object.keys(platform?.pages || {});
        const pagesToProcess = args.pages || defaultPages;

        const results = await processPlatform(
          platformName,
          pagesToProcess,
          appData,
          settings,
          selectedApps,
          {
            apps: args.parallelApps,
            pages: args.parallelPages,
          }
        );

        allResults.push(...results);
      } catch (error) {
        logger.error(`Failed to process platform ${platformName}`, error);
      }
    }

    generateReport(allResults);
  } catch (error) {
    logger.error("Application failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

if (import.meta.main) {
  main();
}

export { main };
