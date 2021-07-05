import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { theme } from "./theme";
import "./index.css";
import { RecoilRoot } from "recoil";

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
