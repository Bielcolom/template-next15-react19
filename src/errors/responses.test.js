import { describe, expect, it } from "vitest";
import { createDataResponse } from "./responses";

describe("createDataResponse", () => {
  it("wraps data with an empty errors array", () => {
    expect(createDataResponse(42)).toEqual({ data: 42, errors: [] });
  });

  it("handles null data", () => {
    expect(createDataResponse(null)).toEqual({ data: null, errors: [] });
  });

  it("handles array data", () => {
    expect(createDataResponse([1, 2])).toEqual({ data: [1, 2], errors: [] });
  });

  it("handles object data", () => {
    expect(createDataResponse({ id: 1 })).toEqual({ data: { id: 1 }, errors: [] });
  });
});
