import type { Locator } from "playwright";
import sharp from "sharp";
import { promises as fs } from "fs";
import { join } from "path";
import { logger } from "../utils/logger";

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface UploadOptions {
  dimensions?: string; // "1024x768" format
  quality?: number;
  format?: "png" | "jpg" | "jpeg" | "webp";
  timeout?: number;
}

export interface ImageProcessingResult {
  buffer: Buffer;
  filePath: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
}

export const parseDimensions = (dimensions: string): ImageDimensions | null => {
  const match = dimensions.match(/^(\d+)x(\d+)$/);
  if (!match) return null;

  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
};

export const generateFileName = (
  originalName?: string,
  format: string = "png"
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const base = originalName ? originalName.split(".")[0] : "upload";
  return `${base}-${timestamp}-${random}.${format}`;
};

export const calculateScaledDimensions = (
  original: ImageDimensions,
  target: ImageDimensions
): ImageDimensions => {
  const scale = Math.min(
    target.width / original.width,
    target.height / original.height
  );
  return {
    width: Math.round(original.width * scale),
    height: Math.round(original.height * scale),
  };
};

export const fetchImageFromUrl = async (
  imageUrl: string,
  retries: number = 3
): Promise<Buffer> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.debug(
        `Fetching image from URL (attempt ${attempt}/${retries}): ${imageUrl}`
      );

      if (imageUrl.startsWith("data:")) {
        const base64Data = imageUrl.split(",")[1];
        return Buffer.from(base64Data, "base64");
      }

      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; App-Automation-Tool/1.0)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        throw new Error("Empty response received");
      }

      logger.info(`Successfully fetched image: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      logger.warn(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw new Error(
          `Failed to fetch image after ${retries} attempts: ${
            (error as Error).message
          }`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Unexpected error in fetchImageFromUrl");
};

export const processImage = async (
  imageBuffer: Buffer,
  options: UploadOptions = {}
): Promise<ImageProcessingResult> => {
  try {
    const { dimensions, quality = 90, format = "png" } = options;

    let processor = sharp(imageBuffer);
    const metadata = await processor.metadata();

    const originalSize = {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    let processedSize = originalSize;

    if (dimensions) {
      const targetDimensions = parseDimensions(dimensions);
      if (targetDimensions) {
        const scaledDimensions = calculateScaledDimensions(
          originalSize,
          targetDimensions
        );

        processor = processor.resize(
          targetDimensions.width,
          targetDimensions.height,
          {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          }
        );

        processedSize = targetDimensions;
        logger.info(
          `Resizing image from ${originalSize.width}x${originalSize.height} to ${targetDimensions.width}x${targetDimensions.height}`
        );
      }
    }

    switch (format) {
      case "jpg":
      case "jpeg":
        processor = processor.jpeg({ quality });
        break;
      case "webp":
        processor = processor.webp({ quality });
        break;
      case "png":
      default:
        processor = processor.png({ quality: Math.round(quality / 10) }); // PNG quality is 0-10
        break;
    }

    const buffer = await processor.toBuffer();
    const fileName = generateFileName(undefined, format);
    const filePath = join(process.cwd(), "temp", fileName);

    await fs.mkdir(join(process.cwd(), "temp"), { recursive: true });

    await fs.writeFile(filePath, buffer);

    logger.info(`Processed image saved: ${filePath} (${buffer.length} bytes)`);

    return {
      buffer,
      filePath,
      originalSize,
      processedSize,
    };
  } catch (error) {
    logger.error("Image processing failed:", error);
    throw new Error(`Image processing failed: ${(error as Error).message}`);
  }
};

export const cleanupTempFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
    logger.debug(`Cleaned up temp file: ${filePath}`);
  } catch (error) {
    logger.warn(`Failed to cleanup temp file ${filePath}:`, error);
  }
};

export const isValidUploadTarget = async (
  element: Locator
): Promise<boolean> => {
  try {
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    const inputType = await element.evaluate((el) =>
      el.tagName.toLowerCase() === "input" ? (el as HTMLInputElement).type : ""
    );

    if (tagName === "input" && inputType === "file") {
      return true;
    }
    const hasDropZoneAttributes = await element.evaluate((el) => {
      const classNames = el.className.toLowerCase();
      const dataAttributes = Object.keys(el.dataset).join(" ").toLowerCase();

      return (
        classNames.includes("drop") ||
        classNames.includes("upload") ||
        dataAttributes.includes("drop") ||
        dataAttributes.includes("upload") ||
        el.hasAttribute("draggable")
      );
    });

    return hasDropZoneAttributes;
  } catch (error) {
    logger.warn("Error checking upload target validity:", error);
    return false;
  }
};

export const clearUploadZone = async (element: Locator): Promise<void> => {
  try {
    const clearSelectors = [
      '[aria-label*="Remove"]',
      '[aria-label*="Delete"]',
      '[data-testid*="remove"]',
      '[data-testid*="delete"]',
      ".remove-button",
      ".delete-button",
      'button[title*="Remove"]',
      'button[title*="Delete"]',
    ];

    for (const selector of clearSelectors) {
      try {
        const clearButton = element.locator(selector).first();
        const isVisible = await clearButton.isVisible({ timeout: 1000 });

        if (isVisible) {
          await clearButton.click();
          await element.page().waitForTimeout(500);
          logger.debug(`Cleared upload zone using selector: ${selector}`);
          return;
        }
      } catch {
        // Continue to next selector
      }
    }

    logger.debug("No clear button found or needed");
  } catch (error) {
    logger.warn("Error clearing upload zone:", error);
  }
};

export const uploadFileByDragDrop = async (
  element: Locator,
  filePath: string,
  fileName?: string
): Promise<boolean> => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const finalFileName = fileName || filePath.split("/").pop() || "upload.png";

    const fileData = {
      name: finalFileName,
      mimeType: "image/png",
      buffer: fileBuffer.toString("base64"),
    };

    await element.evaluate((targetElement, fileData) => {
      const uint8Array = Uint8Array.from(atob(fileData.buffer), (c) =>
        c.charCodeAt(0)
      );
      const file = new File([uint8Array], fileData.name, {
        type: fileData.mimeType,
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const events = ["dragenter", "dragover", "drop"];

      events.forEach((eventType) => {
        const event = new DragEvent(eventType, {
          dataTransfer,
          bubbles: true,
          cancelable: true,
        });
        targetElement.dispatchEvent(event);
      });

      //   @ts-ignore
      if (targetElement.tagName === "INPUT" && targetElement.type === "file") {
        const inputEvent = new Event("change", { bubbles: true });
        Object.defineProperty(inputEvent, "target", {
          writable: false,
          value: { files: [file] },
        });
        targetElement.dispatchEvent(inputEvent);
      }

      return true;
    }, fileData);

    await element.page().waitForTimeout(2000);

    logger.info(`Successfully uploaded file: ${finalFileName}`);
    return true;
  } catch (error) {
    logger.error("Drag-drop upload failed:", error);
    return false;
  }
};
export const uploadFileByInput = async (
  element: Locator,
  filePath: string
): Promise<boolean> => {
  try {
    await element.setInputFiles(filePath);
    await element.page().waitForTimeout(1000);

    logger.info(`Successfully uploaded file via input: ${filePath}`);
    return true;
  } catch (error) {
    logger.error("Input upload failed:", error);
    return false;
  }
};

export const uploadFile = async (
  element: Locator,
  imageUrl: string,
  options: UploadOptions = {}
): Promise<boolean> => {
  let processedImage: ImageProcessingResult | null = null;

  try {
    // const isValidTarget = await isValidUploadTarget(element);
    // if (!isValidTarget) {
    //   logger.warn("Element does not appear to be a valid upload target");
    // }

    await clearUploadZone(element);

    const imageBuffer = await fetchImageFromUrl(imageUrl);
    processedImage = await processImage(imageBuffer, options);

    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const success = await uploadFileByInput(element, processedImage.filePath);
      if (success) return true;
    }

    const success = await uploadFileByDragDrop(
      element,
      processedImage.filePath
    );
    return success;
  } catch (error) {
    logger.error("File upload failed:", error);
    return false;
  } finally {
    if (processedImage) {
      await cleanupTempFile(processedImage.filePath);
    }
  }
};

export const uploadMultipleFiles = async (
  element: Locator,
  imageUrls: string[],
  options: UploadOptions = {}
): Promise<{ successful: number; failed: number }> => {
  let successful = 0;
  let failed = 0;

  for (const [index, imageUrl] of imageUrls.entries()) {
    try {
      logger.info(
        `Uploading file ${index + 1}/${imageUrls.length}: ${imageUrl}`
      );

      const success = await uploadFile(element, imageUrl, options);

      if (success) {
        successful++;
      } else {
        failed++;
      }

      if (index < imageUrls.length - 1) {
        await element.page().waitForTimeout(2000);
      }
    } catch (error) {
      logger.error(`Failed to upload file ${index + 1}:`, error);
      failed++;
    }
  }

  logger.info(`Upload complete: ${successful} successful, ${failed} failed`);
  return { successful, failed };
};
