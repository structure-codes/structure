import { describe, it, expect } from "vitest";
import { depthColor, accentHueFor, ACCENTS, DEFAULT_ACCENT_HUE } from "../depthColor";

describe("depthColor", () => {
  it("returns the constant root cream for depth <= 0", () => {
    expect(depthColor(0)).toBe("oklch(0.90 0.045 95)");
    expect(depthColor(-5)).toBe("oklch(0.90 0.045 95)");
  });

  it("walks the hue ramp and lightens with depth", () => {
    expect(depthColor(1)).toBe("oklch(0.680 0.145 250)"); // 285 - 35
    expect(depthColor(2)).toBe("oklch(0.700 0.145 200)"); // 285 - 85
    expect(depthColor(3)).toBe("oklch(0.720 0.145 150)"); // 285 - 135
  });

  it("clamps the ramp index and lightness at deep levels", () => {
    expect(depthColor(7)).toBe(depthColor(6)); // RAMP index saturates
    expect(depthColor(99)).toBe("oklch(0.780 0.145 50)"); // L clamped to 0.78
  });

  it("rotates the ramp around a supplied accent hue", () => {
    expect(depthColor(2, 185)).toBe("oklch(0.700 0.145 100)"); // 185 - 85
  });

  it("wraps negative hues into [0, 360)", () => {
    expect(depthColor(1, 10)).toBe("oklch(0.680 0.145 335)"); // (10 - 35) -> 335
  });
});

describe("accentHueFor", () => {
  it("resolves a known accent hex to its ramp hue", () => {
    expect(accentHueFor(ACCENTS[1].hex)).toBe(ACCENTS[1].hue);
  });

  it("falls back to the default accent for an unknown hex", () => {
    expect(accentHueFor("#abcdef")).toBe(DEFAULT_ACCENT_HUE);
    expect(DEFAULT_ACCENT_HUE).toBe(ACCENTS[0].hue);
  });
});
