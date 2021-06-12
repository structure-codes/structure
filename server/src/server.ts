import express from "express";
import { treeJsonToString } from "../../shared";

const app = express();

// https://api.github.com/repos/alex-oser/structure/git/trees/main?recursive=1
app.get("/", (req, res) => {
  res.send("hi");
});

app.get("/treeJson", (req, res) => {
  res.send(treeJsonToString({
    "src/": {
      "index.tsx": {}
    }
  }));
});

app.listen(8080);
