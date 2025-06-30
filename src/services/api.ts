import type { AppData } from "../types";
import { logger } from "../utils/logger";

interface ApiResponse {
  status: string;
  data: AppData[];
  message?: string;
}

export const fetchAppData = async (
  apiUrl: string = "https://manage.sparissimofood.com/api/restaurants/get-app-details"
): Promise<AppData[]> => {
  try {
    logger.info(`Fetching app data from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "App-Automation-Tool/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = (await response.json()) as ApiResponse;

    if (!(result?.status === "success") || !Array.isArray(result?.data)) {
      throw new Error(
        "Invalid API response format : " + JSON.stringify(result)
      );
    }

    logger.info(`Successfully fetched ${result.data.length} apps`);
    return result.data;
  } catch (error) {
    logger.error("Failed to fetch app data", error);
    throw new Error(`API fetch failed: ${(error as Error).message}`);
  }
};

export const validateApiConnection = async (
  apiUrl: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Mock data for development/testing
export const getMockAppData = (): AppData[] => [
  {
    app_id: "366",
    app_name: "Test Restaurant App 1",
    app_description: "A wonderful restaurant app for ordering food",
    collects_user_data: true,
    delete_account_url: "https://example.com/delete-account",
    contact_name: "John Doe",
    privacy_policy_url: "https://example.com/privacy",
  },
  {
    app_id: "367",
    app_name: "Test Restaurant App 2",
    app_description: "Another great restaurant app",
    collects_user_data: false,
    delete_account_url: "https://example2.com/delete-account",
    contact_name: "Jane Smith",
    privacy_policy_url: "https://example2.com/privacy",
  },
];
