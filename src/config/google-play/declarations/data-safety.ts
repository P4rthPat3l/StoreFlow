import type { Page } from "../../../types";

export const dataSafetyPage: Page = {
  url_template: "/{app_id}/app-content/data-privacy-security",
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
  ],
};
