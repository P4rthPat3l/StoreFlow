import type { Browser, BrowserContext, Page } from "playwright";
import type { AppData, Config, Platform, ProcessingResult } from "../types";
import { logger } from "../utils/logger";
import { validateAppData } from "../utils/validation";
import {
  closeBrowserSession,
  createBrowserSession,
  navigateToPage,
  type BrowserSession,
} from "./browser";
import { selectApp } from "./element-handler";
import { processPageFields, processPageModals } from "./form-processor";

const getAppDataForGooglePlayApp = (
  googlePlayAppId: string,
  platform: Platform,
  allAppsData: AppData[]
): AppData | null => {
  logger.debug(`Found API app mapping for Google Play app: ${googlePlayAppId}`);

  logger.debug(`App mappings: ${JSON.stringify(platform.app_mappings)}`);
  // Get the API app_id from the mapping
  const apiAppId = platform.app_mappings[googlePlayAppId];
  if (!apiAppId) {
    console.error(
      `No API app mapping found for Google Play app: ${googlePlayAppId}`
    );
    return null;
  }
  logger.debug(`API app_id: ${apiAppId}`);
  logger.debug(`All apps data: ${JSON.stringify(allAppsData)}`);

  const appData = allAppsData.find((app) => app.app_id === apiAppId);
  if (!appData) {
    console.error(`No app data found for API app_id: ${apiAppId}`);
    return null;
  }

  return {
    ...appData,
    google_play_app_id: googlePlayAppId,
    original_app_id: apiAppId,
  };
};

export const processAppsInParallel = async (
  apps: AppData[],
  platform: Platform,
  platformName: string,
  pageNames: string[],
  settings: {
    dry_run: boolean;
    max_retries: number;
    timeout: number;
    max_concurrent: number;
  },
  createBrowserSession: () => Promise<any>,
  closeBrowserSession: (session: any) => Promise<void>,
  selectedAppIds?: string[]
): Promise<ProcessingResult[]> => {
  const filteredApps = filterSelectedApps(apps, selectedAppIds);
  const { max_concurrent = 3 } = settings;

  // Process apps in batches
  const results: ProcessingResult[] = [];
  for (let i = 0; i < filteredApps.length; i += max_concurrent) {
    const batch = filteredApps.slice(i, i + max_concurrent);
    const batchPromises = batch.map((app) =>
      processApp(
        app,
        platform,
        platformName,
        pageNames,
        settings,
        createBrowserSession,
        closeBrowserSession
      )
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(
      ...batchResults.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    );
  }

  return results;
};

export const processPagesInParallel = async (
  appData: AppData,
  platform: Platform,
  platformName: string,
  pageNames: string[],
  settings: any
): Promise<ProcessingResult[]> => {
  // Create separate browser sessions for each page
  const pagePromises = pageNames.map(async (pageName) => {
    const session = await createBrowserSession(platformName as any);
    try {
      return await processAppPage(
        session.context,
        platform,
        pageName,
        appData,
        settings
      );
    } finally {
      await closeBrowserSession(session);
    }
  });

  const results = await Promise.allSettled(pagePromises);
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          app_id: appData.app_id,
          platform: platformName,
          page: "unknown",
          success: false,
          errors: ["Page processing failed"],
          processed_fields: [],
        }
  );
};

export const processAppPage = async (
  context: BrowserContext,
  platform: Platform,
  pageName: string,
  appData: AppData & { google_play_app_id?: string },
  settings: Config["settings"]
): Promise<ProcessingResult> => {
  const result: ProcessingResult = {
    app_id: appData.google_play_app_id || appData.app_id, // Use Google Play ID for result
    platform: "unknown",
    page: pageName,
    success: false,
    errors: [],
    processed_fields: [],
  };

  try {
    const validation = validateAppData(appData);
    if (!validation.isValid) {
      result.errors = validation.errors;
      return result;
    }

    const pageConfig = platform.pages[pageName];
    if (!pageConfig) {
      result.errors.push(`Page configuration not found: ${pageName}`);
      return result;
    }

    // Use Google Play app ID directly (it's the key now)
    const googlePlayAppId =
      appData.google_play_app_id ||
      Object.keys(platform.app_mappings).find(
        (key) => platform.app_mappings[key] === appData.app_id
      );

    if (!googlePlayAppId) {
      result.errors.push(
        `Google Play app ID not found for app_id: ${appData.app_id}`
      );
      return result;
    }

    const _page = await navigateToPage(
      context,
      platform.base_url,
      pageConfig.url_template,
      googlePlayAppId
    );

    if (pageConfig.app_selector) {
      const appSelected = await selectApp(
        _page,
        pageConfig.app_selector,
        googlePlayAppId
      );
      if (!appSelected) {
        result.errors.push("Failed to select app");
        return result;
      }
    }

    const fieldResults = await processPageFields(
      _page,
      pageConfig.fields,
      appData,
      // settings.dry_run,
      settings.max_retries
    );

    result.processed_fields = fieldResults.processed;
    if (fieldResults.failed.length > 0) {
      result.errors.push(
        `Failed to process fields: ${fieldResults.failed.join(", ")}`
      );
    }

    // Process modals if any
    if (pageConfig.modals && pageConfig.modals.length > 0) {
      const modalResults = await processPageModals(
        _page,
        pageConfig.modals,
        appData,
        settings.dry_run,
        settings.max_retries
      );

      if (modalResults.failed > 0) {
        result.errors.push(`Failed to process ${modalResults.failed} modals`);
      }
    }

    result.success = result.errors.length === 0;

    if (result.success) {
      logger.info(
        `Successfully processed app ${appData.app_id} on page ${pageName}`
      );
    } else {
      console.log(
        `Completed processing app ${appData.app_id} on page ${pageName} with errors`
      );
    }
  } catch (error) {
    logger.error(
      `Error processing app ${appData.app_id} on page ${pageName}`,
      error
    );
    result.errors.push(`Unexpected error: ${(error as Error).message}`);
  }

  return result;
};

export const processApp = async (
  appData: AppData,
  platform: Platform,
  platformName: string,
  pageNames: string[],
  settings: Config["settings"],
  createBrowserSession: () => Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page;
  }>,
  closeBrowserSession: (session: BrowserSession) => Promise<void>
): Promise<ProcessingResult[]> => {
  const results: ProcessingResult[] = [];
  let session: {
    browser: Browser;
    context: BrowserContext;
    page: Page;
  } | null = null;

  try {
    session = await createBrowserSession();
    const { page, context } = session;

    logger.info(`Processing app ${appData.app_id} on platform ${platformName}`);
    logger.info(`Processing ${pageNames.length} pages`);

    // Separate pages into parallel and sequential groups
    const parallelPages: string[] = [];
    const sequentialPages: string[] = [];

    for (const pageName of pageNames) {
      const pageConfig = platform.pages[pageName];
      if (pageConfig?.shouldProcessParallel) {
        parallelPages.push(pageName);
      } else {
        sequentialPages.push(pageName);
      }
    }

    // Process parallel pages
    if (parallelPages.length > 0) {
      logger.info(`Processing ${parallelPages.length} pages in parallel`);
      const pagePromises = parallelPages.map((pageName) =>
        processAppPage(context, platform, pageName, appData, settings).then(
          (result) => {
            result.platform = platformName;
            return result;
          }
        )
      );

      logger.info(`Processing ${parallelPages.length} pages in parallel`);

      const parallelResults = await Promise.all(pagePromises);
      results.push(...parallelResults);
    }

    // Process sequential pages
    for (const pageName of sequentialPages) {
      const result = await processAppPage(
        context,
        platform,
        pageName,
        appData,
        settings
      );
      result.platform = platformName;
      results.push(result);
    }
  } catch (error) {
    logger.error(`Error processing app ${appData.app_id}`, error);
    const errorResult: ProcessingResult = {
      app_id: appData.app_id,
      platform: platformName,
      page: "unknown",
      success: false,
      errors: [`Session error: ${(error as Error).message}`],
      processed_fields: [],
    };
    results.push(errorResult);
  } finally {
    if (session) {
      // await closeBrowserSession(session);
    }
  }

  return results;
};

export const filterSelectedApps = (
  apps: AppData[],
  selectedAppIds?: string[]
): AppData[] => {
  if (!selectedAppIds || selectedAppIds.length === 0) {
    return apps;
  }

  return apps.filter((app) => selectedAppIds.includes(app.app_id));
};

export const processMultipleApps = async (
  apps: AppData[],
  platform: Platform,
  platformName: string,
  pageNames: string[],
  settings: Config["settings"],
  createBrowserSession: () => Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page;
  }>,
  closeBrowserSession: (session: BrowserSession) => Promise<void>,
  selectedGooglePlayAppIds?: string[]
): Promise<ProcessingResult[]> => {
  const appsToProcess: (AppData & { google_play_app_id: string })[] = [];

  if (selectedGooglePlayAppIds?.length) {
    for (const googlePlayAppId of selectedGooglePlayAppIds) {
      const appData = getAppDataForGooglePlayApp(
        googlePlayAppId,
        platform,
        apps
      );
      if (appData) {
        appsToProcess.push({
          ...appData,
          google_play_app_id: googlePlayAppId,
        });
      }
    }
  } else {
    // Process all mapped apps
    for (const googlePlayAppId of Object.keys(platform.app_mappings)) {
      const appData = getAppDataForGooglePlayApp(
        googlePlayAppId,
        platform,
        apps
      );
      if (appData) {
        appsToProcess.push({
          ...appData,
          google_play_app_id: googlePlayAppId,
        });
      }
    }
  }

  console.log(
    `Processing ${appsToProcess.length} Google Play apps on platform ${platformName}`
  );

  const allResults: ProcessingResult[] = [];

  for (const app of appsToProcess) {
    console.log(
      `Processing Google Play app: ${app.google_play_app_id} (using API data from: ${app.app_id})`
    );

    const results = await processApp(
      app,
      platform,
      platformName,
      pageNames,
      settings,
      createBrowserSession,
      closeBrowserSession
    );
    allResults.push(...results);
  }

  return allResults;
};
