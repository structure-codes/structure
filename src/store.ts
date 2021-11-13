import { atom } from "recoil";
import { treeStringToJson } from "./tree";

const defaultTree: string = `├── api
│	└── src
├── public
└── src
	├── AboutView
	├── App
	│	└── Header
	├── HomeView
	│	├── CodePanel
	│	├── Dropdown
	│	├── ModelPanel
	│	└── SettingsPanel
	└── WelcomeModal`;

export interface ISettings {
  depth: number;
  hideFiles: boolean;
  hideDotDirs: boolean;
}

const defaultSettings: ISettings = {
  depth: -1,
  hideFiles: false,
  hideDotDirs: false,
}

export const treeAtom = atom({
  key: "tree",
  default: treeStringToJson(defaultTree),
});

export const settingsAtom = atom({
  key: "settings",
  default: defaultSettings,
})
