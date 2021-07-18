import express from "express";
import got from "got";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { githubToTree } from "./tree";

const app = express();
const router = express.Router();
app.use(express.json());
admin.initializeApp();

const templatesRepo = "https://raw.githubusercontent.com/structure-codes/structure-templates/main/";
router.get("/templates", async (req, res) => {
  const templatesUrl = `${templatesRepo}/templates.json`;
  try {
    const data = await got(templatesUrl).json();
    res.send(data);
  } catch (e) {
    console.error("Error retrieving templates from:", templatesUrl);
  }
});

router.get("/template/:template", async (req, res) => {
  const { template } = req.params;
  const templateUrl = `${templatesRepo}/templates/${template}`;
  try {
    const data = await got(templateUrl).then(res => res.body);
    res.send(data);
  } catch (e) {
    console.error("Error retrieving templates from:", templateUrl);
  }
});

router.post("/github", async (req, res) => {
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

app.use("/api", router);

exports.api = functions.https.onRequest(app);
