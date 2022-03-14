import React, { useEffect, useState } from "react";
import { useStyles } from "./style";
import {
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  Typography,
} from "@material-ui/core";
import { settingsAtom, treeAtom } from "../../store";
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

  const handleClick = () => {
    const treeString = treeJsonToString({ tree: treeState, tabChar: "\t", options: settings });
    const blob = new Blob([treeString], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "structure.tree");
  };

  return (
    <div className={classes.settingsContainer}>
      <div className={classes.sliderContainer}>
        <Typography id="discrete-slider" gutterBottom>
          Tree depth: ({settings.depth})
        </Typography>
        <Slider
          min={1}
          max={maxDepth}
          defaultValue={maxDepth}
          value={settings.depth}
          onChange={handleDepthChange}
          aria-labelledby="continuous-slider"
          className={classes.slider}
        />
      </div>
      <FormGroup>
        <FormControlLabel
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
          control={
            <Checkbox
              checked={settings.hideDots}
              onChange={handleCheckboxChange}
              name="hideDots"
              color="secondary"
            />
          }
          label="Hide dot dirs and files"
        />
      </FormGroup>
      <div className={classes.buttons}>
        <CopyToClipboard
          text={treeJsonToString({ tree: treeState, tabChar: "\t", options: settings })}
        >
          <Button variant="outlined" size="small" className={classes.button}>Copy to clipboard</Button>
        </CopyToClipboard>
        <Button variant="outlined" size="small" className={classes.button} onClick={handleClick}>
          Save to file
        </Button>
      </div>
    </div>
  );
});
