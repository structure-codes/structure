export const ROOT_PREFIX = "├── ";

// TODO: maybe make this bundle to one output file incase of more shared code
// TODO: fix this shite as the only algo guy is @Alex not @Boult 🤯
export const treeStringToJson = (tree: string) => {
  const elements: any = {};
  tree.split(/\r|\r\n|\n/).forEach((line, index) => {
    const prefix = line.split(" ")[0];
    const content = line.substr(prefix.length);
    elements[content] = {};
  })
  console.log("new elements are: ", elements)
  return elements;
}

export const treeJsonToString = (tree: Object) => {
  let treeString = "";
  const parseBranches = (tree: Object, depth: number) => {
    const branches = Object.entries(tree);
    branches.forEach(branch => {
      const [key, values] = branch;
      if (values.length === 1) return;
      const prefix = depth === 0 ? ROOT_PREFIX : "\t".repeat(depth) + "└── ";
      const branchString = prefix + key + "\n";
      treeString = treeString.concat(branchString);
      parseBranches(values, depth + 1);
    })
  };
  parseBranches(tree, 0);
  treeString = treeString.replace(/\n$/, "");

  return treeString;
}

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
          animated: false 
        });
      }
      parseBranches(values, key, depth + 1);
    });
  };
  parseBranches(tree, null, 0);

  return elements;
};