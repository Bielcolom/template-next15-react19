import { ERROR_CODES } from "./codes";

export const ERROR_MESSAGES = {
  [ERROR_CODES.CONFIG_MISSING_MONGODB_URI]: "Please define the MONGODB_URI environment variable inside .env.local",
  [ERROR_CODES.CONFIG_INVALID_SESSION_SECRET]: "SESSION_SECRET must be defined and at least 32 characters long.",
  [ERROR_CODES.UNAUTHORIZED]: "Authentication required.",
  [ERROR_CODES.FORBIDDEN]: "Insufficient permissions.",
  [ERROR_CODES.INVALID_SESSION]: "Invalid or expired session.",
  [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",
  [ERROR_CODES.SESSION_CREATION_FAILED]: "Failed to create session. Please try again.",
  [ERROR_CODES.EMAIL_ALREADY_REGISTERED]: "Email is already registered",
  [ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED]: "Default user role is not configured.",
  [ERROR_CODES.USER_NOT_FOUND]: "User not found.",
  [ERROR_CODES.USER_ROLE_NOT_FOUND]: "User role not found.",
  [ERROR_CODES.FETCH_USER_ROLES_FAILED]: "An error occurred while fetching user roles.",
  [ERROR_CODES.FETCH_USER_ROLE_FAILED]: "An error occurred while fetching the user role.",
  [ERROR_CODES.FETCH_USER_FAILED]: "An error occurred while fetching the user.",
  [ERROR_CODES.COUNT_USERS_FAILED]: "An error occurred while counting users.",
  [ERROR_CODES.UNEXPECTED_ERROR]: "An unexpected error occurred. Please try again.",
  [ERROR_CODES.REGISTRATION_FAILED]: "An error occurred. Please try again later.",
  [ERROR_CODES.INVALID_USER_ROLE_DATA]: "Invalid user role data. Name and at least one permission are required.",
  [ERROR_CODES.USER_ROLE_ALREADY_EXISTS]: "A user role with this name already exists.",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "Too many attempts. Please try again later.",
};

export const ERROR_MESSAGE_KEYS = {
  [ERROR_CODES.UNAUTHORIZED]: "errors.authenticationRequired",
  [ERROR_CODES.FORBIDDEN]: "errors.insufficientPermissions",
  [ERROR_CODES.INVALID_SESSION]: "errors.invalidSession",
  [ERROR_CODES.INVALID_CREDENTIALS]: "errors.invalidCredentials",
  [ERROR_CODES.SESSION_CREATION_FAILED]: "errors.sessionCreationFailed",
  [ERROR_CODES.EMAIL_ALREADY_REGISTERED]: "errors.emailAlreadyRegistered",
  [ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED]: "errors.defaultUserRoleNotConfigured",
  [ERROR_CODES.USER_NOT_FOUND]: "errors.userNotFound",
  [ERROR_CODES.USER_ROLE_NOT_FOUND]: "errors.userRoleNotFound",
  [ERROR_CODES.FETCH_USER_ROLES_FAILED]: "errors.fetchUserRolesFailed",
  [ERROR_CODES.FETCH_USER_ROLE_FAILED]: "errors.fetchUserRoleFailed",
  [ERROR_CODES.FETCH_USER_FAILED]: "errors.fetchUserFailed",
  [ERROR_CODES.COUNT_USERS_FAILED]: "errors.countUsersFailed",
  [ERROR_CODES.UNEXPECTED_ERROR]: "errors.unexpected",
  [ERROR_CODES.REGISTRATION_FAILED]: "errors.registrationFailed",
  [ERROR_CODES.INVALID_USER_ROLE_DATA]: "errors.invalidUserRoleData",
  [ERROR_CODES.USER_ROLE_ALREADY_EXISTS]: "errors.userRoleAlreadyExists",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "errors.rateLimitExceeded",
};

export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: "Invalid email address",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORD_CONFIRM_MIN_LENGTH: "Password confirmation must be at least 8 characters",
  PASSWORDS_DO_NOT_MATCH: "Passwords don't match",
  NAME_MIN_LENGTH: "Name must be at least 3 characters",
};

export const VALIDATION_MESSAGE_KEYS = {
  INVALID_EMAIL: "validation.invalidEmail",
  PASSWORD_MIN_LENGTH: "validation.passwordMinLength",
  PASSWORD_CONFIRM_MIN_LENGTH: "validation.passwordConfirmMinLength",
  PASSWORDS_DO_NOT_MATCH: "validation.passwordsDoNotMatch",
  NAME_MIN_LENGTH: "validation.nameMinLength",
};
