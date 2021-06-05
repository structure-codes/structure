import { Dropdown } from "./Dropdown";
import { CodePanel } from "./CodePanel";
import { SettingsPanel } from "./SettingsPanel";
import { ModelPanel } from "./ModelPanel";
import { useStyles } from "./style";

export const HomeView = () => {
  const classes = useStyles();
  return (
    <div className={classes.mainContainer}>
      <div className={classes.dropdownContainer}>
        <Dropdown />
      </div>
      <div className={classes.panelContainer}>
        <div className={classes.leftPanel}>
          <CodePanel />
          <SettingsPanel />
        </div>
        <ModelPanel />
      </div>
    </div>
  )
}