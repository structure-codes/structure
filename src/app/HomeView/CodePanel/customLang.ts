import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { tokens } from "../../tokens";

// Monaco can't parse oklch(), so colors come from the hex token mirror in theme.ts.
// noHash() because Monaco theme tokens want hex WITHOUT the leading '#'.
const noHash = (hex: string) => hex.replace(/^#/, "");

export const themeDef: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "folder", foreground: noHash(tokens.folder) },
    { token: "file", foreground: noHash(tokens.file) },
    { token: "tree", foreground: noHash(tokens.faint) }, // ├──, └──, │ connectors
  ],
  colors: {
    "editor.background": tokens.panel,
    "editorLineNumber.foreground": tokens.lineNum,
    "editorLineNumber.activeForeground": tokens.muted,
    "editorGutter.background": tokens.panel,
    "editor.lineHighlightBackground": "#00000000",
    "editor.lineHighlightBorder": "#00000000",
    // accent-tinted selection (#RRGGBBAA)
    "editor.selectionBackground": `${tokens.accent}38`,
    "editor.inactiveSelectionBackground": `${tokens.accent}22`,
    "editorCursor.foreground": tokens.accent,
    "editorIndentGuide.background": tokens.borderSoft,
    "editorIndentGuide.activeBackground": tokens.border,
  },
};

// This config defines how the language is displayed in the editor.
// Test configs live here: https://microsoft.github.io/monaco-editor/monarch.html
export const languageDef: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: "",
  tokenizer: {
    root: [{ include: "@tree" }, { include: "@tags" }],
    tags: [[/.*/, "folder"]],
    tree: [[/^(\t+)?(│|├──|└──|\t)+/, "tree"]],
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
