import type { Platform } from "../../types";
import { appInformation } from "./app-information";
import { appPrivacy } from "./app-privacy";
import { pricingAndAvailability } from "./pricing_and_availability";
import { inflight } from "./inflight";

export const appStorePlatform: Platform = {
  base_url: "https://appstoreconnect.apple.com/apps",
  authFile: "app-store-auth.json",
  userDataBaseDir : "app-store",
  loginCheckUrl:
    /https:\/\/appstoreconnect\.apple\.com\/apps\/\d+\/distribution\/ios\/version\/inflight$/,
  app_mappings: {
    "6747702208": "363",
  },
  pages: {
    inflight: inflight,
    app_information: appInformation,
    app_privacy: appPrivacy,
    pricing_and_availability: pricingAndAvailability,
  },
};