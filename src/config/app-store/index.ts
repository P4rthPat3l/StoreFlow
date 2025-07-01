import type { Platform } from "../../types";
import { appInformation } from "./app-information";
import { appPrivacy } from "./app-privacy";
import { pricingAndAvailability } from "./pricing_and_availability";

export const appStorePlatform: Platform = {
  base_url: "https://appstoreconnect.apple.com/apps",
  app_mappings: {
    "363": "6747702208",
  },
  pages: {
    app_information: appInformation,
    app_privacy: appPrivacy,
    pricing_and_availability: pricingAndAvailability,
  },
};
