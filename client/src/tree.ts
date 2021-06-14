// TODO: use these everywhere
export const ROOT_PREFIX = "│  ";
export const BRANCH_PREFIX = "├── ";
export const BRANCH_PREFIX_END = "└── ";

export const treeStringToJson = (tree: string) => {
  const elements: any = {};
  let prevLine: string | null = null;
  const path: Array<string> = [];

  // look for line breaks that works on all platforms
  tree.split(/\r|\r\n|\n/).forEach((line, index) => {
    const prevPrefix = prevLine ? prevLine.split(" ")[0] : null;
    const prevNumTabs = prevPrefix ? (prevPrefix.match(/\t/g) || []).length : null;
    const prefix = line.split(" ")[0];
    const numTabs = (prefix.match(/\t/g) || []).length;
    const filename: string = line.substr(prefix.length).trim();
    if (!filename) return;
    // Weird edge case at root
    if (prevNumTabs === 0 && numTabs === 0) path.pop();
    // If less than or equal to previous depth, pop once
    if (prevNumTabs && numTabs <= prevNumTabs) path.pop();
    // If less than previous depth, pop again
    if (prevNumTabs && numTabs < prevNumTabs) path.pop();

    // recusion
    const current: any = path.reduce((obj: [], i: string) => obj[parseInt(i)], elements);
    console.log(current);
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
    for (const [key, values] of branches) {
      if (values && values.length === 1) return;
      const prefix = depth === 0 ? ROOT_PREFIX : "\t".repeat(depth) + BRANCH_PREFIX;
      const branchString = prefix + key + "\n";
      treeString = treeString.concat(branchString);
      parseBranches(values, depth + 1);
    };
  };
  parseBranches(tree, 0);
  treeString = treeString.replace(/\n$/, "");
  console.log("test", treeString)

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
