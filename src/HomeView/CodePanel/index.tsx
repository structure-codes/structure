import { useStyles } from "./style";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { obsidian } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const code = `
src/
  index.tsx
  App/
    index.tsx
    styles.ts
    test.tsx
  HomeView/
    index.tsx
    styles.ts
    test.tsx
    Dropdown/
      index.tsx
      styles.ts
      test.tsx
    CodePanel/
      index.tsx
      styles.ts
      test.tsx
    ModelPanel/
      index.tsx
      styles.ts
     test.tsx
    SettingsPanel/
      index.tsx
      styles.ts
      test.tsx
  AboutView/
    index.tsx
    styles.ts
    test.tsx
  WelcomeModal/
    index.tsx
    styles.ts
    test.tsx
`
export const CodePanel = () => {
  const classes = useStyles();

  return (
    <div className={classes.codeContainer}>
      <SyntaxHighlighter showLineNumbers style={obsidian} customStyle={{ padding: 0, margin: 0 }}>
        {code}
      </SyntaxHighlighter>
    </div>
  )
}