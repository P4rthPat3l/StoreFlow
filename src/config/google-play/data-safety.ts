import type { Page } from "../../types";

export const dataSafetyPage: Page = {
  url_template: "/app-content/data-privacy-security",
  app_selector: {
    selector: "button.app-selector",
    option_selector: "div.app-option",
    attribute: "data-id",
  },
  fields: [
    {
      api_key: "collects_user_data",
      selector: "input[type='radio'][value='yes']",
      action: "check",
      default_value: "no",
      conditionals: [
        {
          if_checked: "yes",
          fields: [
            {
              api_key: "additional_data_field",
              selector: 'input[name="additional_data"]',
              action: "setText",
            },
          ],
        },
      ],
      saved_indicator: "div.saved-data",
    },
    {
      api_key: "delete_account_url",
      selector: 'div.data-safety input[name="delete_account_url"]',
      action: "setText",
      validation: /^https?:\/\//,
      fallback: {
        xpath:
          '//div[contains(@class, "data-safety")]//input[@name="delete_account_url"]',
        role: 'getByRole("textbox", { name: /account url/i })',
      },
    },
  ],
  modals: [
    {
      trigger_selector: 'button:has-text("Add")',
      check_selector: "div.saved-data",
      fields: [
        {
          api_key: "contact_name",
          selector: 'input[name="modal_contact_name"]',
          action: "setText",
        },
      ],
      save_selector: 'button:has-text("Save")',
    },
  ],
};
