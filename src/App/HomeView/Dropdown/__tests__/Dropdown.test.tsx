// import API mocking utilities from Mock Service Worker
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// import react-testing methods
import { render, fireEvent, screen } from "@testing-library/react";

// the component to test
import { Dropdown } from "../index";
import tree from "./sampleTree.json";
import templates from "./sampleTemplates.json";
// required libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "jotai";

// declare which API requests to mock
const server = setupServer(
  http.post("/api/github", () => HttpResponse.json(tree)),
  http.get("/api/templates", () => HttpResponse.json(templates)),
  // Selecting a template fetches its .tree text; return a valid (parseable) tree.
  http.get("/api/template/:template", () => HttpResponse.text("└── root\n  └── child"))
);

// establish API mocking before all tests; fail on any unmocked request so the
// test stays hermetic instead of hitting the real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// clean up once the tests are done
afterAll(() => server.close());

test("sends API request on search", async () => {
  const queryClient = new QueryClient();
  // arrange
  render(
    <Provider>
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Dropdown />
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );
  // act
  // In MUI v5+ Autocomplete the `combobox` role lives on the <input> itself
  // (ARIA 1.2), and the open button is a sibling at the root level.
  const input = screen.getByRole("combobox") as HTMLInputElement;

  const searchValue = "react-boiler";
  const templateValue = "react-boilerplate";
  input.focus();
  // open autocomplete dropdown menu
  screen.getByLabelText("Open").click();
  const options = await screen.findAllByRole("option");
  expect(options).toHaveLength(7);
  // assign value to input field
  fireEvent.change(input, { target: { value: searchValue } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  // select the first item
  fireEvent.keyDown(input, { key: "Enter" });
  // check the new value of the input field
  expect(input.value).toEqual(templateValue);
  // fireEvent.change(screen.getByLabelText("Link to repository"), {
  //   target: { value: "https://github.com/structure-codes/vscode-tree-language" },
  // });
  // fireEvent.click(screen.getByText("GO"));
});
