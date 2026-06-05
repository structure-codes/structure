export const TRUNK = "│";
export const BRANCH = "├──";
export const LAST_BRANCH = "└──";

export const getBranchPrefixAccurate = (depth: boolean[], isLastBranch: boolean) => {
  let base = "";
  depth.forEach(isLastBranch => (base = base.concat(isLastBranch ? "\t" : `${TRUNK}\t`)));
  if (isLastBranch) return base + LAST_BRANCH + " ";
  else return base + BRANCH + " ";
};

export const getNumberOfTabs = (line: string) => {
  return (line.match(/\t/g) || []).length;
};

export const getNumberOfLeadingTabs = (line: string): number => {
  // Get the leading part of the line which may contain tabs
  const leadingWhitespace = line.match(/^\s*/g);
  // If no leading tabs, return 0
  if (!leadingWhitespace) return 0;
  return getNumberOfTabs(leadingWhitespace[0]);
};

export const trimTreeLine = (str: string): string => {
  const numTabs = getNumberOfLeadingTabs(str);
  return "\t".repeat(numTabs) + str.trim();
};