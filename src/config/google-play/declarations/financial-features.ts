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
      name: "Next Button",
      action: "click",
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
