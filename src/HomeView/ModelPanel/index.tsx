import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { treeAtom, settingsAtom } from "../../store";
import { treeJsonToNodes } from "../../tree";
import { useStyles } from "./style";
import { Tree } from "react-organizational-chart";
import { motion } from "framer-motion";

export const ModelPanel = React.memo(() => {
  const classes = useStyles();
  const treeState = useRecoilValue(treeAtom);
  const settings = useRecoilValue(settingsAtom);
  const ref = useRef<any>();
  const nodes = treeJsonToNodes(treeState, 1, settings);
  const [bounds, setBounds] = useState({
    width: 0,
  });

  useEffect(() => {
    setBounds(ref.current.getBoundingClientRect());
  }, []);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -(bounds.width / 2), right: bounds.width / 2 }}
      dragMomentum={false}
      className={classes.modelContainer}
    >
      <div style={{ display: "block", cursor: "ew-resize" }} ref={ref}>
        <Tree label={null} lineColor="#fff">
          {nodes}
        </Tree>
      </div>
    </motion.div>
  );
});
