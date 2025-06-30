import type { AppData, Page } from "../../types";

export const mainStoreListingPage: Page = {
  url_template: "/{app_id}/main-store-listing",
  fields: [
    {
      api_key: "app_name",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/main-store-listing-page/listing-localizations/localization-section/div/div[2]/localized-listing/console-block-1-column[3]/div/div/console-form/console-form-row[1]/div/div[2]/div[1]/localized-text-input/div/div/material-input/label/input`,
      },
      action: "setText",
      //   validation: /^.{1,50}$/,
    },
    {
      api_key: "app_details.app_short_description",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/main-store-listing-page/listing-localizations/localization-section/div/div[2]/localized-listing/console-block-1-column[3]/div/div/console-form/console-form-row[2]/div/div[2]/div[1]/localized-text-input/div/div/material-input/label/input`,
      },
      action: "setText",
      //   validation: /^.{1,50}$/,
    },
    {
      api_key: "app_details.app_full_description",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/main-store-listing-page/listing-localizations/localization-section/div/div[2]/localized-listing/console-block-1-column[3]/div/div/console-form/console-form-row[3]/div/div[2]/div[1]/localized-text-input/div/div/material-input/label/span[2]/textarea`,
      },
      action: "setText",
      //   validation: /^.{1,50}$/,
    },
    {
      api_key: "",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/main-store-listing-page/listing-localizations/localization-section/div/div[2]/localized-listing/console-block-1-column[8]/div/div/console-form/console-form-row/div/div[2]/div[1]/localized-image-uploader/div/div/app-screenshots-uploader/console-graphic-uploader/div[1]/div/div/div[1]`,
      },
      action: "uploadFile",
      valueProcessor: (appData: AppData) => {
        return [
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            appData.app_splash_screen_url
          )}&device=android`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            appData.websiteUrl
          )}&device=android`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.websiteUrl}/contact`
          )}&device=android`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.websiteUrl}/delivery`
          )}&device=android`,
          `http://localhost:3000/screenshot?url=${encodeURIComponent(
            `${appData.websiteUrl}/menu`
          )}&device=android`,
        ];
        // const websiteUrl = appData.websiteUrl;
        // const splashScreenUrl = appData.app_splash_screen_url;

        // if (!websiteUrl) {
        //   console.warn("websiteUrl is required for generating screenshot URLs");
        //   return [];
        // }

        // const screenshotUrls = [
        //   splashScreenUrl &&
        //     `http://localhost:3000/screenshot?url=${encodeURIComponent(
        //       splashScreenUrl
        //     )}&device=android`,
        //   `http://localhost:3000/screenshot?url=${encodeURIComponent(
        //     websiteUrl
        //   )}&device=android`,
        //   `http://localhost:3000/screenshot?url=${encodeURIComponent(
        //     `${websiteUrl}/contact`
        //   )}&device=android`,
        //   `http://localhost:3000/screenshot?url=${encodeURIComponent(
        //     `${websiteUrl}/delivery`
        //   )}&device=android`,
        //   `http://localhost:3000/screenshot?url=${encodeURIComponent(
        //     `${websiteUrl}/menu`
        //   )}&device=android`,
        // ].filter(Boolean); // This will remove any falsy values (like undefined if splashScreenUrl is not provided)

        // return screenshotUrls;
      },

      //   validation: /^.{1,50}$/,
    },
    // {
    //   api_key: "app_description",
    //   selector: 'textarea[name="app_description"]',
    //   action: "setText",
    //   validation: /^.{1,4000}$/,
    // },
  ],
};
