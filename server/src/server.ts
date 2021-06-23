import express from "express";
import got from "got";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser());

const githubToTree = (data: any) => {
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
    Array(popCount).fill("pop").forEach(() => path.pop());

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

app.post("/api/github", async (req, res) => {
  const { url } = req.body;
  console.log("Wassup in the : ", url)
  const data: any = await got(`https://api.github.com/repos/${url}/git/trees/main?recursive=1`).json();
  const tree = githubToTree(data.tree);
  res.send(tree);
});

app.listen(8080);
