import type { Page } from "../../../types";
export const privacyPolicyPage: Page = {
  url_template: "/{app_id}/app-content/privacy-policy",
  fields: [
    {
      name: "Privacy Policy URL",
      action: "setText",
      api_key: "privacy_policy_url",
      fallback: {
        xpath: `//material-input[@debug-id='privacy-policy-url-input']//input[@type='text']`,
      },
    },
    // {
    //   name: "Save Button",
    //   action: "click",
    //   fallback: {
    //     xpath: `//*[@id="main-content"]/div[1]/div/div[1]/page-router-outlet/page-wrapper/div/app-content-privacy-policy-page/div/publishing-bottom-bar/form-bottom-bar/bottom-bar-base/div/div/div/div[2]/console-button-set/div[2]/overflowable-item[2]/button/div[2]`,
    //   },
    // },
  ],
};
