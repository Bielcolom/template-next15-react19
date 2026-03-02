import { describe, expect, it, vi } from "vitest";
import { AUTH_ACTIONS, evaluateAuthPolicy } from "./authPolicy";
import {
  BACKOFFICE_URL,
  BACKOFFICE_USERROLES_URL,
  INDEX_URL,
  LOGIN_URL,
} from "@/utils/urls";

describe("evaluateAuthPolicy", () => {
  it("redirects to login for private routes without session", () => {
    const result = evaluateAuthPolicy({
      pathWithoutLocale: BACKOFFICE_URL,
      payload: null,
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.REDIRECT_LOGIN,
      clearCookies: false,
    });
  });

  it("redirects to login for nested private routes without session", () => {
    const result = evaluateAuthPolicy({
      pathWithoutLocale: `${BACKOFFICE_URL}/users/123`,
      payload: null,
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.REDIRECT_LOGIN,
      clearCookies: false,
    });
  });

  it("allows public routes without session", () => {
    const result = evaluateAuthPolicy({
      pathWithoutLocale: INDEX_URL,
      payload: null,
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.ALLOW,
      clearCookies: false,
    });
  });

  it("redirects to home when logged user enters a public route", () => {
    const result = evaluateAuthPolicy({
      pathWithoutLocale: LOGIN_URL,
      payload: {
        expiresAt: "2099-01-01T00:00:00.000Z",
        permissions: ["user_access"],
      },
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.REDIRECT_HOME,
      clearCookies: false,
    });
  });

  it("redirects to login and clears cookies for expired sessions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-27T00:00:00.000Z"));

    const result = evaluateAuthPolicy({
      pathWithoutLocale: BACKOFFICE_URL,
      payload: {
        expiresAt: "2026-02-20T00:00:00.000Z",
        permissions: ["admin_access"],
      },
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.REDIRECT_LOGIN,
      clearCookies: true,
    });

    vi.useRealTimers();
  });

  it("allows protected routes for any valid authenticated session", () => {
    const result = evaluateAuthPolicy({
      pathWithoutLocale: BACKOFFICE_URL,
      payload: {
        expiresAt: "2099-01-01T00:00:00.000Z",
        permissions: ["user_access"],
      },
    });

    expect(result).toEqual({
      action: AUTH_ACTIONS.ALLOW,
      clearCookies: false,
    });
  });
});
