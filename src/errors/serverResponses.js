import "server-only";
import { getErrorMessage } from "./i18n";

export const createLocalizedDataErrorResponse = async (code, fallbackData = null, locale) => ({
  data: fallbackData,
  errors: [await getErrorMessage(locale, code)],
});

export const createLocalizedFieldErrorResponse = async (field, code, locale) => ({
  errors: {
    [field]: [await getErrorMessage(locale, code)],
  },
});

export const createLocalizedGeneralErrorResponse = async (code, locale) => {
  return createLocalizedFieldErrorResponse("general", code, locale);
};
