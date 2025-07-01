import type { Config } from "../types";
import { googlePlayPlatform } from "./google-play";
import { appStorePlatform } from "./app-store";

export const config: Config = {
  platforms: {
    google_play: googlePlayPlatform,
    app_store: appStorePlatform,
  },
  // selected_apps: ["366", "367"],
  selected_apps: ["366"],
  settings: {
    dry_run: false,
    max_retries: 3,
    timeout: 5000,
    max_concurrent_apps: 1,
    max_concurrent_pages: 1,
    enable_parallel_processing: false,
    browser_pool_size: 1,
  },
};

export * from "./google-play";
export * from "./app-store";
