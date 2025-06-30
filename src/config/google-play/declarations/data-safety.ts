import type { Page } from "../../../types";

export const dataSafetyPage: Page = {
  url_template: "/{app_id}/app-content/data-privacy-security",
  fields: [
    {
      name: "Data Safety",
      api_key: "data_safety",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-data-safety-page/console-form/console-block-1-column/div/div/console-form-row/div/div/div[1]/material-radio-group/material-radio[1]`,
      },
    },
  ],
};
