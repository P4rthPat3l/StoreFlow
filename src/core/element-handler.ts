import type { Locator, Page } from "playwright";
import type { Field } from "../types";
import { logger } from "../utils/logger";
import { sanitizeValue } from "../utils/validation";

import {
  uploadFile,
  uploadMultipleFiles,
  type UploadOptions,
} from "./file-upload";

export const findElement = async (
  page: Page,
  field: Field
): Promise<Locator | null> => {
  const selectors = [
    ...(field?.selector ? [field.selector] : []),
    ...(field?.fallback?.xpath ? [`xpath=${field.fallback.xpath}`] : []),
  ].filter(Boolean);

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      await locator.waitFor({ state: "visible", timeout: 3000 });

      const count = await locator.count();
      if (count === 1) {
        logger.debug(
          `Found element for ${field.api_key} using selector: ${selector}`
        );
        return locator;
      } else if (count > 1) {
        logger.warn(
          `Multiple elements found for ${field.api_key} using selector: ${selector}`
        );
        return locator.first();
      }
    } catch (error) {
      logger.debug(`Selector failed for ${field.api_key}: ${selector}`);
      continue;
    }
  }

  if (field.fallback?.role) {
    try {
      const roleSelector = field.fallback.role;
      logger.debug(
        `Trying role selector for ${field.api_key}: ${roleSelector}`
      );
    } catch (error) {
      logger.debug(`Role selector failed for ${field.api_key}`);
    }
  }

  return null;
};

export const isFieldAlreadyFilled = async (
  element: Locator,
  field: Field,
  expectedValue: string
): Promise<boolean> => {
  try {
    switch (field.action) {
      case "setText":
        const currentValue = await element.inputValue();
        return currentValue === expectedValue;

      case "check":
        const isChecked = await element.isChecked();
        return (
          isChecked ===
          (expectedValue.toLowerCase() === "true" || expectedValue === "1")
        );

      default:
        return false;
    }
  } catch (error) {
    logger.warn(`Failed to check if field is filled: ${field.api_key}`, error);
    return false;
  }
};

export const fillElement = async (
  element: Locator,
  field: Field,
  value: string,
  page: Page
): Promise<boolean> => {
  try {
    const sanitizedValue = sanitizeValue(value);

    switch (field.action) {
      case "setText":
        await element.clear();
        await element.fill(sanitizedValue);
        break;

      case "check":
        const shouldCheck =
          sanitizedValue.toLowerCase() === "true" || sanitizedValue === "1";
        if (shouldCheck) {
          await element.check();
        }
        break;

      case "selectOption":
        await element.selectOption(sanitizedValue);
        break;

      case "uploadFile":
        await handleFileUpload(element, field, value);
        break;

      case "click":
        await element.click();
        break;

      default:
        logger.warn(`Unknown action: ${field.action}`);
        return false;
    }

    logger.info(
      `Successfully filled ${field.api_key} with value: ${sanitizedValue}`
    );
    return true;
  } catch (error) {
    logger.error(`Failed to fill element for ${field.api_key}`, error);
    return false;
  }
};

const handleFileUpload = async (
  element: Locator,
  field: Field,
  value: string | string[]
): Promise<boolean> => {
  try {
    const uploadOptions: UploadOptions = {
      dimensions: field.dimensions,
      quality: 90,
      format: "png",
      timeout: 10000,
    };

    if (Array.isArray(value)) {
      const result = await uploadMultipleFiles(element, value, uploadOptions);
      const success = result.failed === 0;

      if (success) {
        logger.info(
          `Successfully uploaded ${result.successful} files for ${field.api_key}`
        );
      } else {
        logger.warn(
          `Upload completed with ${result.failed} failures for ${field.api_key}`
        );
      }

      return success;
    } else {
      const success = await uploadFile(element, value, uploadOptions);

      if (success) {
        logger.info(
          `Successfully uploaded file for ${field.api_key}: ${value}`
        );
      }

      return success;
    }
  } catch (error) {
    logger.error(`File upload failed for ${field.api_key}:`, error);
    return false;
  }
};

export const selectApp = async (
  page: Page,
  appSelector: any,
  appId: string
): Promise<boolean> => {
  try {
    logger.info(`Selecting app: ${appId}`);

    // Click the app selector dropdown
    await page.click(appSelector.selector);
    await page.waitForTimeout(1000);

    // Click the specific app option
    const optionSelector = `${appSelector.option_selector}[${appSelector.attribute}="${appId}"]`;
    await page.click(optionSelector);
    await page.waitForTimeout(2000);

    logger.info(`Successfully selected app: ${appId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to select app: ${appId}`, error);
    return false;
  }
};
