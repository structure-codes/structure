import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

// This config defines the editor"s view.
export const options = {
  minimap: {
    enabled: false
  },
  tabSize: 2,
  insertSpaces: false,
}

// This config defines how the language is displayed in the editor.
export const languageDef: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: [
  ],
  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },
      { include: "@tags" },
      [/[A-Za-z][\w\\$]*/, "type.identifier" ], 
      [/^@\w+/, { cases: { "@keywords": "keyword" } }],
    ],
    whitespace: [
      // [comment, "comment"],
      [/\s+/, "white"],
    ],
    numbers: [
      [/@number/, "number"],
    ],
    strings: [
      [/[=|][ @number]*$/, "string.escape"],
      // TODO: implement invalid strings
    ],
    tags: [
      [/\w*\//, "tag"],
      [/#[a-zA-Z]\w*/, "tag"],
    ],
  },
}

// This config defines the editor"s behavior.
export const configuration = {
  comments: {
    lineComment: "#",
  },
  brackets: [],
}