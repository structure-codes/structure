export const githubToTree = (data: any) => {
  const elements: {} = {};
  let prevFile: string = "";
  let prevDepth: number = 0;
  const path: Array<string> = [];

  data.forEach((file, index) => {
    if (file.type === "blob") return;
    const depth = file.path.split("/").length;
    const filename: string = file.path.split("/").pop().concat("/");
    // Pop a certain number of elements from path
    const popCount = depth <= prevDepth ? prevDepth - depth + 1 : 0;
    Array(popCount)
      .fill("pop")
      .forEach(() => path.pop());

    const current: any = path.reduce(
      (branch: { [key: string]: {} }, filename: string) => branch[filename],
      elements
    );

    current[filename] = {};
    prevFile = file.path;
    prevDepth = depth;
    path.push(filename);
  });
  return elements;
};