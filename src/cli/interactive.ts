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

  // App selection
  const appChoices = [
    { name: "All configured apps", value: "all" },
    { name: "Custom selection", value: "custom" },
  ];

  const appSelection = await select({
    message: "Select apps to process:",
    choices: appChoices,
  });

  let apps: string[] = [];
  if (appSelection === "all") {
    apps = config.selected_apps || [];
  } else {
    const customApps = await input({
      message: "Enter app IDs (comma-separated):",
      default: config.selected_apps?.join(",") || "",
    });
    apps = customApps
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Processing options
  const dryRun = await confirm({
    message: "Run in dry-run mode (no actual changes)?",
    default: false,
  });

  const mock = await confirm({
    message: "Use mock data instead of API?",
    default: false,
  });

  const parallelPages = await confirm({
    message: "Process pages in parallel (faster but uses more resources)?",
    default: true,
  });

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

  // Summary
  console.log(chalk.bold.green("\n📋 Configuration Summary:"));
  console.log(chalk.gray("─".repeat(40)));
  console.log(`${chalk.bold("Platforms:")} ${platforms.join(", ")}`);

  Object.entries(pages).forEach(([platform, pageList]) => {
    console.log(`${chalk.bold(`${platform} pages:`)} ${pageList.join(", ")}`);
  });

  console.log(
    `${chalk.bold("Apps:")} ${apps.length ? apps.join(", ") : "All configured"}`
  );
  console.log(`${chalk.bold("Mode:")} ${dryRun ? "Dry Run" : "Live"}`);
  console.log(`${chalk.bold("Data:")} ${mock ? "Mock" : "API"}`);
  console.log(
    `${chalk.bold("Processing:")} ${
      parallelPages ? "Parallel pages" : "Sequential"
    }`
  );
  console.log(`${chalk.bold("Logging:")} ${logLevel}`);

  const proceed = await confirm({
    message: "\nProceed with this configuration?",
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("Operation cancelled."));
    process.exit(0);
  }

  return {
    platforms,
    pages,
    apps,
    dryRun,
    mock,
    logLevel,
    parallelPages,
  };
};
