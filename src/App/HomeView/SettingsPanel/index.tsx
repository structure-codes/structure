import React, { useEffect, useState } from "react";
import { useStyles } from "./style";
import { Button, Checkbox, FormGroup, FormControlLabel, Slider } from "@material-ui/core";
import { baseTreeAtom, settingsAtom, treeAtom } from "../../../store";
import { useRecoilState, useRecoilValue } from "recoil";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { TreeType, treeJsonToString } from "@structure-codes/utils";
import { saveAs } from "file-saver";

const getMaxDepth = (tree: TreeType[]): number => {
  let maxDepth = 0;
  const descendTree = (tree: TreeType[], depth: number) => {
    tree.forEach(branch => {
      return branch.children ? descendTree(branch.children, depth + 1) : null;
    });
    maxDepth = Math.max(depth, maxDepth);
  };
  descendTree(tree, maxDepth);
  return maxDepth;
};

export const SettingsPanel = React.memo(() => {
  const classes = useStyles();
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const baseTree = useRecoilValue(baseTreeAtom);
  const treeState = useRecoilValue(treeAtom);
  const [maxDepth, setMaxDepth] = useState(0);

  const handleDepthChange = (event: React.ChangeEvent<{}> | null, value: any) => {
    setSettings({
      ...settings,
      depth: value,
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    const newDepth = getMaxDepth(treeState);
    setMaxDepth(newDepth);
    if (settings.depth < 0) handleDepthChange(null, newDepth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeState]);

  const handleSave = () => {
    const treeString = treeJsonToString({ tree: treeState, tabChar: "\t", options: settings });
    const blob = new Blob([treeString], { type: "text/plain;charset=utf-8" });

    const stringRe = "[A-Za-z0-9-_.]+";
    const re = new RegExp(
      `https://github.com/(?<owner>${stringRe})/(?<repo>${stringRe})((/tree)?/(?<branch>${stringRe}))?`
    );
    const groups = baseTree.match(re)?.groups;

    const fileName = baseTree.startsWith("http") ? groups?.repo : baseTree;
    saveAs(blob, `${fileName || "structure"}.tree`);
  };

  return (
    <div className={classes.settingsContainer}>
      <div className={classes.sliderContainer}>
        <div className={classes.sliderHead}>
          <span className={classes.sliderLabel}>Tree depth</span>
          <span className={classes.sliderValue}>{settings.depth > 0 ? settings.depth : "all"}</span>
        </div>
        <Slider
          min={1}
          max={maxDepth}
          defaultValue={maxDepth}
          value={settings.depth}
          onChange={handleDepthChange}
          aria-labelledby="tree-depth-slider"
          className={classes.slider}
        />
      </div>
      <FormGroup className={classes.checks}>
        <FormControlLabel
          className={classes.check}
          control={
            <Checkbox
              checked={settings.hideFiles}
              onChange={handleCheckboxChange}
              name="hideFiles"
            />
          }
          label="Hide files"
        />
        <FormControlLabel
          className={classes.check}
          control={
            <Checkbox checked={settings.hideDots} onChange={handleCheckboxChange} name="hideDots" />
          }
          label="Hide dot dirs and files"
        />
      </FormGroup>
      <div className={classes.buttons}>
        <CopyToClipboard
          text={treeJsonToString({ tree: treeState, tabChar: "\t", options: settings })}
        >
          <Button size="small" className={classes.button}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V5.5A1.5 1.5 0 0110.5 4h8A1.5 1.5 0 0120 5.5v8a1.5 1.5 0 01-1.5 1.5H15M4 10.5A1.5 1.5 0 015.5 9h8A1.5 1.5 0 0115 10.5v8A1.5 1.5 0 0113.5 20h-8A1.5 1.5 0 014 18.5z"
              />
            </svg>
            Copy
          </Button>
        </CopyToClipboard>
        <Button size="small" className={classes.button} onClick={handleSave}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"
            />
          </svg>
          Save
        </Button>
      </div>
    </div>
  );
});
