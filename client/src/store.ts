import { atom } from "recoil";

export const treeAtom = atom({
  key: "tree",
  default: {
    "src/": {
      "App/": {
        "Header/": {},
        "Footer/": {},
      },
      "state.ts": {},
      "theme.ts": {},
    },
    "other/": {},
  }
})
