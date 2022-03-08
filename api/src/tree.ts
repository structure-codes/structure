import { TreeType } from "@structure-codes/utils";

export const githubToTree = (data: any): TreeType[] => {
  const elements: TreeType[] = [];
  let current: TreeType[] = elements;
  const path: TreeType[] = [];
  
  let prevDepth: number = 0;

  data.forEach((file, index) => {
    const depth = file.path.split("/").length;
    const filename: string =
      file.type === "blob" ? file.path.split("/").pop() : file.path.split("/").pop().concat("/");
    // Pop a certain number of elements from path
    const popCount = depth <= prevDepth ? prevDepth - depth + 1 : 0;
    Array(popCount)
      .fill("pop")
      .forEach(() => path.pop());

    const node: TreeType = {
      _index: index,
      name: filename,
      children: [],
    };  

    // If we are at root, add root node - else add it to previous parent's children
    current = path.length > 0 ? path[path.length - 1].children : elements;
    current.push(node);
    path.push(node);
    prevDepth = depth;
  });
  return elements;
};
