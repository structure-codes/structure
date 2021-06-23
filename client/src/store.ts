import { atom } from "recoil";

const defaultTree: Object = {"app/":{"Header/":{},"Footer/":{},"test":{}}};

export const treeAtom = atom({
  key: "tree",
  default: defaultTree
});
