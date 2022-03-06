import { ISettings } from "./store";

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

export const treeJsonToD3Tree: any = (tree: any) => {
  return Object.entries(tree).map(([key, children]) => {
    const nextChildren = treeJsonToD3Tree(children);
    if (nextChildren.length) {
      return {
        name: key,
        children: treeJsonToD3Tree(children),
      };
    }
    return {
      name: key,
    };
  });
};

export const filterBranches = (tree: any, settings: ISettings) => {
  let branches = Object.entries(tree);
  if (settings.hideDotDirs) {
    branches = branches.filter((branch: any, _index: number) => {
      const [key] = branch;
      // If name starts with a . return false so it is filtered out
      return !key.startsWith(".");
    });
  }
  if (settings.hideFiles) {
    branches = branches.filter((branch: any, _index: number) => {
      const [key] = branch;
      // If name endsWith / return true since it is a directory
      return key.endsWith("/");
    });
  }
  return branches;
};
