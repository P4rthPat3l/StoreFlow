import type { Page } from "../../../types";

export const dataSafetyPage: Page = {
  url_template: "/{app_id}/app-content/data-privacy-security",
  shouldProcessParallel: false,
  fields: [
    {
      name: "Step 1 Next Button",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-play-safety-labels-page/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div[1]`,
      },
    },
    //* step 2
    {
      name: "step 2 'Yes' Redio Button",
      action: "click",
      selector:
        "console-form-row:nth-of-type(2) > div > div > div:nth-of-type(1) > material-radio-group:nth-of-type(1) > material-radio",
    },
    {
      name: "step 2 'No' Redio Button",
      action: "click",
      selector:
        "div > div > div:nth-of-type(1) > expandable-container > div > div > console-form-row:nth-of-type(1) > div > div > div:nth-of-type(1) > material-radio-group > material-radio:nth-of-type(2)",
    },

    {
      name: "step 2 'Username and Passoword' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//label[text()='Username and password']/preceding::input[@type='checkbox'][1]`,
      },
    },
    {
      name: "step 2 'Delete Account Url' Input",

      action: "setText",
      selector: `input[aria-label="Delete account URL"]`,
      default_value: "https://www.sparissimo.world/profile",
    },
    {
      name: "step 2 'No' Radio Button",

      action: "click",
      selector: `expandable-container:nth-of-type(2) > div > div > console-form-row:nth-of-type(1) > div > div > div:nth-of-type(1) > material-radio-group > material-radio:nth-of-type(2) > div:nth-of-type(2) > label`,
    },

    //* Next button
    {
      name: "Step 2 Next Button",

      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-play-safety-labels-page/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div[1]`,
      },
    },
    //* step 3
    {
      name: "Step 3 'Location' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[contains(text(), 'Approximate location')]]//input[@type='checkbox']`,
      },
    },

    //* expandable element for personal info
    {
      name: "Step 3 'Personal info' Expandable",
      action: "click",
      fallback: {
        xpath: `//div[contains(@class, 'header-line') and .//span[text()='Personal info']]//button[.//span[text()='Show']]`,
      },
    },
    {
      name: "Step 3 'Personal info' 'Name' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='Name']]//input[@type='checkbox']`,
      },
    },
    {
      name: "Step 3 'Personal info' 'Email address' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='Email address']]//input[@type='checkbox']`,
      },
    },
    {
      name: "Step 3 'Personal info' 'Address' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='Address']]//input[@type='checkbox']`,
      },
    },
    {
      name: "Step 3 'Personal info' 'Phone number' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='Phone number']]//input[@type='checkbox']`,
      },
    },

    //* expandable element for payment info
    {
      name: "Step 3 'Device or other IDs' Expandable",
      action: "click",
      fallback: {
        xpath: `//div[contains(@class, 'header-line') and .//span[text()='Device or other IDs']]//button[.//span[text()='Show']]`,
      },
    },
    {
      name: "Step 3 'Device or other IDs' 'Device or other IDs' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='Device or other IDs']]//input[@type='checkbox']`,
      },
    },

    //* step 3 'Next' button
    {
      name: "Step 3 'Next' Button",
      action: "click",
      fallback: {
        xpath: `//button[.//span[text()='Next']]`,
      },
    },
    //* step 4 "Data usage and handling"
    {
      name: "Step 4 'Data usage and handling' group",
      group: {
        condition: (page, appData) => true,
        fields: [
          //* Step 4 'Personal info' group
          {
            name: "Step 4 'Personal info' group",
            group: {
              condition: (page, appData) => true,
              fields: [
                //   //* click on the expandable element. this will collaps if expand
                // {
                //   name: "Step 4 'Data usage and handling' 'Data usage and handling' Hide Expandable",
                //   condition: (page, appData) => {
                //     const element = page.locator(
                //       `//span[text()='Personal info']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`
                //     );
                //     return !!element;
                //   },
                //   action: "click",
                //   fallback: {
                //     xpath: `//span[text()='Personal info']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`,
                //   },
                // },
                {
                  name: "Step 4 'Data usage and handling' 'Data usage and handling' Show Expandable",
                  condition: (page, appData) => {
                    const element = page.locator(
                      `//span[text()='Personal info']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`
                    );
                    return !!element;
                  },
                  action: "click",
                  fallback: {
                    xpath: `//span[text()='Personal info']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`,
                  },
                },
                {
                  name: "'Name' Group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Name' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[@class='particle-table-row' and @role='row'       and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Name')]] //ess-cell[@essfield='action']//button)[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      // {
                      //   name: "'Users can choose whether this data is collected' Radio Button",
                      //   action: "click",
                      //   fallback: {
                      //     xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                      //   },
                      // },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",
                        // condition: (page, appData) => {
                        //   const element = page.locator(
                        //     `//button[.//span[text()='Save']]`
                        //   );
                        //   return !element.isDisabled();
                        // },
                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );

                          let isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false)
                            .then((value) => value);

                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
                {
                  name: "'Email address' Group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Email address' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[@class='particle-table-row' and @role='row'       and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Email address')]] //ess-cell[@essfield='action']//button)[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );
                          const isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false);
                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
                {
                  name: "'Address' Group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Address' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[@class='particle-table-row' and @role='row'       and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Address')]] //ess-cell[@essfield='action']//button)[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );
                          const isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false);
                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
                {
                  name: "'Phone number' Group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Phone number' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[contains(@class, 'particle-table-row') and @role='row'       and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Phone number')]] //ess-cell[@essfield='action']//button[@aria-label='Open Phone number questions'])[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );
                          const isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false);
                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          //* Step 4 'Location' group
          {
            name: "Step 4 'Location' group",
            group: {
              condition: (page, appData) => true,
              fields: [
                // {
                //   name: "Step 4 'Location' 'Location' Hide Expandable",
                //   condition: (page, appData) => {
                //     const element = page.locator(
                //       `//span[text()='Location']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`
                //     );
                //     return !!element;
                //   },
                //   action: "click",
                //   fallback: {
                //     xpath: `//span[text()='Location']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`,
                //   },
                // },
                {
                  name: "Step 4 'Location' 'Location' Show Expandable",
                  condition: (page, appData) => {
                    const element = page.locator(
                      `//span[text()='Location']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`
                    );
                    return !!element;
                  },
                  action: "click",
                  fallback: {
                    xpath: `//span[text()='Location']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`,
                  },
                },
                {
                  name: "Step 4 'Device or other IDs' group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Device or other IDs' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[contains(@class, 'particle-table-row') and @role='row'      and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Approximate location')]] //ess-cell[@essfield='action']//button[@aria-label='Open Approximate location questions'])[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );
                          const isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false);
                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          //*Device or other IDs
          {
            name: "Step 4 'Device or other IDs' group",
            group: {
              condition: (page, appData) => true,
              fields: [
                // {
                //   name: "Step 4 'Device or other IDs' 'Device or other IDs' Hide Expandable",
                //   condition: (page, appData) => {
                //     const element = page.locator(
                //       `//span[text()='Device or other IDs']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`
                //     );
                //     return !!element;
                //   },
                //   action: "click",
                //   fallback: {
                //     xpath: `//span[text()='Personal info']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Hide']]`,
                //   },
                // },
                {
                  name: "Step 4 'Device or other IDs' 'Device or other IDs' Show Expandable",
                  condition: (page, appData) => {
                    const element = page.locator(
                      `//span[text()='Device or other IDs']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`
                    );
                    return !!element;
                  },
                  action: "click",
                  fallback: {
                    xpath: `//span[text()='Device or other IDs']/ancestor::div[contains(@class,'header-line')]//button[.//span[text()='Show']]`,
                  },
                },
                {
                  name: "Step 4 'Device or other IDs' group",
                  group: {
                    condition: (page, appData) => true,
                    fields: [
                      {
                        name: "'Device or other IDs' Edit Button",
                        action: "click",
                        fallback: {
                          xpath: `(//div[contains(@class, 'particle-table-row') and @role='row'      and .//ess-cell[@essfield='dataType']//text-field[contains(normalize-space(.), 'Device or other IDs')]] //ess-cell[@essfield='action']//button[@aria-label='Open Device or other IDs questions'])[1]`,
                        },
                      },
                      {
                        name: "'Collected' Check Box",
                        selector: `material-checkbox[debug-id='collected-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Shared' Check Box",
                        selector: `material-checkbox[debug-id='shared-checkbox'] input[type='checkbox']`,
                        action: "check",
                        default_value: "true",
                      },
                      {
                        name: "'Yes, this collected data is processed ephemerally' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Yes, this collected data is processed ephemerally']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Users can choose whether this data is collected' Radio Button",
                        action: "click",
                        fallback: {
                          xpath: `//material-radio[.//label[text()='Users can choose whether this data is collected']]//input[@type='radio']`,
                        },
                      },
                      {
                        name: "'Account management' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[1]`,
                        },
                      },
                      {
                        name: "'Account management 2' check box",
                        action: "check",
                        default_value: "true",
                        fallback: {
                          xpath: `(//material-checkbox[.//label[text()='Account management']]//input[@type='checkbox'])[2]`,
                        },
                      },
                      {
                        name: "Save Button",
                        action: "click",

                        fallback: {
                          xpath: `//button[.//span[text()='Save']]`,
                        },
                      },
                      {
                        name: "Close Button",
                        action: "click",
                        condition: async (page, appData) => {
                          const element = page.locator(
                            `//button[.//span[text()='Save']]`
                          );
                          const isDisabled = await element
                            .isDisabled({
                              timeout: 1000,
                            })
                            .catch(() => false);
                          return isDisabled;
                        },
                        fallback: {
                          xpath: `(//button[@aria-label='Close'])[2]`,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          //* save button
          {
            name: "Next Button",
            action: "click",
            fallback: {
              xpath: `//button[.//span[text()='Next']]`,
            },
          },
        ],
      },
    },

    //* step 5 "Preivew"
    {
      name: "Step 5 'Preivew' group",
      action: "click",
      fallback: {
        xpath: `//button[.//span[text()='Save']]`,
      },
    },
  ],
};
