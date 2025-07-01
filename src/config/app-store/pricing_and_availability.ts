import type { Page } from "../../types";

export const pricingAndAvailability: Page = {
  url_template: "/{app_id}/distribution/pricing",
  fields: [
    {
      name: "Base Country or Region Group",
      group: {
        condition: () => true,
        fields: [
          {
            name: "'Base Country or Region' Edit Button",
            action: "click",
            fallback: {
              xpath: `//p[span[normalize-space(text())='United States (USD)']]/following-sibling::p/button[normalize-space(text())='Edit']`,
            },
          },
          {
            name: "'Base Country or Region' check Box",
            action: "check",
            default_value: "true",
            fallback: {
              xpath: `//label[@for='haveConsent']/input[@type='checkbox' and @id='haveConsent']`,
            },
          },
          {
            name: "'Base Country or Region' Edit Button",
            action: "click",
            fallback: {
              xpath: `//button[text()='Edit' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`,
            },
          },
          {
            name: "'Base Country or Region' Country Select Button",
            action: "click",
            fallback: {
              xpath: `//div[label[@for='baseTerritoryId']]//button[@id='baseTerritoryId']`,
            },
          },
          {
            name: "'United States (USD)' Country Select Button",
            action: "click",
            fallback: {
              xpath: `//li[@role='menuitem']//button[normalize-space(text())='United States (USD)']`,
            },
          },

          {
            name: "'Price' Select Button",
            action: "click",
            fallback: {
              xpath: `//div[label[@for='basePricePointId']]//button[@id='basePricePointId']`,
            },
          },
          {
            name: "'$0.00' Price Select Button",
            action: "click",
            fallback: {
              xpath: `//button[.//p[contains(text(), '$0.00')]]`,
            },
          },

          {
            name: "'Next' Country Select Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Next']`,
            },
          },
          {
            name: "'Next' Country Select Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Next']`,
            },
          },
          {
            name: "'Confirm' Country Select Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Confirm']`,
            },
          },
        ],
      },
    },

    {
      name: "'App Availability' Group",
      group: {
        condition: () => true,
        fields: [
          {
            name: "'App Availability' Manage Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Manage']`,
            },
          },
          {
            name: "'App Availability' Manage Availability Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Manage Availability']`,
            },
          },
          {
            name: "'Country or Region Availability' check Box Group",
            group: {
              condition: () => true,
              fields: [
                {
                  name: "'Switzerland' check Box",
                  action: "check",
                  default_value: "true",
                  fallback: {
                    xpath: `//input[@type='checkbox' and @id='CHE']`,
                  },
                },
                {
                  name: "'India' check Box",
                  action: "check",
                  default_value: "true",
                  fallback: {
                    xpath: `//input[@type='checkbox' and @id='IND']`,
                  },
                },
              ],
            },
          },

          {
            name: "Next And Cancel Button Group",
            group: {
              condition: () => true,
              fields: [
                {
                  name: "Close Button",
                  action: "click",
                  condition: async (page, appData) => {
                    const element = page.locator(
                      `//button[text()='Next' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`
                    );

                    return element.isDisabled();
                  },
                  fallback: {
                    xpath: `//button[text()='Cancel' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`,
                  },
                },
                {
                  name: "Next Button Group",
                  action: "click",
                  group: {
                    condition: async (page, appData) => {
                      const element = page.locator(
                        `//button[text()='Next' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`
                      );

                      return !element.isDisabled();
                    },
                    fields: [
                      {
                        name: "Next Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[text()='Next' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`,
                        },
                      },
                      {
                        name: "Next Button",
                        action: "click",
                        fallback: {
                          xpath: `//button[text()='Confirm' and contains(@class, 'base__InteractiveText-sc-cmy001-0')]`,
                        },
                      },
                    ],
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
