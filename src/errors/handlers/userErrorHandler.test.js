import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "@/errors/codes";

const mocks = vi.hoisted(() => ({
  createLocalizedDataErrorResponse: vi.fn(),
  createLocalizedFieldErrorResponse: vi.fn(),
  createLocalizedGeneralErrorResponse: vi.fn(),
}));

vi.mock("@/errors/serverResponses", () => ({
  createLocalizedDataErrorResponse: mocks.createLocalizedDataErrorResponse,
  createLocalizedFieldErrorResponse: mocks.createLocalizedFieldErrorResponse,
  createLocalizedGeneralErrorResponse: mocks.createLocalizedGeneralErrorResponse,
}));

import {
  handleLoginUserError,
  handleRegisterUserError,
  handleUsersDataError,
} from "./userErrorHandler";

describe("handleRegisterUserError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps DEFAULT_USER_ROLE_NOT_CONFIGURED to email field error", async () => {
    await handleRegisterUserError({ error: { code: ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED }, locale: "en" });
    expect(mocks.createLocalizedFieldErrorResponse).toHaveBeenCalledWith(
      "email", ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED, "en"
    );
  });

  it("maps EMAIL_ALREADY_REGISTERED to email field error", async () => {
    await handleRegisterUserError({ error: { code: ERROR_CODES.EMAIL_ALREADY_REGISTERED }, locale: "en" });
    expect(mocks.createLocalizedFieldErrorResponse).toHaveBeenCalledWith(
      "email", ERROR_CODES.EMAIL_ALREADY_REGISTERED, "en"
    );
  });

  it("falls back to REGISTRATION_FAILED for unknown errors", async () => {
    await handleRegisterUserError({ error: new Error("boom"), locale: "en" });
    expect(mocks.createLocalizedFieldErrorResponse).toHaveBeenCalledWith(
      "email", ERROR_CODES.REGISTRATION_FAILED, "en"
    );
  });

  it("passes locale correctly", async () => {
    await handleRegisterUserError({ error: new Error("boom"), locale: "es" });
    expect(mocks.createLocalizedFieldErrorResponse).toHaveBeenCalledWith(
      "email", ERROR_CODES.REGISTRATION_FAILED, "es"
    );
  });
});

describe("handleLoginUserError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps INVALID_CREDENTIALS to email field error", async () => {
    await handleLoginUserError({ error: { code: ERROR_CODES.INVALID_CREDENTIALS }, locale: "en" });
    expect(mocks.createLocalizedFieldErrorResponse).toHaveBeenCalledWith(
      "email", ERROR_CODES.INVALID_CREDENTIALS, "en"
    );
  });

  it("falls back to UNEXPECTED_ERROR general response for unknown errors", async () => {
    await handleLoginUserError({ error: new Error("boom"), locale: "en" });
    expect(mocks.createLocalizedGeneralErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.UNEXPECTED_ERROR, "en"
    );
  });
});

describe("handleUsersDataError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps USER_NOT_FOUND to data error", async () => {
    await handleUsersDataError({ error: { code: ERROR_CODES.USER_NOT_FOUND }, locale: "en", fallbackCode: ERROR_CODES.FETCH_USER_FAILED });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.USER_NOT_FOUND, null, "en"
    );
  });

  it("maps UNAUTHORIZED to data error", async () => {
    await handleUsersDataError({ error: { code: ERROR_CODES.UNAUTHORIZED }, locale: "en", fallbackCode: ERROR_CODES.FETCH_USER_FAILED });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.UNAUTHORIZED, null, "en"
    );
  });

  it("maps FORBIDDEN to data error", async () => {
    await handleUsersDataError({ error: { code: ERROR_CODES.FORBIDDEN }, locale: "en", fallbackCode: ERROR_CODES.FETCH_USER_FAILED });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.FORBIDDEN, null, "en"
    );
  });

  it("uses fallbackCode for unknown errors", async () => {
    await handleUsersDataError({ error: new Error("boom"), locale: "en", fallbackCode: ERROR_CODES.COUNT_USERS_FAILED, fallbackData: 0 });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.COUNT_USERS_FAILED, 0, "en"
    );
  });

  it("defaults fallbackData to null", async () => {
    await handleUsersDataError({ error: new Error("boom"), locale: "en", fallbackCode: ERROR_CODES.FETCH_USER_FAILED });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.FETCH_USER_FAILED, null, "en"
    );
  });
});
