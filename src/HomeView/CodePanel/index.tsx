import { useEffect } from "react";
import { useStyles } from "./style";

import Editor, { useMonaco } from "@monaco-editor/react";
import { languageDef, configuration } from "../../jankAssLang";

import "../../customLanguage";

export const CodePanel = () => {
  const classes = useStyles();
  const onMount = (editor: any, monaco: any) => {
    // Register a new language
    monaco.languages.register({ id: 'estimatemd' })
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('estimatemd', languageDef)
    // Set the editing configuration for the language
    monaco.languages.setLanguageConfiguration('estimatemd', configuration)
    console.log("minecraft")
  }

  return (
    <div className={classes.codeContainer}>
      <Editor
        options={{
          minimap: {
            enabled: false
          }
        }}
        theme="vs-dark"
        defaultLanguage="estimatemd"
        defaultValue="console.log(1)"
        onMount={onMount}
      />
    </div>
  )
}