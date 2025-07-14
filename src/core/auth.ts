import {
  chromium,
  webkit,
  type Browser,
  type BrowserContext,
} from "playwright";
import { logger } from "../utils/logger";
import { existsSync } from "fs";
import { join } from "path";
import { platform } from "os";

export interface AuthConfig {
  platform: "google_play" | "app_store";
  authFile: string;
  loginUrl: string;
  successUrl: string | RegExp;
  successIndicators: string[];
  loginSelectors?: {
    email?: string;
    password?: string;
    submitButton?: string;
    twoFactorInput?: string;
    twoFactorSubmit?: string;
  };
  executablePath?: string;
}

const AUTH_CONFIGS: Record<string, AuthConfig> = {
  google_play: {
    platform: "google_play",
    authFile: "google-play-auth.json",
    loginUrl: "https://play.google.com/console/u/3/developers/",
    successUrl: /console\/u\/\d+\/developers/,
    successIndicators: [
      "text=Apps",
      "text=Dashboard",
      '[data-testid="console-nav"]',
      ".console-nav",
    ],
    loginSelectors: {
      email: 'input[type="email"]',
      password: 'input[type="password"]',
      submitButton: 'button[type="submit"], #next',
      twoFactorInput: 'input[type="tel"], input[name="totpPin"]',
      twoFactorSubmit: '#submit, button:has-text("Next")',
    },
    executablePath: process.env.GOOGLE_PLAY_EXECUTABLE_PATH,
  },
  app_store: {
    platform: "app_store",
    authFile: "app-store-auth.json",
    loginUrl: "https://appstoreconnect.apple.com",
    successUrl:
      /https:\/\/appstoreconnect\.apple\.com\/apps\/\d+\/distribution\/ios\/version\/inflight/,
    successIndicators: [
      "text=My Apps",
      "text=App Store Connect",
      '[data-testid="app-store-connect-nav"]',
      ".globalheader",
    ],
    loginSelectors: {
      email: "#account_name_text_field",
      password: "#password_text_field",
      submitButton: "#sign-in",
      twoFactorInput: 'input[name="verificationCode"]',
      twoFactorSubmit: 'button[type="submit"]',
    },
    executablePath: process.env.APP_STORE_EXECUTABLE_PATH,
  },
};

export const checkAuthFile = (
  platform: "google_play" | "app_store"
): boolean => {
  const authConfig = AUTH_CONFIGS[platform];
  const authPath = join(process.cwd(), authConfig?.authFile);
  logger.info(`🔍 Checking auth file for ${platform}: ${authPath}`);
  const exists = existsSync(authPath);

  if (exists) {
    logger.info(`✅ Auth file found for ${platform}: ${authConfig?.authFile}`);
  } else {
    logger.warn(
      `❌ Auth file not found for ${platform}: ${authConfig?.authFile}`
    );
  }

  return exists;
};

export const createInitialBrowserSession = async (
  platform: "google_play" | "app_store",
  headless: boolean = false
): Promise<{ browser: Browser; context: BrowserContext }> => {
  logger.info(`🚀 Creating initial browser session for ${platform}`);

  const userDataDir = "./auth-data";
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: process.env.GOOGLE_PLAY_EXECUTABLE_PATH,
    headless: false,
    viewport: { width: 1280, height: 800 },
    slowMo: 100,
    args: ["--disable-blink-features=AutomationControlled"],
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // const context = await browser.newContext({
  //   viewport: { width: 1280, height: 720 },
  //   userAgent:
  //     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  // });

  return { browser: context.browser()!, context };
};

export const performManualLogin = async (
  platform: "google_play" | "app_store",
  headless: boolean = false,
  loginCheckUrl?: RegExp
): Promise<boolean> => {
  const authConfig = AUTH_CONFIGS[platform];
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    console.log(`🔐 Starting manual login process for ${platform}`);
    console.log(
      `📝 You will need to manually log in to: ${authConfig?.loginUrl}`
    );

    const session = await createInitialBrowserSession(platform, headless);
    browser = session.browser;
    context = session.context;

    console.log("before new pag ");
    const page = await context.newPage();
    console.log("after new pag ");

    if (!authConfig?.loginUrl) {
      logger.error(`❌ Login URL not found for ${platform}`);
      return false;
    }

    console.log(`🌐 Navigating to: ${authConfig?.loginUrl}`);
    await page.goto(authConfig?.loginUrl, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    const isAlreadyLoggedIn = await checkIfLoggedIn(
      page,
      authConfig,
      loginCheckUrl,
      platform
    );
    if (isAlreadyLoggedIn) {
      logger.info(`✅ Already logged in to ${platform}`);
      await saveAuthSession(context, authConfig);
      return true;
    }

    // Guide user through manual login
    logger.info(`
🔑 MANUAL LOGIN REQUIRED
========================
1. The browser window should now be open
2. Please log in manually to ${platform}
3. Complete any 2FA if required
4. Wait for the dashboard/main page to load
5. The process will automatically detect when you're logged in
6. DO NOT close the browser window

Waiting for login completion...
    `);

    // Wait for successful login indicators
    await waitForLoginSuccess(page, authConfig);

    // Save the authentication session
    logger.info(`💾 Saving authentication session...`);
    await saveAuthSession(context, authConfig);

    logger.info(`✅ Authentication successful for ${platform}!`);
    logger.info(`📁 Session saved to: ${authConfig.authFile}`);

    return true;
  } catch (error) {
    logger.error(`❌ Authentication failed for ${platform}`, error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const checkIfLoggedIn = async (
  page: any,
  authConfig: AuthConfig,
  loginCheckUrl?: RegExp,
  platform: "google_play" | "app_store" = "google_play"
): Promise<boolean> => {
  try {
    for (const indicator of authConfig.successIndicators) {
      try {
        // await page.waitForSelector(indicator, { timeout: 3000 });
        await page.waitForURL(authConfig.successUrl, {
          timeout: 1800000,
        });
        logger.info(`✅ Found login success indicator: ${indicator}`);
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

const waitForLoginSuccess = async (
  page: any,
  authConfig: AuthConfig
): Promise<void> => {
  const maxWaitTime = 300000; // 5 minutes
  const checkInterval = 5000; // 5 seconds
  let elapsed = 0;

  while (elapsed < maxWaitTime) {
    try {
      const isLoggedIn = await checkIfLoggedIn(page, authConfig);
      if (isLoggedIn) {
        logger.info(`✅ Login detected successfully!`);
        return;
      }

      // Show progress every 30 seconds
      if (elapsed % 30000 === 0 && elapsed > 0) {
        logger.info(
          `⏳ Still waiting for login... (${elapsed / 1000}s elapsed)`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    } catch (error) {
      logger.warn(`⚠️ Error checking login status:`, error);
    }
  }

  throw new Error(`Login timeout after ${maxWaitTime / 1000} seconds`);
};

const saveAuthSession = async (
  context: BrowserContext,
  authConfig: AuthConfig
): Promise<void> => {
  try {
    const authPath = join(process.cwd(), authConfig.authFile);
    await context.storageState({ path: authPath });
    logger.info(`💾 Authentication session saved to: ${authPath}`);
  } catch (error) {
    logger.error(`❌ Failed to save auth session`, error);
    throw error;
  }
};

export const validateAuthSession = async (
  platform: "google_play" | "app_store",
  authFile?: string
): Promise<boolean> => {
  let browser: Browser | null = null;

  try {
    const authConfig = AUTH_CONFIGS[platform];
    if (!authConfig) {
      logger.error(`❌ Unsupported platform: ${platform}`);
      return false;
    }

    const authPath = authFile || join(process.cwd(), authConfig?.authFile);

    if (!existsSync(authPath)) {
      logger.warn(`❌ Auth file not found: ${authPath}`);
      return false;
    }

    logger.info(`🔍 Validating auth session for ${platform}...`);

    const browserType = platform === "app_store" ? webkit : chromium;
    browser = await browserType.launch({ headless: true });

    const context = await browser.newContext({
      storageState: authPath,
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    await page.goto(authConfig.loginUrl, { waitUntil: "networkidle" });

    const isValid = await checkIfLoggedIn(page, authConfig);

    if (isValid) {
      logger.info(`✅ Auth session is valid for ${platform}`);
    } else {
      logger.warn(`❌ Auth session is invalid for ${platform}`);
    }

    return isValid;
  } catch (error) {
    logger.error(`❌ Error validating auth session for ${platform}`, error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const setupAuthentication = async ({
  platform,
  force = false,
  authFile,
  loginCheckUrl,
}: {
  platform: "google_play" | "app_store";
  force?: boolean;
  authFile?: string;
  loginCheckUrl?: RegExp;
}): Promise<boolean> => {
  logger.warn(`🔧 Setting up authentication for ${platform}...`);

  const authFileExists = checkAuthFile(platform);
  console.log("authFileExists", authFileExists);
  // if (checkAuthFile(platform)) {
  //   const isValid = await validateAuthSession(platform, authFile);
  //   if (isValid) {
  //     logger.info(`✅ Existing authentication is valid for ${platform}`);
  //     return true;
  //   } else {
  //     logger.warn(
  //       `⚠️ Existing authentication is invalid, re-authenticating...`
  //     );
  //   }
  // }

  const success = await performManualLogin(platform, false, loginCheckUrl);

  if (success) {
    logger.info(`🎉 Authentication setup complete for ${platform}!`);
  } else {
    logger.error(`❌ Authentication setup failed for ${platform}`);
  }

  return success;
};

export const runAuthSetup = async (): Promise<void> => {
  const platforms: Array<"google_play" | "app_store"> = [
    "google_play",
    "app_store",
  ];

  logger.info(`🔐 Starting authentication setup for all platforms...`);

  for (const platform of platforms) {
    try {
      logger.info(`\n${"=".repeat(50)}`);
      logger.info(`🎯 Setting up ${platform.toUpperCase().replace("_", " ")}`);
      logger.info(`${"=".repeat(50)}\n`);

      const success = await setupAuthentication(platform);

      if (success) {
        logger.info(`✅ ${platform} authentication completed successfully\n`);
      } else {
        logger.error(`❌ ${platform} authentication failed\n`);
      }
    } catch (error) {
      logger.error(`💥 Fatal error setting up ${platform}`, error);
    }
  }

  logger.info(`🏁 Authentication setup process completed!`);
};
