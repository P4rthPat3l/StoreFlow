import type { Page } from "playwright";
import type { AppData, Conditional, Field, Modal } from "../types";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";
import { validateField } from "../utils/validation";
import {
  fillElement,
  findElement,
  isFieldAlreadyFilled,
} from "./element-handler";

export const processField = async (
  page: Page,
  field: Field,
  appData: AppData
  // dryRun: boolean = false
): Promise<boolean> => {
  // if (
  //   "pre_conditions" in field ||
  //   "fallback_actions" in field ||
  //   "post_conditions" in field
  // ) {
  //   return await processConditionalField(
  //     page,
  //     field as ConditionalField,
  //     appData,
  //     dryRun
  //   );
  // }

  const value = field.valueProcessor
    ? field.valueProcessor(appData, field)
    : field.api_key?.split(".").reduce((obj, key) => obj?.[key], appData) ||
      field.default_value;
  // const value =
  //   field.api_key.split(".").reduce((obj, key) => obj?.[key], appData) ||
  //   field.default_value;

  // logger.info(`Processing field value: ${value}`);

  if (!value) {
    logger.debug(`No value found for field: ${field.api_key}`);
    // return false;
  }

  // Validate field value
  if (!validateField(field, value)) {
    console.log(`Invalid value for field ${field.api_key}: ${value}`);
    return false;
  }

  // if (dryRun) {
  //   logger.info(`[DRY RUN] Would fill ${field.api_key} with: ${value}`);
  //   return true;
  // }

  const element = await findElement(page, field);
  if (!element) {
    logger.error(`Element not found for field: ${field.name}`);
    return false;
  }

  if (await isFieldAlreadyFilled(element, field, value)) {
    logger.info(`Field ${field.name} already filled correctly`);
    return true;
  }

  const success = await fillElement(element, field, value, page);

  if (success && field.conditionals) {
    await processConditionals(
      page,
      field.conditionals,
      appData
      //  dryRun
    );
  }

  return success;
};

export const processConditionals = async (
  page: Page,
  conditionals: Conditional[],
  appData: AppData
  // dryRun: boolean = false
): Promise<void> => {
  for (const conditional of conditionals) {
    const conditionValue = appData[conditional.if_checked];

    if (conditionValue) {
      logger.info(
        `Processing conditional fields for: ${conditional.if_checked}`
      );

      for (const field of conditional.fields) {
        await processField(
          page,
          field,
          appData
          //  dryRun
        );
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
      const success = await processField(
        page,
        field,
        appData
        // dryRun
      );
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
      console.log("Some modal fields failed to process");
    }

    return allFieldsProcessed;
  } catch (error) {
    logger.error("Failed to process modal", error);
    return false;
  }
};

/**
 * Processes a list of fields on a page.
 *
 * For each field, it will:
 * 1. Check if the field has a group property. If it does,
 *    it will recursively call processPageFields on the group's fields.
 * 2. If the field has a condition, it will check the condition.
 *    If the condition is false, it will skip the field.
 * 3. Process the field using processField.
 *
 * Returns a result object with two properties:
 * - processed: an array of strings containing the api_key or name of the successfully processed fields.
 * - failed: an array of strings containing the api_key or name of the fields that failed to process.
 *
 * @param page The page to process the fields on.
 * @param fields The list of fields to process.
 * @param appData The app data to use when processing the fields.
 * @param dryRun Whether to perform a dry run or not.
 * @param maxRetries The maximum number of times to retry processing a field if it fails.
 * @returns A result object with processed and failed arrays.
 */
export const processPageFields = async (
  page: Page,
  fields: Field[],
  appData: AppData,
  // dryRun: boolean = false,
  maxRetries: number = 3
): Promise<{ processed: string[]; failed: string[] }> => {
  const processed: string[] = [];
  const failed: string[] = [];

  for (const field of fields) {
    try {
      if (field.group) {
        logger.info(`Processing group: ${field.name}`);
        const shouldProcessGroup =
          typeof field.group.condition === "function"
            ? await field.group.condition(page, appData)
            : true;

        logger.info(`Should process group: ${shouldProcessGroup}`);
        if (!shouldProcessGroup) {
          logger.debug(`Skipping group: ${field.name} - condition not met`);
          continue;
        }

        // Process fields within the group
        const groupResults = await processPageFields(
          page,
          field.group.fields,
          appData,
          // dryRun,
          maxRetries
        );

        processed.push(...groupResults.processed);
        failed.push(...groupResults.failed);
        continue;
      }

      // Handle individual field
      const success = await withRetry(async () => {
        // Check field-level condition if it exists
        if (typeof field.condition === "function") {
          const shouldProcess = await field.condition(page, appData);
          if (!shouldProcess) {
            logger.debug(
              `Skipping field: ${
                field.api_key || field.name
              } - condition not met`
            );
            return true; // Not a failure, just skipped
          }
        }
        return processField(
          page,
          field,
          appData
          // dryRun
        );
      }, maxRetries);

      if (success) {
        processed.push(field.api_key || field.name);
      } else {
        failed.push(field.api_key || field.name);
      }
    } catch (error) {
      logger.error(
        `Failed to process field ${field.api_key || field.name} after retries`,
        error
      );
      failed.push(field.api_key || field.name);
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
