import express from "express";

const app = express();

// https://api.github.com/repos/alex-oser/structure/git/trees/main?recursive=1
app.get("/", (req, res) => {
  res.send("hi");
});

app.listen(8080);
