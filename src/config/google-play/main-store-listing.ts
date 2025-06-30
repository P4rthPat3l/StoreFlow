import type { Page } from "../../types";

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
    // {
    //   api_key: "app_description",
    //   selector: 'textarea[name="app_description"]',
    //   action: "setText",
    //   validation: /^.{1,4000}$/,
    // },
  ],
};
