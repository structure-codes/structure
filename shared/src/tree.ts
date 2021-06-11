export const ROOT_PREFIX = "├── ";

// TODO: maybe make this bundle to one output file incase of more shared code
// TODO: fix this shite as the only algo guy is @Alex not @Boult 🤯
export const treeStringToJson = (tree: string) => {
  const treeNodes = new Map();
  const lines = tree.split("\n");

  for(const [k,v] of Object.entries(lines)) {
    const isFolder = v.endsWith("/");

    if (isFolder) {
      const strippedName = v.replaceAll(/[\t|─|└|├]/ig, "").trim();

      treeNodes.set(strippedName, k);
    }
  }

  console.log(treeNodes);

  return null;
}

export const treeJsonToString = (tree: Object) => {
  let treeString = "";
  const parseBranches = (tree: Object, depth: number) => {
    const branches = Object.entries(tree);
    branches.forEach(branch => {
      const [key, values] = branch;
      const prefix = depth === 0 ? ROOT_PREFIX : "\t".repeat(depth) + "└── ";
      const branchString = prefix + key + "\n";
      treeString = treeString.concat(branchString);
      parseBranches(values, depth + 1);
    })
  };
  parseBranches(tree, 0);

  return treeString;
}