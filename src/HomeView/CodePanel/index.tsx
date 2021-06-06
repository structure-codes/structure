import { useStyles } from "./style";
import MonacoEditor from 'react-monaco-editor';

const code = `{
  "test": "hello"
}`
export const CodePanel = () => {
  const classes = useStyles();

  return (
    <div className={classes.codeContainer}>
      <MonacoEditor
        language="json"
        theme="vs-dark"
        value={code}
        // options={options}
        // onChange={::this.onChange}
        // editorDidMount={::this.editorDidMount}
      />
    </div>
  )
}