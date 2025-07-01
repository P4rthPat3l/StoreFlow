import type { Page } from "../../types";

export const appPrivacy: Page = {
  url_template: "/{app_id}/distribution/privacy",
  fields: [
    {
      name: "Privacy Policy Edit Button",
      action: "click",
      fallback: {
        xpath: `//div[contains(@class, 'details-header')]//button[normalize-space(text())='Edit']`,
      },
    },
    {
      name: "Privacy Policy URL",
      action: "setText",
      api_key: "privacy_policy_url",
      fallback: {
        xpath: `//input[@id='privacyPolicyUrl' and @name='localizations[0].privacyPolicyUrl']`,
      },
    },

    {
      name: "Save And Close Button Group",
      group: {
        condition: () => true,
        fields: [
          {
            name: "Close Button",
            action: "click",
            condition: async (page, appData) => {
              const element = page.locator(
                `//div[@class='modal-button-group']//button[normalize-space(text())='Save']`
              );

              return !!(await element.getAttribute("class"))?.includes(
                "tb-btn--disabled"
              );
            },
            fallback: {
              xpath: `//div[@class='modal-button-group']//button[normalize-space(text())='Cancel']`,
            },
          },
          {
            name: "Save Button",
            action: "click",
            condition: async (page, appData) => {
              const element = page.locator(
                `//div[@class='modal-button-group']//button[normalize-space(text())='Save']`
              );

              return !(await element.getAttribute("class"))?.includes(
                "tb-btn--disabled"
              );
            },
            fallback: {
              xpath: `//div[@class='modal-button-group']//button[normalize-space(text())='Save']`,
            },
          },
        ],
      },
    },

    {
      name: "Data Types Group",

      group: {
        condition: () => true,
        fields: [
          {
            name: "Data Types Edit Button",
            action: "click",
            fallback: {
              xpath: `//h3[normalize-space(text())='Data Types']/following-sibling::button[normalize-space(text())='Edit']`,
            },
          },
          {
            name: "'No, we do not collect data from this app' Radio Button",
            action: "click",
            fallback: {
              xpath: `//input[@id='collectData_no' and @type='radio']`,
            },
          },
          {
            name: "'Publish' Button",
            action: "click",
            fallback: {
              xpath: `//button[normalize-space(text())='Publish' and @data-id='mainbutton']`,
            },
          },
        ],
      },
    },
  ],
};
