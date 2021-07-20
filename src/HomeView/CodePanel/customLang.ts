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
export const languageDef: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: "",
  keywords: ["├", "─", "|", "└"],
  tokenizer: {
    root: [
      { include: "@tags" },
      [/[A-Za-z][\w\\$]*/, "file"],
      [/├|─|\||└/, "tree"],
    ],
    tags: [
      [/\w*\//, "folder"],
      [/#[a-zA-Z-_]\w*/, "folder"],
    ],
  },
};

// This config defines the editor"s behavior.
export const configuration = {
  comments: {
    lineComment: "#",
  },
  brackets: [],
  foldingStrategy: "indentation",
};
