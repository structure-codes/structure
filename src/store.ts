import { atom } from "recoil";
import { treeStringToJson } from "@structure-codes/utils";

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
  hideDots: boolean;
}

const defaultSettings: ISettings = {
  depth: 0,
  hideFiles: false,
  hideDots: false,
}

export const treeAtom = atom({
  key: "tree",
  default: treeStringToJson(defaultTree),
});

export const settingsAtom = atom({
  key: "settings",
  default: defaultSettings,
})
