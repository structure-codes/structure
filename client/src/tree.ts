// TODO: use these everywhere
export const TRUNK = "│";
export const BRANCH = "├──";
export const LAST_BRANCH = "└──";

export const getBranchPrefix = (depth: number, isLastBranch: boolean) => {
  const base = `${TRUNK}\t`.repeat(depth);
  if (isLastBranch) return base + LAST_BRANCH + " ";
  else return base + BRANCH + " ";
};

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
    Array(popCount).fill("pop").forEach(() => path.pop());

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

export const treeJsonToString = (tree: Object) => {
  let treeString: string = "";
  const parseBranches = (tree: Object, depth: number) => {
    const branches = Object.entries(tree);
    branches.forEach(([key, values], index) => {
      const isLastBranch = index === branches.length - 1;
      const prefix = getBranchPrefix(depth, isLastBranch);
      const branchString = prefix + key + "\n";
      treeString = treeString.concat(branchString);
      parseBranches(values, depth + 1);
    });
  };
  parseBranches(tree, 0);
  treeString = treeString.replace(/\n$/, "");

  return treeString;
};

export const treeJsonToElements = (tree: any) => {
  const elements: any = [];
  const offsetX = 100;
  const offsetY = 50;

  const parseBranches = (tree: Object, parent: string | null, depth: number) => {
    const branches = Object.entries(tree);
    branches.forEach((branch, index) => {
      const [key, values] = branch;
      elements.push({
        id: key,
        type: "customNode",
        data: { label: key },
        position: { x: 250 * index + offsetX, y: 100 * depth + offsetY },
      });
      if (parent) {
        elements.push({
          id: `${parent}-${key}`,
          source: parent,
          target: key,
          animated: false,
        });
      }
      parseBranches(values, key, depth + 1);
    });
  };
  parseBranches(tree, null, 0);

  return elements;
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
