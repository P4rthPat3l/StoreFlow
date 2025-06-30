import type { Page } from "../../../types";

export const appAccessPage: Page = {
  url_template: "/{app_id}/app-content/testing-credentials",
  fields: [
    {
      name: "All or some functionality in my app is restricted",
      api_key: "app_access",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-testing-credentials-page/console-block-1-column/div/div/console-form/console-form-expandable-section[2]/div/div/material-radio`,
      },
    },
    {
      name: "All or some functionality in my app is restricted",
      api_key: "app_access",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-testing-credentials-page/console-block-1-column/div/div/console-form/console-form-expandable-section[2]/div/div/material-radio`,
      },
      conditionals: [
        {
          if_checked: "yes",
          fields: [
            {
              api_key: "additional_data_field",
              selector: 'input[name="additional_data"]',
              action: "setText",
            },
          ],
        },
      ],
    },
  ],
};
