import type { Page } from "../../../types";

export const appInformation: Page = {
  url_template: "/{app_id}/distribution/info",
  fields: [
    {
      name: "App Name",
      action: "setText",
      api_key: "app_name",
      fallback: {
        xpath: `//input[@id='name' and @name='localizations[0].name']`,
      },
    },
    {
      name: "Primary Category",
      group: {
        condition: () => true,
        fields: [
          {
            name: "Primary Category",
            action: "selectOption",
            default_value: "FOOD_AND_DRINK",
            fallback: {
              xpath: `//select[@name='primaryCategory']`,
            },
          },
          {
            name: "Secondary Category",
            action: "selectOption",
            default_value: "DEVELOPER_TOOLS",
            fallback: {
              xpath: `//select[@name='secondaryCategory']`,
            },
          },
        ],
      },
    },
  ],
};
