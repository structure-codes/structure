"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app = express_1.default();
app.use(express_1.default.json());
firebase_admin_1.default.initializeApp();
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
app.use((req, res, next) => {
    console.log(req.path);
    next();
});
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
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map