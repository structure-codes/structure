import { useStyles } from "./style";
import { Slider, Typography } from "@material-ui/core";
import { settingsAtom } from "../../store";
import { useRecoilState } from "recoil";

export const SettingsPanel = () => {
  const classes = useStyles();
  const [settings, setSettings] = useRecoilState(settingsAtom);

  const handleChange = (event: React.ChangeEvent<{}>, value: any) => {
    setSettings({
      depth: value,
    });
  };

  return (
    <div className={classes.settingsContainer}>
      <Typography id="discrete-slider" gutterBottom>
        Tree depth: ({settings.depth})
      </Typography>
      <Slider
        min={1}
        max={10}
        value={settings.depth}
        onChange={handleChange}
        aria-labelledby="continuous-slider"
      />
    </div>
  );
};
