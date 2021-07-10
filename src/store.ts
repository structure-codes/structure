import { atom } from "recoil";
import { treeStringToJson } from "./tree";

const defaultTree: string = `├── client
|	├── public
|	|	└── templates
|	└── src
|		├── AboutView
|		├── App
|		|	└── Header
|		├── HomeView
|		|	├── CodePanel
|		|	├── Dropdown
|		|	├── ModelPanel
|		|	└── SettingsPanel
|		└── WelcomeModal
├── examples
└── server
	├── dist
	└── src`;

export const treeAtom = atom({
  key: "tree",
  default: treeStringToJson(defaultTree)
});

export const settingsAtom = atom({
  key: "settings",
  default: {
    depth: 5,
  }
})
