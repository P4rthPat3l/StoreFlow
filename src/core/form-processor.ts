import type { Page } from "playwright";
import type { Field, Modal, AppData, Conditional } from "../types";
import { logger } from "../utils/logger";
import { validateField } from "../utils/validation";
import { withRetry } from "../utils/retry";
import {
  findElement,
  isFieldAlreadyFilled,
  fillElement,
} from "./element-handler";

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);
};

export const processField = async (
  page: Page,
  field: Field,
  appData: AppData,
  dryRun: boolean = false
): Promise<boolean> => {
  const value =
    field.api_key.split(".").reduce((obj, key) => obj?.[key], appData) ||
    field.default_value;

  logger.info(`Processing field value: ${value}`);

  if (!value) {
    logger.debug(`No value found for field: ${field.api_key}`);
    return false;
  }

  // Validate field value
  if (!validateField(field, value)) {
    logger.warn(`Invalid value for field ${field.api_key}: ${value}`);
    return false;
  }

  if (dryRun) {
    logger.info(`[DRY RUN] Would fill ${field.api_key} with: ${value}`);
    return true;
  }

  const element = await findElement(page, field);
  if (!element) {
    logger.error(`Element not found for field: ${field.api_key}`);
    return false;
  }

  // Check if field is already filled correctly
  if (await isFieldAlreadyFilled(element, field, value)) {
    logger.info(`Field ${field.api_key} already filled correctly`);
    return true;
  }

  // Fill the element
  const success = await fillElement(element, field, value);

  // Process conditionals if field was filled successfully
  if (success && field.conditionals) {
    await processConditionals(page, field.conditionals, appData, dryRun);
  }

  return success;
};

export const processConditionals = async (
  page: Page,
  conditionals: Conditional[],
  appData: AppData,
  dryRun: boolean = false
): Promise<void> => {
  for (const conditional of conditionals) {
    const conditionValue = appData[conditional.if_checked];

    if (conditionValue) {
      logger.info(
        `Processing conditional fields for: ${conditional.if_checked}`
      );

      for (const field of conditional.fields) {
        await processField(page, field, appData, dryRun);
      }
    }
  }
};

export const processModal = async (
  page: Page,
  modal: Modal,
  appData: AppData,
  dryRun: boolean = false
): Promise<boolean> => {
  try {
    // Check if modal content is already saved
    if (modal.check_selector) {
      const savedElement = await page.$(modal.check_selector);
      if (savedElement) {
        logger.info("Modal content already saved, skipping");
        return true;
      }
    }

    if (dryRun) {
      logger.info("[DRY RUN] Would process modal");
      return true;
    }

    // Trigger modal
    await page.click(modal.trigger_selector);
    await page.waitForTimeout(1000);

    // Process modal fields
    let allFieldsProcessed = true;
    for (const field of modal.fields) {
      const success = await processField(page, field, appData, dryRun);
      if (!success) {
        allFieldsProcessed = false;
      }
    }

    if (allFieldsProcessed) {
      // Save modal
      await page.click(modal.save_selector);
      await page.waitForTimeout(2000);
      logger.info("Modal processed and saved successfully");
    } else {
      logger.warn("Some modal fields failed to process");
    }

    return allFieldsProcessed;
  } catch (error) {
    logger.error("Failed to process modal", error);
    return false;
  }
};

export const processPageFields = async (
  page: Page,
  fields: Field[],
  appData: AppData,
  dryRun: boolean = false,
  maxRetries: number = 3
): Promise<{ processed: string[]; failed: string[] }> => {
  const processed: string[] = [];
  const failed: string[] = [];

  for (const field of fields) {
    try {
      const success = await withRetry(
        () => processField(page, field, appData, dryRun),
        maxRetries
      );

      if (success) {
        processed.push(field.api_key);
      } else {
        failed.push(field.api_key);
      }
    } catch (error) {
      logger.error(
        `Failed to process field ${field.api_key} after retries`,
        error
      );
      failed.push(field.api_key);
    }
  }

  return { processed, failed };
};

export const processPageModals = async (
  page: Page,
  modals: Modal[],
  appData: AppData,
  dryRun: boolean = false,
  maxRetries: number = 3
): Promise<{ processed: number; failed: number }> => {
  let processed = 0;
  let failed = 0;

  for (const modal of modals) {
    try {
      const success = await withRetry(
        () => processModal(page, modal, appData, dryRun),
        maxRetries
      );

      if (success) {
        processed++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error("Failed to process modal after retries", error);
      failed++;
    }
  }

  return { processed, failed };
};
