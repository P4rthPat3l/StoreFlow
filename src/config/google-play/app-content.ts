import type { Page } from "../../types";

export const appContentPage: Page = {
  url_template: "/store-presence/app-content",
  fields: [
    {
      api_key: "app_name",
      selector: 'input[name="app_name"]',
      action: "setText",
      validation: /^.{1,50}$/,
    },
    {
      api_key: "app_description",
      selector: 'textarea[name="app_description"]',
      action: "setText",
      validation: /^.{1,4000}$/,
    },
  ],
};
