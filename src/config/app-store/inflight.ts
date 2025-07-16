import type { AppData, Page } from "../../types";

export const inflight: Page = {
  url_template: "/{app_id}/distribution/ios/version/inflight",
  fields: [
    {
      name: "Inflight",
      action: "uploadFile",
      api_key: "",
      fallback: {
        xpath: `//section[.//h3[text()='Previews and Screenshots']]//div[@role='region']`,
      },
      valueProcessor: (appData: AppData) => {
        return [
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            appData.app_splash_screen_url
          )}&device=iphone`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            appData.subDomain
          )}&device=iphone`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.subDomain}/contact`
          )}&device=iphone`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.subDomain}/delivery`
          )}&device=iphone`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.subDomain}/menu`
          )}&device=iphone`,
        ];
      },
    },
  ],
};
