import type { Page as PlaywrightPage } from "playwright";
// src/types/index.ts
export interface AppData {
  id: number;
  app_details: AppDetails;
  name: string;
  websiteUrl: string;
  subDomain: string;
  app_name: string;
  app_id: string;
  app_icon_url: string;
  app_splash_screen_url: string;
  keystore_file_url: string;
  privacy_policy_url: string;
  terms_and_condition_url: string;
}
interface AppDetails {
  app_icon: string;
  beta_type: string;
  countries: string[];
  beta_testers: string[];
  contact_name: string;
  country_code: string;
  contact_email: string;
  contact_number: string;
  app_splash_screen: string;
  app_full_description: string;
  app_short_description: string;
  appName?: string;
  app_type?: string;
}

export interface Field {
  name?: string;
  api_key?: string;
  selector?: string;
  action?: "setText" | "check" | "uploadFile" | "selectOption" | "click";
  default_value?: string;
  conditionals?: Conditional[];
  saved_indicator?: string;
  validation?: RegExp;
  fallback?: FallbackSelector;
  valueProcessor?: (appData: AppData, field: Field) => any;

  // Group and condition support
  group?: GroupField;
  condition?: (
    page: PlaywrightPage,
    appData: AppData
  ) => boolean | Promise<boolean>;

  // File upload specific properties
  dimensions?: string; // "1024x768" format for image resizing
  accept_types?: string[]; // ['image/png', 'image/jpeg']
  max_file_size?: number; // in bytes
  multiple?: boolean; // allow multiple file uploads
  required_files?: number; // minimum number of files required
}

export interface GroupField {
  condition: (
    page: PlaywrightPage,
    appData: AppData
  ) => boolean | Promise<boolean>;
  fields: Field[];
}

export interface Conditional {
  if_checked: string;
  fields: Field[];
}

export interface FallbackSelector {
  xpath?: string;
  role?: string;
}

export interface Modal {
  trigger_selector: string;
  check_selector?: string;
  fields: Field[];
  save_selector: string;
}

export interface AppSelector {
  selector?: string;
  option_selector: string;
  attribute: string;
}

export interface Page {
  url_template: string;
  app_selector?: AppSelector;
  fields: Field[];
  modals?: Modal[];
}

export interface Platform {
  base_url: string;
  app_mappings: Record<string, string>;
  pages: Record<string, Page>;
}

export interface Config {
  platforms: Record<string, Platform>;
  selected_apps?: string[];
  settings: {
    dry_run: boolean;
    max_retries: number;
    timeout: number;

    max_concurrent_apps: number;
    max_concurrent_pages: number;
    enable_parallel_processing: boolean;
    browser_pool_size: number;
  };
}

export interface ProcessingResult {
  app_id: string;
  platform: string;
  page: string;
  success: boolean;
  errors: string[];
  processed_fields: string[];
}

// Project Structure:
// src/
// ├── types/
// │   └── index.ts
// ├── config/
// │   ├── index.ts
// │   ├── google-play/
// │   │   ├── index.ts
// │   │   ├── data-safety.ts
// │   │   └── app-content.ts
// │   └── app-store/
// │       ├── index.ts
// │       └── app-information.ts
// ├── core/
// │   ├── browser.ts
// │   ├── element-handler.ts
// │   ├── form-processor.ts
// │   └── app-processor.ts
// ├── utils/
// │   ├── logger.ts
// │   ├── retry.ts
// │   └── validation.ts
// ├── services/
// │   └── api.ts
// └── main.ts
