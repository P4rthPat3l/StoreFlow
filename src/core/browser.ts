import {
  chromium,
  webkit,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";
import { logger } from "../utils/logger";
import {
  checkAuthFile,
  validateAuthSession,
  setupAuthentication,
} from "./auth";
import { join } from "path";
import { config } from "../config";

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

const AUTH_FILES = {
  google_play: process.env.GOOGLE_PLAY_AUTH_FILE || "google-play-auth.json",
  app_store: process.env.APP_STORE_AUTH_FILE || "app-store-auth.json",
};

export const createBrowserSession = async (
  platform: "google_play" | "app_store",
  options: {
    headless?: boolean;
    authFile?: string;
    validateAuth?: boolean;
  } = {}
) => {
  const {
    headless = process.env.NODE_ENV === "production",
    authFile = AUTH_FILES[platform],
    validateAuth = true,
  } = options;

  try {
    logger.info(`🚀 Creating browser session for ${platform}`);

    if (!checkAuthFile(platform)) {
      console.log(`❌ No authentication found for ${platform}`);
      console.log(`🔧 Starting authentication setup...`);

      const authSuccess = await setupAuthentication({
        platform,
        loginCheckUrl: config.platforms[platform]?.loginCheckUrl,
        force: false,
        authFile,
      });
      if (!authSuccess) {
        throw new Error(`Authentication setup failed for ${platform}`);
      }
    }

    if (validateAuth) {
      logger.info(`🔍 Validating authentication session...`);
      const isValid = await validateAuthSession(platform, authFile);
      if (!isValid) {
        console.log(`⚠️ Invalid authentication session, re-authenticating...`);
        const authSuccess = await setupAuthentication({
          platform,
          force: true,
          authFile,
        });
        if (!authSuccess) {
          throw new Error(`Re-authentication failed for ${platform}`);
        }
      }
    }

    const browserType = platform === "app_store" ? chromium : chromium;
    const auth_data = join(
      process.cwd(),
      platform === "app_store"
        ? process.env.APP_STORE_AUTH_DATA_DIR!
        : process.env.GOOGLE_PLAY_AUTH_DATA_DIR!
    );

    const authPath = authFile;
    const executablePath =
      platform === "app_store"
        ? process.env.APP_STORE_EXECUTABLE_PATH
        : process.env.GOOGLE_PLAY_EXECUTABLE_PATH;

    const browser = await browserType.launch({
      executablePath,
      headless: false,
      slowMo: 100,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--start-maximized",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        "--disable-setuid-sandbox",
      ],
    });

    const context = await browser.newContext({
      storageState: authPath,
      viewport: null,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ignoreHTTPSErrors: true,
      acceptDownloads: false,
    });

    const page = await context.newPage();

    // Set default timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    logger.info(`✅ Browser session created successfully for ${platform}`);

    return { browser: context.browser()!, context, page };
  } catch (error) {
    logger.error(`❌ Failed to create browser session for ${platform}`, error);
    throw new Error(
      `Browser session creation failed: ${(error as Error).message}`
    );
  }
};

export const closeBrowserSession = async (
  session: BrowserSession
): Promise<void> => {
  try {
    logger.info(`🔒 Closing browser session...`);

    if (session.page && !session.page.isClosed()) {
      await session.page.close();
    }

    if (session.context) {
      await session.context.close();
    }

    if (session.browser) {
      await session.browser.close();
    }

    logger.info(`✅ Browser session closed successfully`);
  } catch (error) {
    logger.error(`⚠️ Error closing browser session`, error);
    // Don't throw here as this is cleanup code
  }
};

export const navigateToPage = async (
  context: BrowserContext,
  baseUrl: string,
  urlTemplate: string,
  appId?: string
): Promise<Page> => {
  try {
    const url = appId
      ? `${baseUrl}${urlTemplate.replace("{app_id}", appId)}`
      : `${baseUrl}${urlTemplate}`;

    logger.info(`🌐 Navigating to: ${url}`);

    const _page = await context.newPage();

    await _page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    logger.info(`🌐 Navigated to: ${url}`);
    await _page.waitForLoadState("load");

    logger.info(`✅ Successfully navigated to page`);

    return _page;

    // await page.waitForLoadState("load");
  } catch (error) {
    logger.error(`❌ Failed to navigate to page`, error);
    throw new Error(`Navigation failed: ${(error as Error).message}`);
  }
};

export const checkPageAuthentication = async (
  page: Page,
  platform: "google_play" | "app_store"
): Promise<boolean> => {
  try {
    const authIndicators = {
      google_play: [
        "text=Apps",
        "text=Dashboard",
        '[data-testid="console-nav"]',
        ".console-nav",
      ],
      app_store: [
        "text=My Apps",
        "text=App Store Connect",
        '[data-testid="app-store-connect-nav"]',
        ".globalheader",
      ],
    };

    const indicators = authIndicators[platform];

    for (const indicator of indicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 5000 });
        return true;
      } catch {
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
};

export const createBrowserSessionWithRetry = async (
  platform: "google_play" | "app_store",
  maxRetries: number = 3,
  options: Parameters<typeof createBrowserSession>[1] = {}
): Promise<BrowserSession> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(
        `🔄 Creating browser session (attempt ${attempt}/${maxRetries})`
      );
      return await createBrowserSession(platform, options);
    } catch (error) {
      lastError = error as Error;
      console.log(
        `⚠️ Session creation attempt ${attempt} failed: ${lastError.message}`
      );

      if (attempt < maxRetries) {
        const delay = 2000 * attempt;
        logger.info(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to create browser session after ${maxRetries} attempts: ${
      lastError!.message
    }`
  );
};
