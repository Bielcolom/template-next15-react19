import { getDictionary } from "@/app/[lang]/dictionaries";
import { DEFAULT_LOCALE } from "@/utils/urls";
import { ERROR_CODES } from "./codes";
import {
  ERROR_MESSAGES,
  ERROR_MESSAGE_KEYS,
  VALIDATION_MESSAGES,
  VALIDATION_MESSAGE_KEYS,
} from "./messages";

const getNestedValue = (object, path) => {
  return path.split(".").reduce((currentValue, pathSegment) => {
    if (!currentValue || typeof currentValue !== "object") {
      return null;
    }

    return currentValue[pathSegment] ?? null;
  }, object);
};

const getCommonDictionary = async (locale = DEFAULT_LOCALE) => {
  const dictionary = await getDictionary(locale, "common");
  if (dictionary) {
    return dictionary;
  }

  return (await getDictionary(DEFAULT_LOCALE, "common")) || {};
};

export const getErrorMessage = async (locale, code) => {
  const dictionary = await getCommonDictionary(locale);
  const dictionaryKey = ERROR_MESSAGE_KEYS[code];
  return (
    (dictionaryKey && getNestedValue(dictionary, dictionaryKey)) ||
    ERROR_MESSAGES[code] ||
    ERROR_MESSAGES[ERROR_CODES.UNEXPECTED_ERROR]
  );
};

export const getValidationMessages = async (locale) => {
  const dictionary = await getCommonDictionary(locale);

  return Object.fromEntries(
    Object.entries(VALIDATION_MESSAGE_KEYS).map(([messageKey, dictionaryPath]) => [
      messageKey,
      getNestedValue(dictionary, dictionaryPath) || VALIDATION_MESSAGES[messageKey],
    ])
  );
};
