import type { Platform } from "../../types";
import { appInformationPage } from "./app-information";

export const appStorePlatform: Platform = {
  base_url: "https://appstoreconnect.apple.com",
  app_mappings: {
    "366": "com.example.app366",
    "367": "com.example.app367",
  },
  pages: {
    app_information: appInformationPage,
  },
};
