import { ERROR_CODES } from "./codes";
import { ERROR_MESSAGES } from "./messages";

const resolveMessage = (code, fallbackMessage) => {
  return fallbackMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNEXPECTED_ERROR];
};

export const createDataResponse = (data) => ({
  data,
  errors: [],
});

export const createDataErrorResponse = (code, fallbackData = null, fallbackMessage) => ({
  data: fallbackData,
  errors: [resolveMessage(code, fallbackMessage)],
});

export const createFieldErrorResponse = (field, code, fallbackMessage) => ({
  errors: {
    [field]: [resolveMessage(code, fallbackMessage)],
  },
});

export const createGeneralErrorResponse = (code, fallbackMessage) => {
  return createFieldErrorResponse("general", code, fallbackMessage);
};
