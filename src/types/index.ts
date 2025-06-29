// src/types/index.ts
export interface AppData {
  app_id: string;
  app_name: string;
  app_description: string;
  collects_user_data: boolean;
  delete_account_url?: string;
  contact_name?: string;
  [key: string]: any;
}

export interface Field {
  api_key: string;
  selector: string;
  action: "setText" | "check" | "uploadFile" | "selectOption";
  default_value?: string;
  conditionals?: Conditional[];
  saved_indicator?: string;
  validation?: RegExp;
  fallback?: FallbackSelector;
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
  selector: string;
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
