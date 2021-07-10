import { useStyles } from "./style";
import { Button, Slider, Typography } from "@material-ui/core";
import { settingsAtom, treeAtom } from "../../store";
import { useRecoilState, useRecoilValue } from "recoil";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { treeJsonToString } from "../../tree";

export const SettingsPanel = () => {
  const classes = useStyles();
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const treeState = useRecoilValue(treeAtom);

  const handleChange = (event: React.ChangeEvent<{}>, value: any) => {
    setSettings({
      depth: value,
    });
  };

  return (
    <div className={classes.settingsContainer}>
      <div className={classes.buttons}>
        <CopyToClipboard text={treeJsonToString(treeState)}>
          <Button variant="outlined">Copy to clipboard</Button>
        </CopyToClipboard>
        {/* <Button variant="outlined">Export</Button> */}
      </div>
      <Typography id="discrete-slider" gutterBottom>
        Tree depth: ({settings.depth})
      </Typography>
      <Slider
        min={1}
        max={10}
        value={settings.depth}
        onChange={handleChange}
        aria-labelledby="continuous-slider"
        color="secondary"
      />
    </div>
  );
};
