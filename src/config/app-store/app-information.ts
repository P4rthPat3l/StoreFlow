import type { Page } from "../../types";

export const appInformationPage: Page = {
  url_template: "/apps/{app_id}/app_information",
  fields: [
    {
      api_key: "app_name",
      selector: 'input[name="app_name"]',
      action: "setText",
      validation: /^.{1,30}$/,
    },
    {
      api_key: "app_description",
      selector: 'textarea[name="app_description"]',
      action: "setText",
      validation: /^.{1,4000}$/,
    },
    {
      api_key: "privacy_policy_url",
      selector: 'input[name="privacy_policy_url"]',
      action: "setText",
      validation: /^https?:\/\//,
    },
  ],
};
