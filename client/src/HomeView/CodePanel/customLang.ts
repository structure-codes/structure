import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const themeDef: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark", // can also be vs-dark or hc-black
  inherit: true, // can also be false to completely replace the builtin rules
  rules: [
    { token: "folder", foreground: "b6edbd" },
    { token: "file", foreground: "33FF42" },
    { token: "tree", foreground: "C1C1C1" }, // will inherit fontStyle from `comment` above
  ],
  colors: {},
};

// This config defines how the language is displayed in the editor.
export const languageDef: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: ["├", "─", "|", "└"],
  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },
      { include: "@tags" },
      [/[A-Za-z][\w\\$]*/, "file"],
      [/├|─|\||└/, "tree"],
      [/^├── |^\|\t+└── /, "operators"],
    ],

    whitespace: [[/\s+/, "white"]],
    numbers: [[/@number/, "number"]],
    strings: [
      [/[=|][ @number]*$/, "string.escape"],
      // TODO: implement invalid strings
    ],
    tags: [
      [/\w*\//, "folder"],
      [/#[a-zA-Z]\w*/, "folder"],
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
