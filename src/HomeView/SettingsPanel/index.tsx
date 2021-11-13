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
import { treeJsonToString } from "../../tree";
import { saveAs } from "file-saver";

const getMaxDepth = (tree: Object): number => {
  let maxDepth = 0;
  const descendTree = (tree: Object, depth: number) => {
    Object.values(tree).forEach(branch => {
      return descendTree(branch, depth + 1);
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
    const treeString = treeJsonToString(treeState, settings);
    const blob = new Blob([treeString], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "structure.tree");
  };

  return (
    <div className={classes.settingsContainer}>
      <div className={classes.buttons}>
        <CopyToClipboard text={treeJsonToString(treeState, settings)}>
          <Button variant="outlined">Copy to clipboard</Button>
        </CopyToClipboard>
        <Button variant="outlined" onClick={handleClick}>
          Save to file
        </Button>
      </div>
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
        color="secondary"
        className={classes.slider}
      />
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.hideFiles}
              onChange={handleCheckboxChange}
              name="hideFiles"
              color="secondary"
            />
          }
          label="Hide files"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.hideDotDirs}
              onChange={handleCheckboxChange}
              name="hideDotDirs"
              color="secondary"
            />
          }
          label="Hide dot directories and files"
        />
      </FormGroup>
    </div>
  );
});
