import { atom } from "recoil";

const defaultTree: Object = {
  "src/": {
    "App/": {
      "Header/": {},
      "Footer/": {},
    },
    "state.ts": {},
    "theme.ts": {},
  },
  "other/": {},
};

export const treeAtom = atom({
  key: "tree",
  default: defaultTree
});
