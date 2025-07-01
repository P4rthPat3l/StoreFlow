import * as fs from "fs";
import { chromium, type Browser, type BrowserContext } from "playwright";

// Configuration
const AUTH_FILE = process.env.APP_STORE_AUTH_FILE || "app-store-auth.json";
const YOUTUBE_URL = "https://www.youtube.com/";

const GOOGLE_PLAY_CONSOLE_URL = "https://appstoreconnect.apple.com/login";
const APP_LIST_URL_PATTERN =
  /https:\/\/appstoreconnect\.apple\.com\/apps\/\d+\/distribution\/ios\/version\/inflight/;

async function authenticate() {
  // Launch browser in non-headless mode with a persistent context
  const userDataDir = "./app-store-auth-data";
  const browser = await chromium.launchPersistentContext(userDataDir, {
    executablePath: process.env.APP_STORE_EXECUTABLE_PATH,
    headless: false,
    viewport: { width: 1280, height: 800 },
    slowMo: 100,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = await browser.newPage();

  try {
    console.log("Please sign in to App Store Connect manually...");
    await page.goto(GOOGLE_PLAY_CONSOLE_URL);

    // Wait for user to complete sign in (up to 5 minutes)
    await page.waitForURL(APP_LIST_URL_PATTERN, {
      timeout: 5 * 60 * 1000, // 5 minutes timeout
    });

    // Get the final URL for confirmation
    const currentUrl = page.url();
    console.log(`Successfully loaded app list at: ${currentUrl}`);

    // Save the authentication state
    const storage = await page.context().storageState();
    fs.writeFileSync(AUTH_FILE, JSON.stringify(storage, null, 2));
    console.log("Authentication successful! Auth state saved to", AUTH_FILE);
  } catch (error) {
    console.error("Authentication failed or timed out:", error);
  } finally {
    await browser.close();
  }
}

// Function to create a new context with stored authentication
export async function getAuthenticatedContext(
  browser: Browser
): Promise<BrowserContext> {
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(
      "Authentication file not found. Please run authenticate() first."
    );
  }
  const storageState = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
  return await browser.newContext({ storageState });
}

// Run the authentication
authenticate().catch(console.error);
