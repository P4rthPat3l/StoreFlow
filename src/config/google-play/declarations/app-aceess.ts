import type { AppData, Page } from "../../../types";

import type { Page as PlaywrightPage } from "playwright";
import { logger } from "../../../utils/logger";

export const appAccessPage: Page = {
  url_template: "/{app_id}/app-content/testing-credentials",
  shouldProcessParallel: true,
  fields: [
    {
      name: "All or some functionality in my app is restricted",
      api_key: "app_access",
      action: "click",
      fallback: {
        xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-testing-credentials-page/console-block-1-column/div/div/console-form/console-form-expandable-section[2]/div/div/material-radio`,
      },
    },
    {
      name: "'All or some functionality in my app is restricted' create if not exists",
      group: {
        condition: async (page: PlaywrightPage, appData: AppData) => {
          const restrictedElement = page.locator(
            `xpath=//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-testing-credentials-page/console-block-1-column/div/div/console-form/console-form-expandable-section[2]/div`
          );
          const hasRestrictedText = await restrictedElement
            .textContent()
            .then((text) => text?.includes("Manage") ?? false);

          logger.debug(
            `Restricted text found for ${appData.app_name}: ${hasRestrictedText}`
          );
          //
          //! TODO : add ! after complete
          return !hasRestrictedText;
        },
        fields: [
          {
            name: "Add instructions",
            action: "click",
            default_value: "",
            selector: 'button[debug-id="add-credential-button"]',
            // fallback: {
            //   xpath: `//*[@id="a0E05EB7C-CCA6-4908-B22A-2B172726DE77--76"]/div/console-button-set`,
            // },
          },
          {
            name: "Instruction name",
            action: "setText",
            default_value: "Login",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/console-form-row[1]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "Username and password",
            action: "setText",
            default_value: "vsjariwala@gmail.com",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/div/console-form-row[1]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "Password",
            action: "setText",
            default_value: "vsjariwala@gmail.com",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/div/console-form-row[2]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "'No other information is required to access my app'",
            action: "click",
            selector:
              'material-checkbox[debug-id="no-additional-details-required-checkbox"]',
          },
          //! uncomment this at the end
          {
            name: "Add Button",
            action: "click",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div/button[1]/material-ripple`,
            },
          },
        ],
      },
    },
    {
      name: "'All or some functionality in my app is restricted' update if exists",
      group: {
        condition: async (page: PlaywrightPage, appData: AppData) => {
          const restrictedElement = page.locator(
            `xpath=//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-testing-credentials-page/console-block-1-column/div/div/console-form/console-form-expandable-section[2]/div`
          );
          const hasRestrictedText = await restrictedElement
            .textContent()
            .then((text) => text?.includes("Manage") ?? false);

          logger.debug(
            `Restricted text found for ${appData.app_name}: ${hasRestrictedText}`
          );
          //
          //! TODO : remove ! after complete
          return hasRestrictedText;
        },
        fields: [
          {
            name: "Manage",
            action: "click",
            default_value: "",
            selector: 'button[debug-id="manage-button"]',
            // fallback: {
            //   xpath: `//*[@id="a0E05EB7C-CCA6-4908-B22A-2B172726DE77--76"]/div/console-button-set`,
            // },
          },
          {
            name: "Instruction name",
            action: "setText",
            default_value: "Login",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/console-form-row[1]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "Username and password",
            action: "setText",
            default_value: "vsjariwala@gmail.com",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/div/console-form-row[1]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "Password",
            action: "setText",
            default_value: "vsjariwala@gmail.com",
            fallback: {
              xpath: `//*[@id="default-acx-overlay-container"]/div[2]/div/focus-trap/div[2]/relative-popup/div/span/div/div[2]/console-block-1-column/div/div/console-form/div/console-form-row[2]/div/div[2]/div[1]/material-input/label/input`,
            },
          },
          {
            name: "'No other information is required to access my app' checkbox",
            action: "check",
            default_value: "true",
            selector:
              'material-checkbox[debug-id="no-additional-details-required-checkbox"] input.mdc-checkbox__native-control',
          },
          //! uncomment this at the end
          //* if button is disable then clikc on close and clikc on add
          {
            name: "Add Button",
            action: "click",
            condition: async (page, appData) => {
              const element = page.locator(`//button[.//span[text()='Add']]`);

              return !element.isDisabled();
            },
            fallback: {
              xpath: `//button[.//span[text()='Add']]`,
            },
          },
          {
            name: "Close Button",
            action: "click",
            condition: async (page, appData) => {
              const element = page.locator(`//button[.//span[text()='Add']]`);

              return element.isDisabled();
            },
            fallback: {
              xpath: `//button[@aria-label='Close']`,
            },
          },
        ],
      },
    },
    {
      name: "Save Button",
      action: "click",
      condition(page, appData) {
        const element = page.locator(`//button[.//span[text()='Save']]`);
        return !element.isDisabled();
      },
      fallback: {
        xpath: `//button[.//span[text()='Save']]`,
      },
    },
  ],
};
