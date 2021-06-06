/* eslint-disable quotes */

// This config defines the editor's view.
export const options = {
  lineNumbers: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  fontSize: 12,
}

// This config defines how the language is displayed in the editor.
export const languageDef: any = {
  defaultToken: "",
  number: /\d+(\.\d+)?/,
  keywords: ["index.tsx"],
  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },
      { include: "@tags" },
      [/^@\w+/, { cases: { "@keywords": "keyword" } }],
    ],
    whitespace: [
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
      [/^%[a-zA-Z]\w*/, "tag"],
      [/#[a-zA-Z]\w*/, "tag"],
    ],
  },
}

// This config defines the editor's behavior.
export const configuration: any = {
  comments: {
    lineComment: "#",
  },
  brackets: [
   
  ],
}