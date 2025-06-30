import type { Page } from "playwright";
import type { Platform, AppData, ProcessingResult } from "../types";
import { logger } from "../utils/logger";
import { validateAppData } from "../utils/validation";
import { navigateToPage } from "./browser";
import { selectApp } from "./element-handler";
import { processPageFields, processPageModals } from "./form-processor";

export const processAppPage = async (
  page: Page,
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
    // Validate app data
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

    // Get platform-specific app ID
    const platformAppId = platform.app_mappings[appData.app_id];
    if (!platformAppId) {
      result.errors.push(`App mapping not found for app_id: ${appData.app_id}`);
      return result;
    }

    // Navigate to page
    await navigateToPage(
      page,
      platform.base_url,
      pageConfig.url_template,
      platformAppId
    );

    // Select app if app selector is configured
    if (pageConfig.app_selector) {
      const appSelected = await selectApp(
        page,
        pageConfig.app_selector,
        platformAppId
      );
      if (!appSelected) {
        result.errors.push("Failed to select app");
        return result;
      }
    }

    // Process page fields
    const fieldResults = await processPageFields(
      page,
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
        page,
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
  createBrowserSession: () => Promise<any>,
  closeBrowserSession: (session: any) => Promise<void>
): Promise<ProcessingResult[]> => {
  const results: ProcessingResult[] = [];
  let session: any = null;

  try {
    session = await createBrowserSession();
    const { page } = session;

    logger.info(`Processing app ${appData.app_id} on platform ${platformName}`);

    for (const pageName of pageNames) {
      const result = await processAppPage(
        page,
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
      await closeBrowserSession(session);
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
  createBrowserSession: () => Promise<any>,
  closeBrowserSession: (session: any) => Promise<void>,
  selectedAppIds?: string[]
): Promise<ProcessingResult[]> => {
  const filteredApps = filterSelectedApps(apps, selectedAppIds);
  const allResults: ProcessingResult[] = [];

  logger.info(
    `Processing ${filteredApps.length} apps on platform ${platformName}`
  );

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
