import { describe, expect, it } from "vitest";
import { buildLocalizedNavigation } from "./index";
import { ABOUT_URL, BACKOFFICE_URL, LOGIN_URL, PRODUCTS_URL } from "../urls";

describe("buildLocalizedNavigation", () => {
  it("extracts locale and canonical pathname", () => {
    const result = buildLocalizedNavigation(`/en${BACKOFFICE_URL}`);
    expect(result.locale).toBe("en");
    expect(result.pathnameWithoutLocale).toBe(BACKOFFICE_URL);
  });

  it("falls back to default locale when pathname has no locale", () => {
    const result = buildLocalizedNavigation(ABOUT_URL);
    expect(result.locale).toBe("es");
    expect(result.pathnameWithoutLocale).toBe(ABOUT_URL);
  });

  it("localizes canonical paths", () => {
    const result = buildLocalizedNavigation(`/en${BACKOFFICE_URL}`);
    expect(result.localizePath(LOGIN_URL)).toBe(`/en${LOGIN_URL}`);
    expect(result.localizePath("/")).toBe("/en");
  });

  it("builds switch-locale path preserving canonical route", () => {
    const result = buildLocalizedNavigation(`/en${PRODUCTS_URL}/1`);
    expect(result.switchLocalePath("es")).toBe(`/es${PRODUCTS_URL}/1`);
  });
});
