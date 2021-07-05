import { useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";
import { CodePanel } from "./CodePanel";
import { SettingsPanel } from "./SettingsPanel";
import { ModelPanel } from "./ModelPanel";
import { useStyles } from "./style";
import { useMousePosition } from "./hooks";

const Divider = ({
  direction,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
}: {
  direction: "horizontal" | "vertical";
  onMouseDown: any;
  onMouseUp: any;
  onMouseLeave: any;
}) => {
  const dividerSize = 15;
  return (
    <div
      style={{
        width: direction === "horizontal" ? "100%" : dividerSize,
        height: direction === "horizontal" ? dividerSize : "100%",
        cursor: direction === "horizontal" ? "ns-resize" : "ew-resize",
        backgroundColor: "#000",
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={() => {}}
    />
  );
};

export const HomeView = () => {
  const classes = useStyles();
  const [leftWidth, setLeftWidth] = useState(0.25 * window.innerWidth);
  const [topHeight, setTopHeight] = useState(0.75 * window.innerHeight);
  const [isVericalDragging, setIsVerticalDragging] = useState(false);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);
  const { x, y } = useMousePosition();

  useEffect(() => {
    if (!isVericalDragging || !x) return;
    // subtract half of divider width for fat divider
    setLeftWidth(x - 7.5);
  }, [isVericalDragging, x]);

  useEffect(() => {
    if (!isHorizontalDragging || !y) return;
    // subtract half of divider width for fat divider
    setTopHeight(y - 7.5);
  }, [isHorizontalDragging, y]);

  return (
    <div className={classes.mainContainer}>
      <div className={classes.panelContainer}>
        <div className={classes.leftPanel} style={{ width: leftWidth }}>
          <CodePanel height={topHeight} />
          <Divider
            direction="horizontal"
            onMouseDown={() => setIsHorizontalDragging(true)}
            onMouseUp={() => setIsHorizontalDragging(false)}
            onMouseLeave={() => setIsHorizontalDragging(false)}
            
          />
          <SettingsPanel />
        </div>
        <Divider
          direction="vertical"
          onMouseDown={() => setIsVerticalDragging(true)}
          onMouseUp={() => setIsVerticalDragging(false)}
          onMouseLeave={() => setIsVerticalDragging(false)}
        />
        <div className={classes.rightPanel}>
          <Dropdown />
          <ModelPanel />
        </div>
      </div>
    </div>
  );
};
