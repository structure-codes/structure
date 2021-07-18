import React from "react";
import { useRecoilValue } from "recoil";
import { treeAtom, settingsAtom } from "../../store";
import { treeJsonToNodes } from "../../tree";
import { useStyles } from "./style";
import { Tree } from "react-organizational-chart";

export const ModelPanel = React.memo(() => {
  const classes = useStyles();
  const treeState = useRecoilValue(treeAtom);
  const settings = useRecoilValue(settingsAtom);

  const nodes = treeJsonToNodes(treeState, 1, settings);
  
  return (
    <div className={classes.modelContainer}>
      <Tree label={null} lineColor="#fff">
        {nodes}
      </Tree>
    </div>
  );
});
