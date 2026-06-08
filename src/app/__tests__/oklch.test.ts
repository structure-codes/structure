import { describe, it, expect } from "vitest";
import { oklchToHex } from "../oklch";

describe("oklchToHex", () => {
  it("maps the achromatic extremes to black and white", () => {
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
  });

  it("converts a known token color", () => {
    expect(oklchToHex("oklch(0.90 0.045 95)")).toBe("#e7debd");
  });

  it("always returns a 6-digit lowercase hex (out-of-gamut values clamp)", () => {
    expect(oklchToHex("oklch(0.628 0.2577 29)")).toMatch(/^#[0-9a-f]{6}$/);
    expect(oklchToHex("oklch(2 1 200)")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("tolerates extra internal whitespace", () => {
    expect(oklchToHex("oklch(  1   0   0  )")).toBe("#ffffff");
  });

  it("throws on an unparseable color string", () => {
    expect(() => oklchToHex("rgb(1, 2, 3)")).toThrow(/Unparseable/);
    expect(() => oklchToHex("#fff")).toThrow();
  });
});
