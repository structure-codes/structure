import { useRef, useState } from "react";
import { useStyles } from "./style";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { options, languageDef, configuration } from "./customLang";

export const CodePanel = () => {
  const defaultRef: any = null;
  const rootPrefix = "├── ";
  const branchPrefix = "|  └── ";
  const classes = useStyles();
  const editorRef = useRef(defaultRef);
  const [code, setCode] = useState(rootPrefix);
  const onMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: any
  ) => {
    // Register a new language
    monaco.languages.register({ id: "tree" });
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("tree", languageDef);
    // Set the editing configuration for the language
    monaco.languages.setLanguageConfiguration("tree", configuration);
    editor.focus();
    editor.setPosition({ lineNumber: 1, column: 5 });
    editor.onDidChangeModelContent((e) => {
      const isBackspace =
        e.changes[0].text === "" &&
        e.changes[0].range.startColumn < e.changes[0].range.endColumn;
      const value = editor.getModel()?.getValue();
      const lines = value?.split(/\r\n|\r|\n/).map((line) => {
        if (line.startsWith(branchPrefix)) return line;
        if (line.startsWith(rootPrefix + "\t")) return line.replace(rootPrefix + "\t", branchPrefix)
        if (!line.startsWith(rootPrefix)) {
          // Maybe you tried to backspace and delete the header
          if (line.startsWith("├")) return line + " ";
          // Or else it's a brand new line so add the whole prefix
          else return rootPrefix + line;
        }
        return line;
      });
      const newValue = lines?.join("\n") || rootPrefix;
      if (value !== newValue) {
        editor.getModel()?.setValue(newValue);
      }
    });
    editor.onDidChangeCursorPosition((e) => {
      if (e.position.column < 5) {
        editor.setPosition({
          lineNumber: e.position.lineNumber,
          column: 5,
        });
      }
    });
    editorRef.current = editor;
  };

  return (
    <div className={classes.codeContainer}>
      <Editor
        options={options}
        theme="vs-dark"
        defaultLanguage="tree"
        defaultValue={code}
        onMount={onMount}
      />
    </div>
  );
};
