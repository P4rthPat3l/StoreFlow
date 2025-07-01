import type { Page } from "../../../types";
export const financialFeaturesPage: Page = {
  url_template: "/{app_id}/app-content/financial-features",
  shouldProcessParallel: true,
  fields: [
    {
      name: "'My app doesn't provide any financial features' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//label[text()="My app doesn't provide any financial features"]]//input[@type='checkbox']`,
      },
    },
    {
      name: "Save Button",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-finance-declaration-page/publishing-bottom-bar/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div[3]/overflowable-item[3]/button/material-ripple`,
      },
    },
  ],
};
