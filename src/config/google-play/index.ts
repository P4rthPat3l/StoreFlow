import type { Platform } from "../../types";
import { dataSafetyPage } from "./data-safety";
import { appContentPage } from "./app-content";

export const googlePlayPlatform: Platform = {
  base_url:
    "https://play.google.com/console/u/3/developers/5696489665814861362/app",
  app_mappings: {
    "366": "4974483354311914204",
    "367": "4976158818989412534",
  },
  pages: {
    data_safety: dataSafetyPage,
    app_content: appContentPage,
  },
};
