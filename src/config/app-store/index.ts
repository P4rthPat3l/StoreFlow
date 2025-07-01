import type { Platform } from "../../types";
import { appInformation } from "./general/app-information";

export const appStorePlatform: Platform = {
  base_url: "https://appstoreconnect.apple.com/apps",
  app_mappings: {
    "366": "6747702208",
  },
  pages: {
    app_information: appInformation,
  },
};
