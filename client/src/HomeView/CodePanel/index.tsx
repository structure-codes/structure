import { useEffect, useRef, useState } from "react";
import { useStyles } from "./style";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { languageDef, themeDef, configuration } from "./customLang";
import { useRecoilState } from "recoil";
import { treeAtom } from "../../store";
import { BRANCH, LAST_BRANCH, TRUNK, treeJsonToString, treeStringToJson, getBranchPrefix } from "../../tree";

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

  // useEffect(() => {
  //   if (!treeState || !editorRef.current) return;
  //   const value = editorRef.current.getModel()?.getValue();
  //   if (value !== treeState) editorRef.current.getModel()?.setValue(treeState);
  // }, [treeState]);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
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
    editor.getModel()?.setValue(treeJsonToString(treeState));
    editorRef.current = editor;
  };

  // TODO: use contants in the rules parsing
  const handleEditorChange = (
    e: monaco.editor.IModelContentChangedEvent,
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    const model = editor.getModel();
    if (!model) return;
    const value = model.getValue();
    if (!value) return;
    const changes = e.changes[0];
    const isBackspace = changes.text === "" && changes.range.startColumn < changes.range.endColumn;

    let prevPrefix = TRUNK;
    let currPrefix = prevPrefix;
    const branchPrefixRegex = new RegExp(`^(${TRUNK}\t)+${BRANCH}|^(${TRUNK}\t)+${LAST_BRANCH}|^${LAST_BRANCH}|^${BRANCH}`)

    const lines = value.split(/\r\n|\r|\n/).map(line => {
      prevPrefix = currPrefix;
      currPrefix = line.split(" ")[0] + " ";
      const lineContent = line.substr(currPrefix.length);

      if (!line.match(branchPrefixRegex)) {
        console.log("this line sucks yo:\n ", line.match(branchPrefixRegex))
      }
      // Handle shift+tab at root
      // if (line.match(/^└──*/)) return TRUNK + lineContent;
      if (isBackspace) {
        console.log("isBackspace currPrefix is: ", currPrefix)
        // Handle backspace 
        if (!currPrefix.match(branchPrefixRegex)) {
          console.log("handle backspace")
          const numTabs = (currPrefix.match(/\t/g) || []).length;
          return getBranchPrefix(numTabs - 1, false) + lineContent;
        }
      }

      // Handle hitting enter
      if (line.match(/^\t+$|^$/)) return prevPrefix;

      // Handle moving tree right with tabs
      if (lineContent.match(/^\t/)) {
        const numTabs = (line.match(/\t/g) || []).length;
        return getBranchPrefix(numTabs, false) + lineContent.replace("\t", "");
      } else {
        return line;
      }
      
    });
    const filtered = lines.filter(line => line !== null);
    const newValue = filtered?.join("\n") || getBranchPrefix(0, true);
    if (value !== newValue) {
      model.setValue(newValue);
      const newState: any = treeStringToJson(newValue);
      console.log(newState)
      setTreeState(newState);
    }
    
  };

  return (
    <div className={classes.codeContainer}>
      <Editor
        options={options}
        theme="vs-dark"
        defaultLanguage="tree"
        onMount={onMount}
      />
    </div>
  );
};
