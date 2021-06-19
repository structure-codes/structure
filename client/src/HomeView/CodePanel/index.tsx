import { useRef, useEffect } from "react";
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
  getNumberOfLeadingTabs,
} from "../../tree";
// import { customTreeFolding } from "./foldProvider";
declare global {
  interface Window { editor: any; treeStringToJson: any }
}

type IGlobalEditorOptions = monaco.editor.IGlobalEditorOptions;
type Monaco = typeof monaco;

export const options: IGlobalEditorOptions = {
  tabSize: 2,
  insertSpaces: false,
};

export const CodePanel = () => {
  const classes = useStyles();
  const treeRef = useRef<string | null>(null);
  const [treeState, setTreeState] = useRecoilState(treeAtom);

  useEffect(() => {
    treeRef.current = treeJsonToString(treeState);
  }, [treeState]);

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
  };

  const handleEditorChange = (
    e: monaco.editor.IModelContentChangedEvent,
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    console.log("Handle editor change")
    const model = editor.getModel();
    if (!model) return;
    const value = model.getValue();
    if (!value) return model.setValue(getBranchPrefix(0, true));
    const changes = e.changes[0];
    const isBackspace = changes.text === "" && changes.range.startColumn < changes.range.endColumn;

    let prevPrefix = TRUNK;
    let currPrefix = prevPrefix;

    const branchPrefixRegexWithSpaces = new RegExp(
      `^(${TRUNK}\t)+${BRANCH} |^(${TRUNK}\t)+${LAST_BRANCH} |^${LAST_BRANCH} |^${BRANCH} `,
      "g"
    );

    const branchPrefixRegex = new RegExp(
      `^(${TRUNK}\t)+${BRANCH}|^(${TRUNK}\t)+${LAST_BRANCH}|^${LAST_BRANCH}|^${BRANCH}`,
      "g"
    );

    const getIsLastBranch = (line: string, nextLine: string | null) => {
      if (!nextLine) return true;
      const prefix = line.match(branchPrefixRegex);
      const nextPrefix = nextLine.match(branchPrefixRegex);
      const tabCount = prefix ? getNumberOfTabs(prefix[0]) : 0;
      const nextTabCount = nextPrefix ? getNumberOfTabs(nextPrefix[0]) : 0;
      return nextTabCount < tabCount;
    }
    const getUpdatedLines = (lines: string[]) => {
      const updated: (string | null)[] = lines.map((line, index) => {
        prevPrefix = currPrefix;
        const matches = line.match(branchPrefixRegex);
        currPrefix = matches ? matches[0] : BRANCH;
        const lineContent = trimTreeLine(line.substr(currPrefix.length));
  
        // Handle moving tree right with tabs
        if (lineContent.match(/^\t/)) {
          const numTabs = getNumberOfTabs(currPrefix) + getNumberOfLeadingTabs(lineContent);
          return getBranchPrefix(numTabs, false) + lineContent.replace("\t", "");
        }
  
        // Return current line if the line starts with an acceptable prefix
        // EX: │\t├──
        if (line.match(branchPrefixRegexWithSpaces)) {
          return line;
        }
  
        // Handle shift+tab at root
        // if (line.match(/^└──*/)) return TRUNK + lineContent;
        if (isBackspace) {
          // Handle backspace
          const tabCount = getNumberOfTabs(currPrefix);
          if (tabCount === 0) return null;
          const newPrefix = getBranchPrefix(tabCount - 1, false);
          editor.setPosition({
            lineNumber: changes.range.endLineNumber,
            column: 1,
          });
          return newPrefix + lineContent;
        }
  
        // Handle hitting enter
        if (!line.match(branchPrefixRegex)) return prevPrefix + " " + line;
        console.log("WTF JS");
        return line;
      });
      return updated;
    }
    const lines: string[] = value.split(/\r\n|\r|\n/);
    const updated: any = getUpdatedLines(lines).filter((line: string | null) => line !== null);
    const newValue = updated?.join("\n") || getBranchPrefix(0, true);
    if (newValue !== treeRef.current) {
      console.log(`old value is: \n${value}`)
      console.log(`before conversion is: \n${newValue}`)
      const newState: any = treeStringToJson(newValue);
      console.log(`newState is: \n${JSON.stringify(newState)}`)
      console.log(`converted is: \n${treeJsonToString(newState)}`)
      console.log("preconversion === converted => ", newValue === treeJsonToString(newState))
      setTreeState(newState);
      model.setValue(treeJsonToString(newState));
      editor.setPosition({
        lineNumber: changes.range.endLineNumber,
        column: 1,
      });
    }
  };

  return (
    <div className={classes.codeContainer}>
      <Editor options={options} theme="vs-dark" defaultLanguage="tree" onMount={onMount} />
    </div>
  );
};
