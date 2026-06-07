import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeView } from "./HomeView";
import { CssBaseline, ThemeProvider, StyledEngineProvider } from "@mui/material";
import { theme } from "./theme";
import { applyTokens } from "./tokens";
import "./index.css";
import { Provider } from "jotai";
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

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider>
      <StyledEngineProvider injectFirst>
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
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>
);
