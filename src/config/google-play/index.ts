import type { Platform } from "../../types";
import { advertisingIdPage } from "./declarations/advertising-id";
import { appAccessPage } from "./declarations/app-aceess";
import { dataSafetyPage } from "./declarations/data-safety";
import { governmentApps } from "./declarations/government-apps";
import { adsPage } from "./declarations/ads";
import { financialFeaturesPage } from "./declarations/financial-features";
import { healthAppsPage } from "./declarations/health-apps";
import { privacyPolicyPage } from "./declarations/privacy-policy";
import { targetAudienceAndContentPage } from "./declarations/target-audience-and-content";
import { storeSettingsPage } from "./store-settings";
import { mainStoreListingPage } from "./main-store-listing";

export const googlePlayPlatform: Platform = {
  base_url:
    "https://play.google.com/console/u/3/developers/5696489665814861362/app",
  app_mappings: {
    // "366": "4972018017227662082",
    // "367": "4976158818989412534",
    "368": "4975003404960306836", // test
    "356": "4975003404960306836", // test
  },
  pages: {
    main_store_listing: mainStoreListingPage,
    advertising_id: advertisingIdPage,
    app_access: appAccessPage,
    government_apps: governmentApps,
    data_safety: dataSafetyPage,
    ads: adsPage,
    financial_features: financialFeaturesPage,
    health_apps: healthAppsPage,
    privacy_policy: privacyPolicyPage,
    target_audience_and_content: targetAudienceAndContentPage,
    store_settings: storeSettingsPage,
  },
};
