import type { Page } from "../../../types";
export const privacyPolicyPage: Page = {
  url_template: "/{app_id}/app-content/privacy-policy",
  shouldProcessParallel: true,
  fields: [
    {
      name: "Privacy Policy URL",
      action: "setText",
      api_key: "privacy_policy_url",
      fallback: {
        xpath: `//material-input[@debug-id='privacy-policy-url-input']//input[@type='text']`,
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
