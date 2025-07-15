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
  authFile: process.env.GOOGLE_PLAY_AUTH_FILE,
  loginCheckUrl:
    /https:\/\/play\.google\.com\/console\/u\/\d+\/developers\/\d+\/app-list(\?.*)?$/,
  app_mappings: {
    // "366": "4972018017227662082",
    // "367": "4976158818989412534",
    // "4975003404960306836": "368", // test
    // "4976158818989412534": "367", // test
    "4974904425575267307": "355",
  },
  pages: {
    main_store_listing: mainStoreListingPage, //done
    advertising_id: advertisingIdPage, // don
    app_access: appAccessPage, // done
    government_apps: governmentApps, // done
    data_safety: dataSafetyPage, // need to fill target audience and content first and privecy policy
    ads: adsPage, // done
    financial_features: financialFeaturesPage, // done
    health_apps: healthAppsPage, // done
    privacy_policy: privacyPolicyPage, // done
    target_audience_and_content: targetAudienceAndContentPage, // done
    store_settings: storeSettingsPage, // done
  },
};
