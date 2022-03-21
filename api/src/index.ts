import express from "express";
import got from "got";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { githubToTree } from "./tree";
import { getErrorMessage } from "./errorHandler";
export const app = express();
const router = express.Router();
app.use(express.json());
admin.initializeApp();

interface ITemplates {
  name: string;
  url: string;
  tags: string[];
}

const templatesRepo = "https://raw.githubusercontent.com/structure-codes/structure-templates/main/";
router.get("/templates", async (req, res) => {
  const templatesUrl = `${templatesRepo}/templates.json`;
  try {
    const data: ITemplates[] = await got(templatesUrl).json();
    const parsed: string[] = data.map((template) => template.name.replace(/\.tree$/, ""));
    res.send(parsed);
  } catch (e) {
    console.error("Error retrieving templates from:", templatesUrl, "\n", getErrorMessage(e));
  }
});

router.get("/template/:template", async (req, res) => {
  const { template } = req.params;
  const templateUrl = `${templatesRepo}/templates/${template}.tree`;
  try {
    const data = await got(templateUrl).then(res => res.body);
    res.send(data);
  } catch (e) {
    console.error("Error retrieving template from:", templateUrl, "\n", getErrorMessage(e));
  }
});

router.post("/github", async (req, res) => {
  const { owner, repo, branch } = req.body;
  let data;
  let url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "main"}?recursive=1`;
  try {
    data = await got(url).json();
  } catch {
    try {
      url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "master"}?recursive=1`;
      data = await got(url).json();
    } catch (e) {
      const errMsg = `Error retrieving GitHub data from: ${url}\n${getErrorMessage(e)}`;
      console.error(errMsg);
      return res.status(404).send({error: errMsg});
    }
  }
  const tree = githubToTree(data.tree);
  return res.send(tree);
});

app.use("/api", router);

exports.api = functions.https.onRequest(app);
