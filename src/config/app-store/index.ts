import type { Platform } from "../../types";
import { appInformation } from "./app-information";
import { appPrivacy } from "./app-privacy";
import { pricingAndAvailability } from "./pricing_and_availability";

export const appStorePlatform: Platform = {
  base_url: "https://appstoreconnect.apple.com/apps",
  loginCheckUrl:
    /https:\/\/appstoreconnect\.apple\.com\/apps\/\d+\/distribution\/ios\/version\/inflight(\?.*)?$/,
  app_mappings: {
    "6747702208": "363",
  },
  pages: {
    app_information: appInformation,
    app_privacy: appPrivacy,
    pricing_and_availability: pricingAndAvailability,
  },
};
