import { atom } from "recoil";

/*
  {
    "src/": [],
  }
*/

export const treeAtom = atom({
  key: "tree",
  default: {
    "src/": {},
  }
})
