import {
  chromium,
  webkit,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";
import { logger } from "../utils/logger";

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export const createBrowserSession = async (
  platform: "google_play" | "app_store",
  authFile: string = "auth.json"
): Promise<BrowserSession> => {
  try {
    const browserType = platform === "app_store" ? webkit : chromium;
    const browser = await browserType.launch({
      headless: false, // Set to true for production
      slowMo: 100,
    });

    const context = await browser.newContext({
      storageState: authFile,
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    logger.info(`Browser session created for ${platform}`);

    return { browser, context, page };
  } catch (error) {
    logger.error("Failed to create browser session", error);
    throw error;
  }
};

export const closeBrowserSession = async (
  session: BrowserSession
): Promise<void> => {
  try {
    await session.page.close();
    await session.context.close();
    await session.browser.close();
    logger.info("Browser session closed");
  } catch (error) {
    logger.error("Failed to close browser session", error);
  }
};

export const navigateToPage = async (
  page: Page,
  baseUrl: string,
  urlTemplate: string,
  appId?: string
): Promise<void> => {
  const url = appId
    ? `${baseUrl}${urlTemplate.replace("{app_id}", appId)}`
    : `${baseUrl}${urlTemplate}`;

  logger.info(`Navigating to: ${url}`);

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000); // Allow page to stabilize
};
