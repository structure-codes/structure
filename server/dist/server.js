"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
// https://api.github.com/repos/alex-oser/structure/git/trees/main?recursive=1
app.get("/", (req, res) => {
    res.send("hi");
});
app.listen(8080);
//# sourceMappingURL=server.js.map