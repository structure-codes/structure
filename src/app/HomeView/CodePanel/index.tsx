import React, { useRef, useEffect, useMemo, forwardRef } from "react";
import classes from "./style.module.css";
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { languageDef, themeDef, configuration } from "./customLang";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { treeAtom, settingsAtom, hoveredNodeAtom, selectedNodeAtom } from "../../../store";
import { toRawTree, codeLineIds } from "../ModelPanel/layout";
import "./codePanel.css";
import {
  BRANCH,
  LAST_BRANCH,
  TRUNK,
  getBranchPrefixAccurate,
  trimTreeLine,
  getNumberOfTabs,
  getNumberOfLeadingTabs,
} from "./treeHelper";
import { TreeType, treeJsonToString, treeStringToJson } from "@structure-codes/utils";
import { FONT_MONO } from "../../tokens";

declare global {
  interface Window {
    editor: any;
    treeStringToJson: any;
  }
}

type IGlobalEditorOptions = monaco.editor.IGlobalEditorOptions;
type IEditorOptions = monaco.editor.IEditorOptions;
type Monaco = typeof monaco;

const options: IGlobalEditorOptions | IEditorOptions = {
  tabSize: 2,
  insertSpaces: false,
  minimap: {
    enabled: false,
  },
  readOnly: true,
  fontFamily: FONT_MONO,
  fontSize: 13,
  lineHeight: 24, // ~1.85 × 13px
  lineNumbersMinChars: 3,
  scrollBeyondLastLine: false,
  overviewRulerLanes: 0,
  // Stop the cursor from blinking
  cursorBlinking: "blink",
  // Shrink the width to nothing
  cursorWidth: 0,
  // Turn off line highlight modifications
  renderLineHighlight: "none",
  // Prevent the overview ruler from showing cursor indicators
  hideCursorInOverviewRuler: true,
  occurrencesHighlight: "off",
  selectionHighlight: false,
};

const getLastNode = (branch: TreeType) => {
  const indexes: Array<number> = [];
  // Get the last line number that is a child of the given branch
  const getIndexes = (branch: TreeType) => {
    if (branch.children.length === 0) indexes.push(branch._index);
    branch.children.forEach(child => {
      getIndexes(child);
    });
  };
  getIndexes(branch);
  return Math.max(...indexes);
};

export const CodePanel = React.memo(
  forwardRef<HTMLDivElement, { height: number }>(({ height }, ref) => {
    const treeRef = useRef<string | null>(null);
    const editorRef = useRef<any>(null);
    // The monaco instance from onMount (the @monaco-editor/react loader's copy),
    // kept so the decorations effect can construct `Range` without bundling monaco.
    const monacoRef = useRef<Monaco | null>(null);
    const [treeState, setTreeState] = useAtom(treeAtom);
    const settingsState = useAtomValue(settingsAtom);

    // ---- cross-pane hover-link (see store.ts / ModelPanel) ----
    const hoveredId = useAtomValue(hoveredNodeAtom);
    const selectedId = useAtomValue(selectedNodeAtom);
    const setHoveredId = useSetAtom(hoveredNodeAtom);
    const setSelectedId = useSetAtom(selectedNodeAtom);

    // line number (1-based) -> node id, matching the editor's rendered lines
    const lineIds = useMemo(
      () =>
        codeLineIds(toRawTree(treeState, ""), {
          hideFiles: settingsState.hideFiles,
          hideDots: settingsState.hideDots,
          depthLimit: settingsState.depth,
        }),
      [treeState, settingsState]
    );
    const idToLine = useMemo(() => {
      const m = new Map<string, number>();
      lineIds.forEach((id, i) => m.set(id, i + 1));
      return m;
    }, [lineIds]);

    // refs so the once-registered Monaco mouse handlers read current values
    const lineIdsRef = useRef<string[]>(lineIds);
    lineIdsRef.current = lineIds;
    const lastHoverRef = useRef<string | null>(null);
    const decorationsRef = useRef<string[]>([]);

    // apply hover/select decorations when either changes
    useEffect(() => {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;
      const selLine = selectedId ? idToLine.get(selectedId) : undefined;
      const hovLine = hoveredId ? idToLine.get(hoveredId) : undefined;
      const decos: monaco.editor.IModelDeltaDecoration[] = [];
      if (hovLine && hovLine !== selLine) {
        decos.push({
          range: new monaco.Range(hovLine, 1, hovLine, 1),
          options: { isWholeLine: true, className: "tree-line-hover" },
        });
      }
      if (selLine) {
        decos.push({
          range: new monaco.Range(selLine, 1, selLine, 1),
          options: { isWholeLine: true, className: "tree-line-selected" },
        });
      }
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decos);
    }, [hoveredId, selectedId, idToLine]);

    useEffect(() => {
      const newValue = treeJsonToString({
        tree: treeState,
        tabChar: "\t",
        options: settingsState,
      });
      treeRef.current = newValue;
      const currValue = editorRef.current?.getModel()?.getValue();
      if (currValue !== newValue) {
        editorRef.current?.getModel()?.setValue(newValue);
      }
    }, [treeState, settingsState]);

    const onMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco;
      // Register a new language
      monaco.languages.register({ id: "tree" });
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider("tree", languageDef);
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration("tree", configuration);
      monaco.editor.defineTheme("treeTheme", themeDef);
      monaco.editor.setTheme("treeTheme");
      editor.focus();

      // register code folder provider
      monaco.languages.registerFoldingRangeProvider("tree", {
        provideFoldingRanges: function (model, _context, _token) {
          const tree: TreeType[] = treeStringToJson(model.getValue());
          const ranges: any = [];
          if (tree.length === 0) return ranges;

          const getRanges = (branch: TreeType) => {
            const startIndex = branch._index;
            const endIndex = getLastNode(branch);
            ranges.push({ start: startIndex + 1, end: endIndex + 1 });
            branch.children.forEach(leaf => {
              getRanges(leaf);
            });
          };

          tree.forEach((branch: TreeType) => {
            getRanges(branch);
          });

          return ranges;
        },
      });

      // editor.onDidChangeModelContent(e => handleEditorChange(e, editor));
      // editor.onDidChangeCursorPosition(e => {
      //   console.log(`cursor move source: ${e.source}`);
      //   console.log(`cursor move position: ${e.position}`);
      //   // If selecting text or api moves cursor, no need to revalidate cursor position
      //   const selection = editor.getSelection();
      //   const isSelecting = selection?.endColumn !== selection?.startColumn || selection?.endLineNumber !== selection?.startLineNumber;
      //   if (e.source === "mouse" && isSelecting) return;
      //   if (e.source === "api") return;
      //   const value = editor.getModel()?.getValue() || "";
      //   const currentLine = value.split(/\r?\n/)[e.position.lineNumber - 1];
      //   const currentPrefix = currentLine.split(" ")[0];
      //   if (e.position.column < currentPrefix.length + 2) {
      //     editor.setPosition({
      //       lineNumber: e.position.lineNumber,
      //       column: currentPrefix.length + 2,
      //     });
      //   }
      // });

      // ---- cross-pane hover-link: map editor mouse position -> node id ----
      const idAtLine = (ln?: number) =>
        ln && ln >= 1 ? (lineIdsRef.current[ln - 1] ?? null) : null;
      editor.onMouseMove((e: monaco.editor.IEditorMouseEvent) => {
        const id = idAtLine(e.target?.position?.lineNumber);
        if (id !== lastHoverRef.current) {
          lastHoverRef.current = id;
          setHoveredId(id);
        }
      });
      editor.onMouseLeave(() => {
        if (lastHoverRef.current !== null) {
          lastHoverRef.current = null;
          setHoveredId(null);
        }
      });
      editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
        const id = idAtLine(e.target?.position?.lineNumber);
        if (id) setSelectedId(id);
      });

      editor.getModel()?.setValue(treeRef.current || "");
      editorRef.current = editor;
    };

    // Disabled WIP: live tree-prefix auto-formatting. Re-enabled via the
    // commented-out editor.onDidChangeModelContent handler in handleEditorDidMount.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleEditorChange = (
      e: monaco.editor.IModelContentChangedEvent,
      editor: monaco.editor.IStandaloneCodeEditor
    ) => {
      const model = editor.getModel();
      if (!model) return;
      const value = model.getValue();
      if (!value) return model.setValue(getBranchPrefixAccurate([], true));
      const changes = e.changes[0];
      const isBackspace =
        changes.text === "" && changes.range.startColumn < changes.range.endColumn;

      let prevPrefix = TRUNK;
      let currPrefix = prevPrefix;

      const branchPrefixRegexWithSpaces = /^(\t+)?(│|├──|└──|\t)+ /g;

      const branchPrefixRegex = new RegExp(
        `^(${TRUNK}?\t)+${BRANCH}|^(${TRUNK}?\t)+${LAST_BRANCH}|^${LAST_BRANCH}|^${BRANCH}`,
        "g"
      );

      const getUpdatedLines = (lines: string[]) => {
        const updated: (string | null)[] = lines.map(line => {
          prevPrefix = currPrefix;
          const matches = line.match(branchPrefixRegex);
          currPrefix = matches ? matches[0] : BRANCH;
          const lineContent = trimTreeLine(line.substr(currPrefix.length));

          // Handle moving tree right with tabs
          if (lineContent.match(/^\t/)) {
            const prevNumTabs = getNumberOfTabs(prevPrefix);
            const numTabs = getNumberOfTabs(currPrefix) + getNumberOfLeadingTabs(lineContent);
            if (numTabs - prevNumTabs > 1)
              return (
                getBranchPrefixAccurate(Array(prevNumTabs + 1).fill(true), false) +
                lineContent.replace("\t", "")
              );
            return (
              getBranchPrefixAccurate(Array(numTabs).fill(true), false) +
              lineContent.replace("\t", "")
            );
          }

          // Return current line if the line starts with an acceptable prefix
          // EX: │\t├──
          if (line.match(branchPrefixRegexWithSpaces)) {
            return line;
          }

          // Handle backspace
          if (isBackspace) {
            const tabCount = getNumberOfTabs(currPrefix);
            if (tabCount === 0) return null;
            const newPrefix = getBranchPrefixAccurate(Array(tabCount - 1).fill(true), false);
            editor.setPosition({
              lineNumber: changes.range.endLineNumber,
              column: 1,
            });
            return newPrefix + lineContent;
          }

          // // Handle hitting enter
          // if (!line.match(branchPrefixRegex)) {
          //   console.log("handleEnter?");
          //   const newLine = prevPrefix + " " + line;
          //   const curr = editorRef.current.getPosition();
          //   if (curr) {
          //     const newPosition = {
          //       lineNumber: curr.lineNumber + 1,
          //       column: 100,
          //     };
          //     editorRef.current.setPosition(newPosition);
          //   }
          //   return prevPrefix + " " + line;
          // }
          return line;
        });
        return updated;
      };
      const lines: string[] = value.split(/\r?\n/);
      const updated: any = getUpdatedLines(lines).filter((line: string | null) => line !== null);
      const newValue = updated?.join("\n") || getBranchPrefixAccurate([], true);
      if (newValue !== treeRef.current) {
        const newState: TreeType[] = treeStringToJson(newValue);
        setTreeState(newState);
      }
    };

    return (
      <div ref={ref} className={classes.codeContainer} style={{ height }}>
        <Editor options={options} theme="vs-dark" defaultLanguage="tree" onMount={onMount} />
      </div>
    );
  })
);
