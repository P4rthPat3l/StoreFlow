import type { Page } from "../../../types";

export const adsPage: Page = {
  url_template: "/{app_id}/app-content/ads-declaration",
  shouldProcessParallel: true,
  fields: [
    {
      name: "'No, my app does not contain ads' Radio button",
      action: "click",
      fallback: {
        xpath: `//material-radio[.//label[text()='No, my app does not contain ads']]//input[@type='radio']`,
      },
    },
    {
      name: "Save Button",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-ads-declaration-page/div/publishing-bottom-bar/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div[2]/overflowable-item[2]/button/div[2]`,
      },
    },
  ],
};
