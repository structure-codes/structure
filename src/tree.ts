import { nanoid } from "nanoid";

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

export const getBranchPrefix = (depth: number, isLastBranch: boolean) => {
  const base = `${TRUNK}\t`.repeat(depth);
  if (isLastBranch) return base + LAST_BRANCH + " ";
  else return base + BRANCH + " ";
};

export const getBranchPrefixAccurate = (depth: boolean[], isLastBranch: boolean) => {
  let base = "";
  depth.forEach(isLastBranch => base = base.concat(isLastBranch ? "\t" : `${TRUNK}\t`));
  if (isLastBranch) return base + LAST_BRANCH + " ";
  else return base + BRANCH + " ";
};

export const treeJsonToString = (tree: Object) => {
  let treeString: string = "";
  const parseBranches = (tree: Object, depth: boolean[]) => {
    const branches = Object.entries(tree);
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

export const treeJsonToElements = (tree: any) => {
  const elements: any = [];
  
  const getPosition = ({ index, depth, numChildren, parent } : any) => {
    const offsetX = 0;
    const offsetY = 50;
    const childrenMultiplier = numChildren > 1 ? (numChildren + 1) / 2 : 1;
    const parentOffset = parent 
      ? parent.position.x + (index - (parent.numChildren - 1) / 2) * 200
      : 0;
    return { 
      x: 200 * (index) * childrenMultiplier + offsetX + parentOffset, 
      y: 100 * depth + offsetY 
    }
  }

  const parseBranches = (tree: Object, parent: { id: string, position: {x: number, y: number}, numChildren: number} | null, depth: number) => {
    const branches = Object.entries(tree);
    branches.forEach((branch, index) => {
      const [key, children] = branch;
      const numChildren = Object.values(children).length;
      const id = `${key}-${nanoid()}`
      const position = getPosition({ index, depth, numChildren, parent});
      elements.push({
        id,
        type: "customNode",
        data: { label: `${key} x: ${position.x} y: ${position.y}` },
        position,
      });
      // Add connector edge
      if (parent) {
        elements.push({
          id: `${parent.id}-${id}`,
          source: parent.id,
          target: id,
          animated: false,
        });
      }
      parseBranches(children, { id, position, numChildren }, depth + 1);
    });
  };
  const numRootChildren = Object.entries(tree).length;
  const root = { id: "root", position: { x: 0, y: 0}, numChildren: numRootChildren}
  elements.push({
    id: root.id,
    type: "customNode",
    data: { label: `${root.id} x: ${root.position.x} y: ${root.position.y}` },
    position: root.position,
  });
  parseBranches(tree, root, 1);

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
