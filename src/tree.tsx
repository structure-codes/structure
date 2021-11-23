import { ISettings } from "./store";
import { TreeNode } from "react-organizational-chart";

export const TRUNK = "│";
export const BRANCH = "├──";
export const LAST_BRANCH = "└──";

export const treeStringToJson = (tree: string) => {
  const elements: {} = {};
  let prevLine: string = "";
  const path: Array<string> = [];

  // look for line breaks that works on all platforms
  tree.split(/\r|\r\n|\n/).forEach((line, index) => {
    const prevPrefix = prevLine.split(" ")[0];
    const prevNumTabs = getNumberOfTabs(prevPrefix);
    const prefix = line.split(" ")[0];
    const numTabs = getNumberOfTabs(prefix);
    const filename: string = line.substr(prefix.length).trim();
    // Pop a certain number of elements from path
    const popCount = numTabs <= prevNumTabs ? prevNumTabs - numTabs + 1 : 0;
    Array(popCount)
      .fill("pop")
      .forEach(() => path.pop());

    /* 
      EXAMPLE OF REDUCER FUNCTION
        For each element in path, return elements[pathItem]
        The result is the branch in elements for the current path
        path = [ "src/", "Home/"]
        elements = { 
          "src/": { 
            "Home/": {} 
          }
        }
        iter1 = elements["src/"]
        iter2 = elements["src/"]["Home/"]
        curr = {}
    */
    const current: any = path.reduce(
      (branch: { [key: string]: {} }, filename: string) => branch[filename],
      elements
    );

    current[filename] = {};
    prevLine = line;
    path.push(filename);
  });
  return elements;
};

export const getBranchPrefixAccurate = (depth: boolean[], isLastBranch: boolean) => {
  let base = "";
  depth.forEach(isLastBranch => (base = base.concat(isLastBranch ? "\t" : `${TRUNK}\t`)));
  if (isLastBranch) return base + LAST_BRANCH + " ";
  else return base + BRANCH + " ";
};

export const treeJsonToString = (tree: Object, settings: ISettings) => {
  let treeString: string = "";
  const parseBranches = (tree: any, depth: boolean[]) => {
    const branches = filterBranches(tree, settings);
    branches.forEach(([key, values], index) => {
      const isLastBranch = index === branches.length - 1;
      const prefix = getBranchPrefixAccurate(depth, isLastBranch);
      const branchString = prefix + key + "\n";
      treeString = treeString.concat(branchString);
      parseBranches(values, [...depth, isLastBranch]);
    });
  };
  parseBranches(tree, []);
  treeString = treeString.replace(/\n$/, "");

  return treeString;
};

const Leaf = ({ label }: { label: string }) => {
  return ( 
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        display: "flex",
        border: "1px solid #fff",
        borderRadius: 4,
        padding: 8,
        backgroundColor: "#4f3e5c"
      }}>{label}</div>
    </div>
  );
};

export const treeJsonToNodes = (tree: any, depth: number, settings: ISettings) => {
  if (depth > settings.depth) return;
  const branches = filterBranches(tree, settings);
  return branches.map(([key, children]) => {
    return <TreeNode key={key} label={<Leaf label={key} />}>{treeJsonToNodes(children, depth + 1, settings)}</TreeNode>;
  });
}

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
}

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
