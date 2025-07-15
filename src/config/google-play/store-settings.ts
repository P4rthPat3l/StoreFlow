import type { Page } from "../../types";

export const storeSettingsPage: Page = {
  shouldProcessParallel: true,
  url_template: "/{app_id}/store-settings",
  fields: [
    {
      name: "'App Category Edit Group'",
      group: {
        condition: () => true,
        fields: [
          {
            name: "Edit App Category",
            action: "click",
            fallback: {
              xpath: `//material-button[@debug-id='edit-app-category-section-button']//button[.//div[text()='Edit']]`,
            },
          },
          {
            name: "App or Game selection Group",
            group: {
              condition: () => true,
              fields: [
                {
                  name: "App or Game",
                  action: "click",
                  fallback: {
                    xpath: `//material-dropdown-select[@debug-id='type-dropdown']//div[@role='button']`,
                  },
                },
                {
                  name: "Sub App or Game",
                  action: "click",
                  fallback: {
                    xpath: `//material-select-dropdown-item[.//span[text()='App']]`,
                  },
                },
              ],
            },
          },
          {
            name: "App Category selection Group",
            group: {
              condition: () => true,
              fields: [
                {
                  name: "App Category",
                  action: "click",
                  fallback: {
                    xpath: `//material-dropdown-select[@debug-id='category-dropdown']//div[@role='button']`,
                  },
                },
                {
                  name: "App Sub Category",
                  action: "click",
                  fallback: {
                    xpath: `//material-select-dropdown-item[.//span[text()='Food & Drink']]`,
                  },
                },
              ],
            },
          },
          {
            name: "save and close group",
            group: {
              condition: async (page) => {
                const element = page.locator(
                  `(//button[@debug-id='main-button' and contains(@class, 'mdc-button--unelevated') and .//span[text()='Save']])[1]`
                );
                const isDiable = await element
                  .isDisabled({ timeout: 1000 })
                  .catch(() => false);
                return !isDiable;
              },
              fields: [
                {
                  name: "Save Button",
                  action: "click",
                  fallback: {
                    xpath: `(//button[@debug-id='main-button' and contains(@class, 'mdc-button--unelevated') and .//span[text()='Save']])[1]`,
                  },
                },
                {
                  name: "Close Button",
                  action: "click",
                  fallback: {
                    xpath: `//h2[text()='App category']/following::button[@aria-label='Close'][1]`,
                  },
                },
              ],
            },
          },
          {
            name: "close if save button is disabled",
            condition: async (page) => {
              const element = page.locator(
                `(//button[@debug-id='main-button' and contains(@class, 'mdc-button--unelevated') and .//span[text()='Save']])[1]`
              );
              const isDiable = await element
                .isDisabled({ timeout: 1000 })
                .catch(() => false);
              return isDiable;
            },
            action: "click",
            fallback: {
              xpath: `//h2[text()='App category']/following::button[@aria-label='Close'][1]`,
            },
          },
        ],
      },
    },

    {
      name: "'Store listing contact details group'",
      group: {
        condition: () => true,
        fields: [
          {
            name: "'Store listing contact details' Edit Button",
            action: "click",
            fallback: {
              xpath: `//material-button[@debug-id='edit-store-listing-section-button']//button[.//div[text()='Edit']]`,
            },
          },

          {
            name: "Store listing contact details Modal Group",
            group: {
              condition: () => true,
              fields: [
                {
                  name: "Email address",
                  action: "setText",
                  default_value: "admin@sparissimo.com",
                  fallback: {
                    xpath: `//material-input[@debug-id='email-input']//input[@type='text']`,
                  },
                },
                {
                  name: "Phone number",
                  action: "setText",
                  default_value: "+41446880990",
                  fallback: {
                    xpath: `//material-input[@debug-id='phone-input']//input[@type='text']`,
                  },
                },
                {
                  name: "Website",
                  action: "setText",
                  api_key: "websiteUrl",
                  fallback: {
                    xpath: `//material-input[@debug-id='website-input']//input[@type='text']`,
                  },
                },
                {
                  name: "Save Button",
                  action: "click",
                  condition: async (page) => {
                    const element = page.locator(
                      `//div[contains(@class, 'popup') and .//h2[text()='Store listing contact details']]//button[@class='mdc-button overflowable-button mdc-button--unelevated' and @debug-id='main-button' and .//span[text()='Save']]`
                    );
                    const isDiable = await element
                      .isDisabled({ timeout: 1000 })
                      .catch(() => false);
                    return !isDiable;
                  },
                  fallback: {
                    xpath: `//div[contains(@class, 'popup') and .//h2[text()='Store listing contact details']]//button[@class='mdc-button overflowable-button mdc-button--unelevated' and @debug-id='main-button' and .//span[text()='Save']]`,
                  },
                },
                {
                  name: "close if save button is disabled",
                  condition: async (page) => {
                    const element = page.locator(
                      `//div[contains(@class, 'popup') and .//h2[text()='Store listing contact details']]//button[@class='mdc-button overflowable-button mdc-button--unelevated' and @debug-id='main-button' and .//span[text()='Save']]`
                    );
                    const isDiable = await element
                      .isDisabled({ timeout: 1000 })
                      .catch(() => false);
                    return isDiable;
                  },
                  action: "click",
                  fallback: {
                    xpath: `//h2[text()='Store listing contact details']/following::button[@aria-label='Close'][1]`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};
