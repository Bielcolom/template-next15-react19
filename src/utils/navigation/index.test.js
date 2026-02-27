import { describe, expect, it } from "vitest";
import { buildLocalizedNavigation } from "./index";

describe("buildLocalizedNavigation", () => {
  it("extracts locale and canonical pathname", () => {
    const result = buildLocalizedNavigation("/en/backoffice");
    expect(result.locale).toBe("en");
    expect(result.pathnameWithoutLocale).toBe("/backoffice");
  });

  it("falls back to default locale when pathname has no locale", () => {
    const result = buildLocalizedNavigation("/about");
    expect(result.locale).toBe("es");
    expect(result.pathnameWithoutLocale).toBe("/about");
  });

  it("localizes canonical paths", () => {
    const result = buildLocalizedNavigation("/en/backoffice");
    expect(result.localizePath("/login")).toBe("/en/login");
    expect(result.localizePath("/")).toBe("/en");
  });

  it("builds switch-locale path preserving canonical route", () => {
    const result = buildLocalizedNavigation("/en/products/1");
    expect(result.switchLocalePath("es")).toBe("/es/products/1");
  });
});
