import type { Page } from "../../../types";

export const healthAppsPage: Page = {
  url_template: "/{app_id}/app-content/health",
  fields: [
    {
      name: "'My app does not have any health features' Check Box",
      action: "check",
      default_value: "true",
      fallback: {
        xpath: `//material-checkbox[.//span[text()='My app does not have any health features']]//input[@type='checkbox']`,
      },
    },
  ],
};
