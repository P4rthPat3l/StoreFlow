import {type Browser, type BrowserContext, type Page, chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface SessionConfig {
  platform: 'googleplay' | 'appstore';
  userDataDir: string;
  headless?: boolean;
  timeout?: number;
}

interface LoginUrls {
  googleplay: {
    login: string;
    success: string;
  };
  appstore: {
    login: string;
    success: string;
  };
}

const LOGIN_URLS: LoginUrls = {
  googleplay: {
    login: 'https://accounts.google.com/signin',
    success: 'https://play.google.com/console/u/2/developers'
  },
  appstore: {
    login: 'https://appleid.apple.com/sign-in',
    success: 'https://appstoreconnect.apple.com/apps'
  }
};

const DEFAULT_TIMEOUT = 60000; // 1 minute
const LOGIN_CHECK_INTERVAL = 1000; // Check every second

/**
 * Creates a user data directory for persistent sessions
 */
const createUserDataDir = (platform: string): string => {
  const baseDir = path.join(process.cwd(), 'browser-sessions');
  const userDataDir = path.join(baseDir, platform);

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return userDataDir;
};

/**
 * Checks if user is already logged in based on current URL
 */
const isLoggedIn = (currentUrl: string, platform: 'googleplay' | 'appstore'): boolean => {
  const successUrl = LOGIN_URLS[platform].success;
  return currentUrl.includes(successUrl?.split('/')[2] || ""); // Check domain match
};

/**
 * Waits for successful login by monitoring URL changes
 */
const waitForLogin = async (page: Page, platform: 'googleplay' | 'appstore', timeout: number): Promise<boolean> => {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkLogin = async () => {
      try {
        const currentUrl = page.url();

        if (isLoggedIn(currentUrl, platform)) {
          console.log(`✅ Login detected for ${platform}!`);
          resolve(true);
          return;
        }

        if (Date.now() - startTime > timeout) {
          console.log(`⏰ Timeout waiting for ${platform} login`);
          resolve(false);
          return;
        }

        setTimeout(checkLogin, LOGIN_CHECK_INTERVAL);
      } catch (error) {
        console.error('Error checking login status:', error);
        resolve(false);
      }
    };

    checkLogin();
  });
};

/**
 * Initializes a persistent browser session
 */
export const initializePersistentSession = async (config: SessionConfig): Promise<{ browser: Browser; context: BrowserContext; page: Page }> => {
  const { platform, headless = false, timeout = DEFAULT_TIMEOUT } = config;

  const userDataDir = config.userDataDir || createUserDataDir(platform);

  console.log(`🚀 Initializing ${platform} session...`);
  console.log(`📁 User data directory: ${userDataDir}`);

  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await browser.newPage();

  return { browser, context: browser, page };
};

/**
 * Handles login flow for the specified platform
 */
export const handleLoginFlow = async (
  page: Page,
  platform: 'googleplay' | 'appstore',
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> => {
  try {
    console.log(`🔐 Checking login status for ${platform}...`);

    // Navigate to the main platform page first
    const mainUrl = platform === 'googleplay'
      ? 'https://play.google.com/console'
      : 'https://appstoreconnect.apple.com/apps';

    await page.goto(mainUrl, { waitUntil: 'networkidle' });

    // Check if already logged in
    if (isLoggedIn(page.url(), platform)) {
      console.log(`✅ Already logged in to ${platform}!`);
      return true;
    }

    console.log(`⚠️ Not logged in to ${platform}. Please log in manually.`);
    console.log(`🌐 Current URL: ${page.url()}`);
    console.log(`⏳ Waiting for login completion (timeout: ${timeout / 1000}s)...`);

    // Wait for login to complete
    const loginSuccessful = await waitForLogin(page, platform, timeout);

    if (loginSuccessful) {
      // Wait a bit more to ensure session is fully established
      await page.waitForTimeout(2000);
      console.log(`🎉 ${platform} login completed successfully!`);
      return true;
    } else {
      console.log(`❌ Login timeout or failed for ${platform}`);
      return false;
    }

  } catch (error) {
    console.error(`Error in login flow for ${platform}:`, error);
    return false;
  }
};

/**
 * Main function to create and manage persistent browser sessions
 */
export const createPersistentBrowserSession = async (
  platform: 'googleplay' | 'appstore',
  options: {
    headless?: boolean;
    timeout?: number;
    userDataDir?: string;
    onLoginRequired?: () => Promise<void>;
  } = {}
): Promise<{ browser: Browser; context: BrowserContext; page: Page; isLoggedIn: boolean }> => {

  const config: SessionConfig = {
    platform,
    userDataDir: options.userDataDir || createUserDataDir(platform),
    headless: options.headless ?? false,
    timeout: options.timeout ?? DEFAULT_TIMEOUT
  };

  const { browser, context, page } = await initializePersistentSession(config);

  // Handle login flow
  const loginSuccessful = await handleLoginFlow(page, platform, config.timeout!);

  if (!loginSuccessful && options.onLoginRequired) {
    console.log('🔄 Triggering custom login handler...');
    await options.onLoginRequired();

    // Check again after custom login handler
    const retryLoginCheck = await waitForLogin(page, platform, config.timeout!);

    return {
      browser,
      context,
      page,
      isLoggedIn: retryLoginCheck
    };
  }

  return {
    browser,
    context,
    page,
    isLoggedIn: loginSuccessful
  };
};

/**
 * Utility function to start automation after ensuring login
 */
export const startAutomationWithLogin = async (
  platform: 'googleplay' | 'appstore',
  automationCallback: (page: Page) => Promise<void>,
  options: {
    headless?: boolean;
    timeout?: number;
    userDataDir?: string;
    maxRetries?: number;
  } = {}
): Promise<void> => {
  const { maxRetries = 1 } = options;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      console.log(`🎯 Starting automation for ${platform} (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const { browser, page, isLoggedIn } = await createPersistentBrowserSession(platform, {
        ...options,
        onLoginRequired: async () => {
          console.log('⚠️ Manual intervention required for login');
          console.log('Please complete the login process in the browser window');
        }
      });

      if (!isLoggedIn) {
        console.log(`❌ Failed to establish logged-in session for ${platform}`);
        await browser.close();

        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying... (${retryCount}/${maxRetries})`);
          continue;
        } else {
          throw new Error(`Could not establish logged-in session after ${maxRetries + 1} attempts`);
        }
      }

      console.log(`🚀 Starting automation process for ${platform}...`);

      try {
        await automationCallback(page);
        console.log(`✅ Automation completed successfully for ${platform}`);
      } catch (automationError) {
        console.error(`❌ Automation error for ${platform}:`, automationError);
        throw automationError;
      } finally {
        // Keep browser open for next run - don't close it
        console.log(`🔄 Keeping browser session active for future runs`);
        // Note: We don't close the browser to maintain the session
      }

      break; // Success, exit retry loop

    } catch (error) {
      console.error(`Error in automation flow:`, error);

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`🔄 Retrying automation... (${retryCount}/${maxRetries})`);
      } else {
        throw error;
      }
    }
  }
};

// Example usage functions
export const runGooglePlayAutomation = async (automationFn: (page: Page) => Promise<void>) => {
  await startAutomationWithLogin('googleplay', automationFn, {
    headless: false,
    timeout: 120000 // 2 minutes
  });
};

runGooglePlayAutomation(async(page)=>{



})

export const runAppStoreAutomation = async (automationFn: (page: Page) => Promise<void>) => {
  await startAutomationWithLogin('appstore', automationFn, {
    headless: false,
    timeout: 120000 // 2 minutes
  });
};