import { atom } from "recoil";

const defaultTree: Object = {"app/":{"Header/":{},"Footer/":{},"test":{}}};

export const treeAtom = atom({
  key: "tree",
  default: defaultTree
});

export const settingsAtom = atom({
  key: "settings",
  default: {
    depth: 5,
  }
})
