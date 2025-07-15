import type { Page } from "../../../types";

export const targetAudienceAndContentPage: Page = {
  url_template: "/{app_id}/app-content/target-audience-content",
  shouldProcessParallel: true,
  fields: [
    {
      name: "step 1 'Target age'",
      action: "click",
      group: {
        condition: () => true,
        fields: [
          {
            name: "step 1 '13-15' check box",
            action: "check",
            default_value: "true",
            fallback: {
              xpath: `//material-checkbox[.//label[text()='13-15']]//input[@type='checkbox']`,
            },
          },
          {
            name: "step 1 '16-17' check box",
            action: "check",
            default_value: "true",
            fallback: {
              xpath: `//material-checkbox[.//label[text()='16-17']]//input[@type='checkbox']`,
            },
          },
          {
            name: "step 1 '18+' check box",
            action: "check",
            default_value: "true",
            fallback: {
              xpath: `//material-checkbox[.//label[text()='18 and over']]//input[@type='checkbox']`,
            },
          },
        ],
      },
    },
    {
      name: "Next Button",
      action: "click",
      condition: async (page, appData) => {
        const element = page.locator(`//button[.//span[text()='Next']]`);

        const isDisabled = await element
          .isDisabled({ timeout: 1000 })
          .catch(() => false);
        return !isDisabled;
      },
      fallback: {
        xpath: `//button[.//span[text()='Next']]`,
      },
    },
    {
      name: "Save Button",
      action: "click",
      condition: async (page, appData) => {
        const element = page.locator(`//button[.//span[text()='Save']]`);

        const isDisabled = await element
          .isDisabled({ timeout: 1000 })
          .catch(() => false);
        return !isDisabled;
      },
      fallback: {
        xpath: `//button[.//span[text()='Save']]`,
      },
    },
  ],
};
