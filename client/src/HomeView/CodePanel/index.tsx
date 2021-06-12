import { useEffect, useRef, useState } from "react";
import { useStyles } from "./style";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { languageDef, themeDef, configuration } from "./customLang";
import { useRecoilState } from "recoil";
import { treeAtom } from "../../store";

// @ts-ignore
import { ROOT_PREFIX, treeJsonToString, treeStringToJson } from "shared";

type Monaco = typeof monaco;

// This config defines the editors view
export const options = {
  minimap: {
    enabled: false,
  },
  tabSize: 2,
  insertSpaces: false,
};


export const CodePanel = () => {
  const defaultRef: any = null;
  const classes = useStyles();
  const editorRef = useRef(defaultRef);
  const [treeState, setTreeState] = useRecoilState(treeAtom);

  // console.log(treeState)
  // load it up
  const defaultTree = treeJsonToString(treeState);
  const getBranchPrefix = (numTabs: number) => {
    return "\t".repeat(numTabs) + "└── ";
  };

  // useEffect(() => {
  //   if (!treeState || !editorRef.current) return;
  //   const value = editorRef.current.getModel()?.getValue();
  //   if (value !== treeState) editorRef.current.getModel()?.setValue(treeState);
  // }, [treeState]);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.setPosition({
      lineNumber: 1,
      column: defaultTree.length + 1,
    });
    // Register a new language
    monaco.languages.register({ id: "tree" });
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("tree", languageDef);
    // Set the editing configuration for the language
    monaco.languages.setLanguageConfiguration("tree", configuration);
    monaco.editor.defineTheme("treeTheme", themeDef);
    monaco.editor.setTheme("treeTheme");
    editor.focus();
    // editor.setPosition({ lineNumber: 1, column: 5 });
    editor.onDidChangeModelContent(e => handleEditorChange(e, editor));

    editor.onDidChangeCursorPosition(e => {
      const value = editor.getModel()?.getValue() || "";
      const currentLine = value.split(/\r\n|\r|\n/)[e.position.lineNumber - 1];
      const currentPrefix = currentLine.split(" ")[0];
      if (e.position.column < currentPrefix.length + 2) {
        editor.setPosition({
          lineNumber: e.position.lineNumber,
          column: currentPrefix.length + 2,
        });
      }
    });

    editorRef.current = editor;
  };

  const handleEditorChange = (
    e: monaco.editor.IModelContentChangedEvent,
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    const value = editor.getModel()?.getValue();
    if (!value) return;
    const changes = e.changes[0];
    const isBackspace = changes.text === "" && changes.range.startColumn < changes.range.endColumn;

    let prevPrefix = ROOT_PREFIX;
    let currPrefix = prevPrefix;

    const lines = value.split(/\r\n|\r|\n/).map(line => {
      prevPrefix = currPrefix;
      currPrefix = line.split(" ")[0] + " ";
      const lineContent = line.substr(currPrefix.length);
      // Handle shift+tab at root
      if (line.match(/^└──*/)) return ROOT_PREFIX + lineContent;
      if (isBackspace) {
        // Handle backspace at root
        if (line === "├──") return null;
        // Handle backspace at branch
        if (line.match(/^\t+└──$/)) {
          const numTabs = (line.match(/\t/g) || []).length;
          return numTabs > 1 ? getBranchPrefix(numTabs - 1) : ROOT_PREFIX;
        }
      }
      // Handle hitting enter
      if (line.match(/^\t+$|^$/)) return prevPrefix;
      // Handle moving tree right
      if (line.match(/^├── \t|^\t+└── \t/)) {
        const numTabs = (line.match(/\t/g) || []).length;
        return getBranchPrefix(numTabs) + lineContent.replace("\t", "");
      } else {
        return line;
      }
    });
    const filtered = lines.filter(line => line !== null);
    const newValue = filtered?.join("\n") || ROOT_PREFIX;
    if (value && value !== newValue) {
      editor.getModel()?.setValue(newValue);
      const newState: any = treeStringToJson(newValue);
      setTreeState(newState);
    }
    
  };

  return (
    <div className={classes.codeContainer}>
      <Editor
        options={options}
        theme="vs-dark"
        defaultLanguage="tree"
        defaultValue={defaultTree}
        onMount={onMount}
      />
    </div>
  );
};
