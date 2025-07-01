import type { AppData, Page } from "../../../types";

export const contentRatingsPage: Page = {
  url_template: "/{app_id}/app-content/content-ratings",
  shouldProcessParallel: true,
  fields: [
    {
      name: "Step 1 'Category' group",
      group: {
        condition: () => true,
        fields: [
          {
            name: "Email Address Input",
            action: "setText",
            default_value: "admin@sparissimo.com",
            fallback: {
              xpath: `//material-input[@debug-id='email-address-input']//input[@type='email']`,
            },
          },
          {
            name: "All Other App Types Radio Button",
            action: "click",
            fallback: {
              xpath: `//material-radio[.//label[text()='All Other App Types']]//input[@type='radio']`,
            },
          },
          {
            name: "IARC TOU Checkbox",
            action: "check",
            default_value: "true",
            fallback: {
              xpath: `//material-checkbox[@debug-id='iarc-tou-checkbox']//input[@type='checkbox']`,
            },
          },
          {
            name: "Next Button",
            action: "click",
            fallback: {
              xpath: `//button[@debug-id='next-button']`,
            },
          },
        ],
      },
    },
  ],
};
