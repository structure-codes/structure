import express from "express";
import got from "got";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { githubToTree } from "./tree";

const app = express();
app.use(express.json());
admin.initializeApp();

app.post("/api/github", async (req, res) => {
  const { owner, repo, branch } = req.body;
  let data;
  try {
    data = await got(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "main"}?recursive=1`
    ).json();
  } catch {
    data = await got(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "master"}?recursive=1`
    ).json();
  }
  const tree = githubToTree(data.tree);
  res.send(tree);
});

exports.api = functions.https.onRequest(app);
