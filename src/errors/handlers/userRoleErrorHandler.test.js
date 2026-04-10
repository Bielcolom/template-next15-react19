import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "@/errors/codes";

const mocks = vi.hoisted(() => ({
  createLocalizedDataErrorResponse: vi.fn(),
}));

vi.mock("@/errors/serverResponses", () => ({
  createLocalizedDataErrorResponse: mocks.createLocalizedDataErrorResponse,
}));

import { handleUserRolesDataError } from "./userRoleErrorHandler";

describe("handleUserRolesDataError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps UNAUTHORIZED to data error", async () => {
    await handleUserRolesDataError({ error: { code: ERROR_CODES.UNAUTHORIZED }, locale: "en" });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.UNAUTHORIZED, null, "en"
    );
  });

  it("maps FORBIDDEN to data error", async () => {
    await handleUserRolesDataError({ error: { code: ERROR_CODES.FORBIDDEN }, locale: "en" });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.FORBIDDEN, null, "en"
    );
  });

  it("defaults to FETCH_USER_ROLE_FAILED for unknown errors", async () => {
    await handleUserRolesDataError({ error: new Error("boom"), locale: "en" });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.FETCH_USER_ROLE_FAILED, null, "en"
    );
  });

  it("uses provided fallbackCode for unknown errors", async () => {
    await handleUserRolesDataError({
      error: new Error("boom"),
      locale: "en",
      fallbackCode: ERROR_CODES.FETCH_USER_ROLES_FAILED,
      fallbackData: [],
    });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.FETCH_USER_ROLES_FAILED, [], "en"
    );
  });

  it("passes locale correctly", async () => {
    await handleUserRolesDataError({ error: { code: ERROR_CODES.UNAUTHORIZED }, locale: "es" });
    expect(mocks.createLocalizedDataErrorResponse).toHaveBeenCalledWith(
      ERROR_CODES.UNAUTHORIZED, null, "es"
    );
  });
});
