import type { Browser, BrowserContext, Page } from "playwright";
import type { AppData, Platform, ProcessingResult } from "../types";
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
        session.page,
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
  appData: AppData,
  settings: { dry_run: boolean; max_retries: number; timeout: number }
): Promise<ProcessingResult> => {
  const result: ProcessingResult = {
    app_id: appData.app_id,
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

    const platformAppId = platform.app_mappings[appData.app_id];
    if (!platformAppId) {
      result.errors.push(`App mapping not found for app_id: ${appData.app_id}`);
      return result;
    }

    const _page = await navigateToPage(
      context,
      platform.base_url,
      pageConfig.url_template,
      platformAppId
    );

    if (pageConfig.app_selector) {
      const appSelected = await selectApp(
        _page,
        pageConfig.app_selector,
        platformAppId
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
      settings.dry_run,
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
      logger.warn(
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
  settings: { dry_run: boolean; max_retries: number; timeout: number },
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

    for (const pageName of pageNames) {
      const result = await processAppPage(
        context,
        platform,
        pageName,
        appData,
        settings
      );
      result.platform = platformName;
      results.push(result);

      await page.waitForTimeout(3000);
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
  settings: { dry_run: boolean; max_retries: number; timeout: number },
  createBrowserSession: () => Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page;
  }>,
  closeBrowserSession: (session: BrowserSession) => Promise<void>,
  selectedAppIds?: string[]
): Promise<ProcessingResult[]> => {
  logger.info(`${apps.length} apps found`);
  logger.info(`Selected apps are ${JSON.stringify(selectedAppIds)}`);

  const filteredApps = filterSelectedApps(apps, selectedAppIds);
  const allResults: ProcessingResult[] = [];

  logger.info(
    `Processing ${filteredApps.length} apps on platform ${platformName}`
  );
  logger.info(`Apps are ${JSON.stringify(filteredApps)}`);

  for (const app of filteredApps) {
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
