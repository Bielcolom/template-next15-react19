import { createTranslator } from "use-intl/core";
import { DEFAULT_LOCALE } from "@/utils/urls";
import { loadNamespace, getSafeLocale } from "@/i18n/messages";
import { ERROR_CODES } from "./codes";
import {
  ERROR_MESSAGES,
  ERROR_MESSAGE_KEYS,
  VALIDATION_MESSAGES,
  VALIDATION_MESSAGE_KEYS,
} from "./messages";

const getCommonTranslations = async (locale = DEFAULT_LOCALE) => {
  const safeLocale = getSafeLocale(locale);
  const commonMessages = await loadNamespace(safeLocale, "common");

  return createTranslator({
    locale: safeLocale,
    messages: {
      common: commonMessages || {},
    },
    namespace: "common",
  });
};

export const getErrorMessage = async (locale, code) => {
  const t = await getCommonTranslations(locale);
  const dictionaryKey = ERROR_MESSAGE_KEYS[code];

  return (
    (dictionaryKey && t.has(dictionaryKey) && t(dictionaryKey)) ||
    ERROR_MESSAGES[code] ||
    ERROR_MESSAGES[ERROR_CODES.UNEXPECTED_ERROR]
  );
};

export const getValidationMessages = async (locale) => {
  const t = await getCommonTranslations(locale);

  return Object.fromEntries(
    Object.entries(VALIDATION_MESSAGE_KEYS).map(([messageKey, dictionaryPath]) => [
      messageKey,
      t.has(dictionaryPath) ? t(dictionaryPath) : VALIDATION_MESSAGES[messageKey],
    ])
  );
};
