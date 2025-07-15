import type { Page } from "../../../types";

export const advertisingIdPage: Page = {
  url_template: "/{app_id}/app-content/ad-id-declaration",
  shouldProcessParallel: true,
  fields: [
    {
      name: "Advertising ID",
      api_key: "advertising_id",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-ad-id-declaration-page/console-block-1-column/div/div/console-form/console-form-row/div/div/div[1]/material-radio-group/material-radio[1]`,
      },
    },
    {
      name: "Save Button",
      condition(page, appData) {
        const element = page.locator(`//button[.//span[text()='Save']]`);
        return !element.isDisabled();
      },
      action: "click",
      fallback: {
        xpath: `//button[.//span[text()='Save']]`,
      },
    },
  ],
};
