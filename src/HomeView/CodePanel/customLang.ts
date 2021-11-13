import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const themeDef: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark", // can also be vs-dark or hc-black
  inherit: true, // can also be false to completely replace the builtin rules
  rules: [
    { token: "folder", foreground: "#4EBFFC" },
    { token: "file", foreground: "#ffffff" },
    { token: "tree", foreground: "#C1C1C1" }, // will inherit fontStyle from `comment` above
  ],
  colors: {},
};

// This config defines how the language is displayed in the editor.
// Test configs live here: https://microsoft.github.io/monaco-editor/monarch.html
export const languageDef: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: "",
  tokenizer: {
    root: [
      { include: "@tree" },
      { include: "@tags" },
    ],
    tags: [
      [/.*/, "folder"],
    ],
    tree: [
      [/^(\t+)?(│|├──|└──|\t)+/, "tree"],
    ],
  },
};

// This config defines the editor"s behavior.
export const configuration = {
  comments: {
    lineComment: "//",
  },
  brackets: [],
  foldingStrategy: "indentation",
};
