import { useRef } from "react";
import { useStyles } from "./style";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { languageDef, themeDef, configuration } from "./customLang";
import { useRecoilState } from "recoil";
import { treeAtom } from "../../store";
import {
  BRANCH,
  LAST_BRANCH,
  TRUNK,
  treeJsonToString,
  treeStringToJson,
  getBranchPrefix,
  trimTreeLine,
  getNumberOfTabs,
} from "../../tree";
// import { customTreeFolding } from "./foldProvider";

type IGlobalEditorOptions = monaco.editor.IGlobalEditorOptions;
type Monaco = typeof monaco;

export const options: IGlobalEditorOptions = {
  tabSize: 2,
  insertSpaces: false  
};

export const CodePanel = () => {
  const defaultRef: any = null;
  const classes = useStyles();
  const editorRef = useRef(defaultRef);
  const [treeState, setTreeState] = useRecoilState(treeAtom);

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
    editor.onDidChangeModelContent(e => handleEditorChange(e, editor));

    // register code folder provider
    monaco.languages.registerFoldingRangeProvider("customTreeFolding", {
      provideFoldingRanges: function (model, context, token) {
        const ranges: any = [];
        // const lines = model.getLinesContent();
        
        return ranges;
      },
    });

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
    console.log("Handling editor change")
    const model = editor.getModel();
    if (!model) return;
    const value = model.getValue();
    if (!value) return;
    const changes = e.changes[0];
    const isBackspace = changes.text === "" && changes.range.startColumn < changes.range.endColumn;

    let prevPrefix = TRUNK;
    let currPrefix = prevPrefix;

    const branchPrefixRegexWithSpaces = new RegExp(
      `^(${TRUNK}\t)+${BRANCH} |^(${TRUNK}\t)+${LAST_BRANCH} |^${LAST_BRANCH} |^${BRANCH} `, "g"
    );
    
    const branchPrefixRegex = new RegExp(
      `^(${TRUNK}\t)+${BRANCH}|^(${TRUNK}\t)+${LAST_BRANCH}|^${LAST_BRANCH}|^${BRANCH}`, "g"
    );

    const lines = value.split(/\r\n|\r|\n/).map(line => {
      prevPrefix = currPrefix;
      const matches = line.match(branchPrefixRegex);
      currPrefix = matches ? matches[0] : BRANCH;
      const lineContent = trimTreeLine(line.substr(currPrefix.length));

      // Handle moving tree right with tabs
      if (lineContent.match(/^\t/)) {
        console.log("NICETABS: : ", lineContent);
        const numTabs = (line.match(/\t/g) || []).length;
        return getBranchPrefix(numTabs, false) + lineContent.replace("\t", "");
      }

      // Exit if the line starts with an acceptable prefix
      // EX: │   ├── 
      if (line.match(branchPrefixRegexWithSpaces)) {
        return line;
      }

      // Handle shift+tab at root
      // if (line.match(/^└──*/)) return TRUNK + lineContent;
      if (isBackspace) {
        console.log("isBackspace currPrefix is: ", currPrefix);
        // Handle backspace
        const tabCount = getNumberOfTabs(currPrefix);
        return getBranchPrefix(tabCount > 0 ? tabCount - 1 : 0, false) + lineContent;
      }

      // Handle hitting enter
      if (!line.match(branchPrefixRegex)) return prevPrefix + " " + line;
      console.log("WTF JS");
      return line;
    });
    const filtered = lines.filter(line => line !== null);
    const newValue = filtered?.join("\n") || getBranchPrefix(0, true);
    if (value !== newValue) {
      model.setValue(newValue);
      const newState: any = treeStringToJson(newValue);      
      setTreeState(newState);
    }
  };

  return (
    <div className={classes.codeContainer}>
      <Editor options={options} theme="vs-dark" defaultLanguage="tree" onMount={onMount} />
    </div>
  );
};
