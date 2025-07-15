import type { Page } from "../../../types";

export const healthAppsPage: Page = {
  url_template: "/{app_id}/app-content/health",
  fields: [
    {
      name: "'My app does not have any health features' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='My app does not have any health features']]//input[@type='checkbox']`,
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
