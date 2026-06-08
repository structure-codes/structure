import { describe, it, expect } from "vitest";
import {
  TRUNK,
  BRANCH,
  LAST_BRANCH,
  getBranchPrefixAccurate,
  getNumberOfTabs,
  getNumberOfLeadingTabs,
  trimTreeLine,
} from "../treeHelper";

describe("getBranchPrefixAccurate", () => {
  it("emits a top-level branch / last-branch glyph", () => {
    expect(getBranchPrefixAccurate([], false)).toBe(`${BRANCH} `);
    expect(getBranchPrefixAccurate([], true)).toBe(`${LAST_BRANCH} `);
  });

  it("uses a tab for an ancestor that is itself a last child, and a trunk otherwise", () => {
    expect(getBranchPrefixAccurate([true], false)).toBe(`\t${BRANCH} `);
    expect(getBranchPrefixAccurate([false], false)).toBe(`${TRUNK}\t${BRANCH} `);
  });

  it("composes multiple ancestor levels", () => {
    expect(getBranchPrefixAccurate([false, true], true)).toBe(`${TRUNK}\t\t${LAST_BRANCH} `);
  });
});

describe("getNumberOfTabs", () => {
  it("counts every tab in the string", () => {
    expect(getNumberOfTabs("\t\tx\t")).toBe(3);
    expect(getNumberOfTabs("no tabs")).toBe(0);
  });
});

describe("getNumberOfLeadingTabs", () => {
  it("counts tabs only within the leading whitespace run", () => {
    expect(getNumberOfLeadingTabs("\t\t hi\tthere")).toBe(2);
    expect(getNumberOfLeadingTabs("  spaces only")).toBe(0);
    expect(getNumberOfLeadingTabs("nodent")).toBe(0);
  });
});

describe("trimTreeLine", () => {
  it("preserves leading tab indentation but trims surrounding whitespace", () => {
    expect(trimTreeLine("\t\t  hello  ")).toBe("\t\thello");
    expect(trimTreeLine("plain")).toBe("plain");
  });
});
