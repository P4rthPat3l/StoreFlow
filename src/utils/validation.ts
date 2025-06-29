import type { Field, AppData } from "../types";

export const validateField = (field: Field, value: any): boolean => {
  if (!field.validation) return true;
  if (typeof value !== "string") return false;
  return field.validation.test(value);
};

export const validateAppData = (
  appData: AppData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!appData.app_id) {
    errors.push("app_id is required");
  }

  if (!appData.app_name) {
    errors.push("app_name is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeValue = (value: any): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") return value.toString();
  return "";
};
