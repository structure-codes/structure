"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const got_1 = __importDefault(require("got"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = express_1.default();
app.use(body_parser_1.default());
const githubToTree = (data) => {
    const elements = {};
    let prevFile = "";
    let prevDepth = 0;
    const path = [];
    data.forEach((file, index) => {
        if (file.type === "blob")
            return;
        const depth = file.path.split("/").length;
        const filename = file.path.split("/").pop().concat("/");
        // Pop a certain number of elements from path
        const popCount = depth <= prevDepth ? prevDepth - depth + 1 : 0;
        Array(popCount)
            .fill("pop")
            .forEach(() => path.pop());
        const current = path.reduce((branch, filename) => branch[filename], elements);
        current[filename] = {};
        prevFile = file.path;
        prevDepth = depth;
        path.push(filename);
    });
    return elements;
};
app.post("/api/github", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { owner, repo, branch } = req.body;
    let data;
    try {
        data = yield got_1.default(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "main"}?recursive=1`).json();
    }
    catch (_a) {
        data = yield got_1.default(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || "master"}?recursive=1`).json();
    }
    const tree = githubToTree(data.tree);
    res.send(tree);
}));
app.listen(8080);
//# sourceMappingURL=server.js.map