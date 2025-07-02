import { select, input, confirm, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface InteractiveConfig {
  platforms: string[];
  pages: Record<string, string[]>;
  apps: string[];
  dryRun: boolean;
  mock: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  parallelPages: boolean;
}

export const runInteractiveCLI = async (): Promise<InteractiveConfig> => {
  logger.setInteractive(true);

  console.log(
    chalk.bold.blue("\n🚀 App Automation Tool - Interactive Setup\n")
  );

  // Platform selection
  const platformChoices = [
    ...Object.keys(config.platforms).map((p) => ({ name: p, value: p })),
    { name: "All platforms", value: "all" },
  ];

  const selectedPlatform = await select({
    message: "Select platform(s) to process:",
    choices: platformChoices,
  });

  const platforms =
    selectedPlatform === "all"
      ? Object.keys(config.platforms)
      : [selectedPlatform];

  // Page selection for each platform
  const pages: Record<string, string[]> = {};

  for (const platform of platforms) {
    const platformConfig = config.platforms[platform];
    if (!platformConfig) continue;

    const availablePages = Object.keys(platformConfig.pages);
    const pageChoices = [
      { name: "All pages", value: "all" },
      ...availablePages.map((p) => ({ name: p, value: p })),
    ];

    const selectedPages = await checkbox({
      message: `Select pages for ${chalk.cyan(platform)}:`,
      choices: pageChoices,
    });

    pages[platform] = selectedPages.includes("all")
      ? availablePages
      : selectedPages;
  }

  // App selection with Google Play app IDs
  let apps: string[] = [];

  for (const platformName of platforms) {
    const platform = config.platforms[platformName];
    if (!platform) continue;

    if (platformName === "google_play") {
      console.log(chalk.bold.cyan("\n📱 Google Play Apps Available:"));
      console.log(chalk.gray("─".repeat(60)));

      // Display available Google Play apps with their mappings
      Object.entries(platform.app_mappings).forEach(
        ([googlePlayId, apiAppId]) => {
          console.log(
            `${chalk.bold("Google Play ID:")} ${chalk.green(
              googlePlayId
            )} ${chalk.gray(`(API app: ${apiAppId})`)}`
          );
        }
      );
      console.log("");

      const appChoices = [
        { name: "All configured Google Play apps", value: "all" },
        { name: "Select specific Google Play apps", value: "custom" },
      ];

      const appSelection = await select({
        message: "Select Google Play apps to process:",
        choices: appChoices,
      });

      if (appSelection === "all") {
        apps.push(...Object.keys(platform.app_mappings));
      } else {
        // Create choices for individual Google Play apps
        const googlePlayAppChoices = Object.entries(platform.app_mappings).map(
          ([googlePlayId, apiAppId]) => ({
            name: `${googlePlayId} (API: ${apiAppId})`,
            value: googlePlayId,
          })
        );

        const selectedGooglePlayApps = await checkbox({
          message: "Select Google Play apps:",
          choices: googlePlayAppChoices,
        });

        apps.push(...selectedGooglePlayApps);
      }
    } else if (platformName === "app_store") {
      console.log(chalk.bold.cyan("\n🍎 App Store Apps Available:"));
      console.log(chalk.gray("─".repeat(60)));

      // Display available App Store apps
      Object.entries(platform.app_mappings).forEach(
        ([appStoreId, apiAppId]) => {
          console.log(
            `${chalk.bold("App Store ID:")} ${chalk.green(
              appStoreId
            )} ${chalk.gray(`(API app: ${apiAppId})`)}`
          );
        }
      );
      console.log("");

      const appChoices = [
        { name: "All configured App Store apps", value: "all" },
        { name: "Select specific App Store apps", value: "custom" },
      ];

      const appSelection = await select({
        message: "Select App Store apps to process:",
        choices: appChoices,
      });

      if (appSelection === "all") {
        apps.push(...Object.keys(platform.app_mappings));
      } else {
        const appStoreAppChoices = Object.entries(platform.app_mappings).map(
          ([appStoreId, apiAppId]) => ({
            name: `${appStoreId} (API: ${apiAppId})`,
            value: appStoreId,
          })
        );

        const selectedAppStoreApps = await checkbox({
          message: "Select App Store apps:",
          choices: appStoreAppChoices,
        });

        apps.push(...selectedAppStoreApps);
      }
    }
  }

  // If no platform-specific selection was made, fall back to manual input
  if (apps.length === 0) {
    console.log(
      chalk.yellow("\n⚠️  No platform-specific apps found. Using manual input.")
    );

    const customApps = await input({
      message: "Enter platform app IDs (comma-separated):",
      default: config.selected_apps?.join(",") || "",
      validate: (input) => {
        if (!input.trim()) {
          return "Please enter at least one app ID";
        }
        return true;
      },
    });

    apps = customApps
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Processing options
  // const dryRun = await confirm({
  //   message: "Run in dry-run mode (no actual changes)?",
  //   default: false,
  // });

  // const mock = await confirm({
  //   message: "Use mock data instead of API?",
  //   default: false,
  // });

  // const parallelPages = await confirm({
  //   message: "Process pages in parallel (faster but uses more resources)?",
  //   default: true,
  // });

  // Logging level
  const logLevel = await select({
    message: "Select logging level:",
    choices: [
      { name: "Debug (verbose)", value: "debug" },
      { name: "Info (default)", value: "info" },
      { name: "Warnings only", value: "warn" },
      { name: "Errors only", value: "error" },
    ],
    default: "info",
  });

  // Enhanced summary with platform-specific app information
  console.log(chalk.bold.green("\n📋 Configuration Summary:"));
  console.log(chalk.gray("─".repeat(50)));
  console.log(`${chalk.bold("Platforms:")} ${platforms.join(", ")}`);

  Object.entries(pages).forEach(([platform, pageList]) => {
    console.log(`${chalk.bold(`${platform} pages:`)} ${pageList.join(", ")}`);
  });

  // Show selected apps with their platform context
  console.log(`${chalk.bold("Selected Apps:")} ${apps.length}`);

  for (const platformName of platforms) {
    const platform = config.platforms[platformName];
    if (!platform) continue;

    const platformApps = apps.filter((appId) => appId in platform.app_mappings);
    if (platformApps.length > 0) {
      console.log(`  ${chalk.cyan(platformName.toUpperCase())}:`);
      platformApps.forEach((platformAppId) => {
        const apiAppId = platform.app_mappings[platformAppId];
        console.log(
          `    ${chalk.green(platformAppId)} ${chalk.gray(
            `→ API: ${apiAppId}`
          )}`
        );
      });
    }
  }

  // console.log(
  //   `${chalk.bold("Mode:")} ${
  //     dryRun ? chalk.yellow("Dry Run") : chalk.green("Live")
  //   }`
  // );
  // console.log(
  //   `${chalk.bold("Data:")} ${mock ? chalk.blue("Mock") : chalk.green("API")}`
  // );
  // console.log(
  //   `${chalk.bold("Processing:")} ${
  //     parallelPages ? chalk.green("Parallel pages") : chalk.blue("Sequential")
  //   }`
  // );
  console.log(`${chalk.bold("Logging:")} ${chalk.cyan(logLevel)}`);

  const proceed = await confirm({
    message: "\nProceed with this configuration?",
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("👋 Operation cancelled."));
    process.exit(0);
  }

  return {
    platforms,
    pages,
    apps,
    // dryRun,
    // mock,
    // parallelPages,
    logLevel,
  };
};
