import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "./codes";

const mocks = vi.hoisted(() => ({
  getErrorMessage: vi.fn(),
}));

vi.mock("@/errors/i18n", () => ({
  getErrorMessage: mocks.getErrorMessage,
}));

import {
  createLocalizedDataErrorResponse,
  createLocalizedFieldErrorResponse,
  createLocalizedGeneralErrorResponse,
} from "./serverResponses";

describe("createLocalizedDataErrorResponse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns data with a localized error message", async () => {
    mocks.getErrorMessage.mockResolvedValueOnce("Unexpected error");
    const result = await createLocalizedDataErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, null, "en");
    expect(result).toEqual({ data: null, errors: ["Unexpected error"] });
    expect(mocks.getErrorMessage).toHaveBeenCalledWith("en", ERROR_CODES.UNEXPECTED_ERROR);
  });

  it("preserves fallback data", async () => {
    mocks.getErrorMessage.mockResolvedValueOnce("Error");
    const result = await createLocalizedDataErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, [], "en");
    expect(result.data).toEqual([]);
  });
});

describe("createLocalizedFieldErrorResponse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error nested under the given field", async () => {
    mocks.getErrorMessage.mockResolvedValueOnce("Email taken");
    const result = await createLocalizedFieldErrorResponse("email", ERROR_CODES.EMAIL_ALREADY_REGISTERED, "en");
    expect(result).toEqual({ errors: { email: ["Email taken"] } });
  });

  it("works for arbitrary field names", async () => {
    mocks.getErrorMessage.mockResolvedValueOnce("Not allowed");
    const result = await createLocalizedFieldErrorResponse("general", ERROR_CODES.UNAUTHORIZED, "es");
    expect(result).toEqual({ errors: { general: ["Not allowed"] } });
    expect(mocks.getErrorMessage).toHaveBeenCalledWith("es", ERROR_CODES.UNAUTHORIZED);
  });
});

describe("createLocalizedGeneralErrorResponse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error under the general field", async () => {
    mocks.getErrorMessage.mockResolvedValueOnce("Something went wrong");
    const result = await createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, "en");
    expect(result).toEqual({ errors: { general: ["Something went wrong"] } });
  });
});
