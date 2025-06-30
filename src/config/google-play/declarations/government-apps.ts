import type { Page } from "../../../types";

export const governmentApps: Page = {
  url_template: "/{app_id}/app-content/government-apps",
  fields: [
    {
      name: "Government apps Radio Button",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-government-apps-page/console-form/console-block-1-column/div/div/console-form-row/div/div/div[1]/material-radio-group/material-radio[2]`,
      },
    },
  ],
};
