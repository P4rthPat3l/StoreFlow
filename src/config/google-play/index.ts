import type { Platform } from "../../types";
import { advertisingIdPage } from "./declarations/advertising-id";
import { appAccessPage } from "./declarations/app-aceess";
import { dataSafetyPage } from "./declarations/data-safety";
import { governmentApps } from "./declarations/government-apps";

import { mainStoreListingPage } from "./main-store-listing";

export const googlePlayPlatform: Platform = {
  base_url:
    "https://play.google.com/console/u/3/developers/5696489665814861362/app",
  app_mappings: {
    "366": "4972018017227662082",
    // "367": "4976158818989412534",
  },
  pages: {
    main_store_listing: mainStoreListingPage,
    advertising_id: advertisingIdPage,
    app_access: appAccessPage,
    government_apps: governmentApps,
    data_safety: dataSafetyPage,
  },
};
