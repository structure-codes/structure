import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeView } from "./HomeView";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { theme } from "./theme";
import { applyTokens } from "./tokens";
import "./index.css";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";

// Inject the design tokens onto :root before first paint (see tokens.ts).
applyTokens();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route key="Home" path={"*"} element={<HomeView />} />
              <Route key="Home" path={"/template/:template"} element={<HomeView />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
