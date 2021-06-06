import { useRef, useState } from "react";
import { useStyles } from "./style";
import Editor from "@monaco-editor/react";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { options, languageDef, configuration } from "./customLang";
import { stringify } from "querystring";

export const CodePanel = () => {
  const defaultRef: any = null;
  const treePrefix = "├── ";
  const classes = useStyles();
  const editorRef = useRef(defaultRef);
  const [code, setCode] = useState(treePrefix)

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    // Register a new language
    monaco.languages.register({ id: "tree" });
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("tree", languageDef);
    // Set the editing configuration for the language
    monaco.languages.setLanguageConfiguration("tree", configuration);
    editor.focus();
    editor.setPosition({lineNumber: 1, column: 5});
    editor.onDidChangeCursorPosition((e) => {
      console.log("position is: ", e.position)
      if (e.position.column < 5) {
        editor.setPosition({
            lineNumber: e.position.lineNumber,
            column: 5
        });
      } 
    })
    editorRef.current = editor; 
  };
  
  const handleChange = (newValue: string | undefined) => {
    console.log("handling change")
    const lines = newValue?.split(/\r\n|\r|\n/).map(line => {
      if (!line.startsWith(treePrefix)) {
        // Maybe you tried to backspace and delete the header
        if (line.startsWith("├")) return line + " ";
        // Or else it's a brand new line so add the whole prefix
        else return treePrefix + line
      };
      return line;
    });
    if (editorRef && editorRef.current) {
      // editorRef.current.getModel().setValue(lines?.join("\n"));
      setCode(lines?.join("\n") || treePrefix)
    }
  }

  return (
    <div className={classes.codeContainer}>
      <Editor
        options={options}
        theme="vs-dark"
        defaultLanguage="tree"
        value={code}
        onMount={onMount}
        onChange={handleChange}
      />
    </div>
  );
};
