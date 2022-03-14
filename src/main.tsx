import React from "react";
import { render } from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { App } from "./App";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { theme } from "./theme";
import "./index.css";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

render(
  <React.StrictMode>
    <RecoilRoot>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
              <BrowserRouter>
                <Routes>
                  <Route key="App" path={"*"} element={<App />}/>
                  <Route key="App" path={"/template/:template"} element={<App />}/>
                </Routes>
              </BrowserRouter>
          </QueryClientProvider>
        </ThemeProvider>
      </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
