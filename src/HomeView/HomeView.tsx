import { useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";
import { CodePanel } from "./CodePanel";
import { SettingsPanel } from "./SettingsPanel";
import { ModelPanel } from "./ModelPanel";
import { useStyles } from "./style";
import { useMousePosition } from "./hooks";
import { useTheme } from "@material-ui/styles";

const dividerSize = 6;
const Divider = ({
  direction,
  onMouseDown,
  onMouseUp,
}: {
  direction: "horizontal" | "vertical";
  onMouseDown: any;
  onMouseUp: any;
}) => {
  const [isHover, setIsHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();

  // handle the case where the mouse goes up and we miss it on the element event
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      style={{
        width: direction === "horizontal" ? "100%" : dividerSize,
        height: direction === "horizontal" ? dividerSize : "100%",
        cursor: direction === "horizontal" ? "ns-resize" : "ew-resize",
        background: `${isHover || isDragging ? theme.palette.primary.main : "rgba(0,0,0,0)"}`,
        borderTop: direction === "horizontal" ? "1px solid #646464" : "none",
        borderLeft: direction === "vertical" ? "1px solid #646464" : "none",
      }}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      onMouseDown={e => {
        onMouseDown(e);
        setIsDragging(true);
      }}
      onMouseUp={e => {
        onMouseUp(e);
        setIsDragging(false);
      }}
    />
  );
};

export const HomeView = () => {
  const classes = useStyles();
  const [leftWidth, setLeftWidth] = useState(0.25 * window.innerWidth);
  const [topHeight, setTopHeight] = useState(0.75 * window.innerHeight);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [isHorizontalDragging, setIsHorizontalDragging] = useState(false);
  const { x, y } = useMousePosition(isVerticalDragging || isHorizontalDragging);

  useEffect(() => {
    if (!isVerticalDragging || !x) return;
    // subtract half of divider width for fat divider
    setLeftWidth(x - dividerSize / 2);
  }, [isVerticalDragging, x]);

  useEffect(() => {
    if (!isHorizontalDragging || !y) return;
    // subtract half of divider width for fat divider
    setTopHeight(y - dividerSize / 2);
  }, [isHorizontalDragging, y]);

  // handle the case where the mouse goes up and we miss it on the element event handler
  useEffect(() => {
    const handleMouseUp = () => {
      setIsVerticalDragging(false);
      setIsHorizontalDragging(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className={classes.panelContainer} onMouseLeave={() => setIsVerticalDragging(false)}>
      <div
        className={classes.leftPanel}
        style={{ width: leftWidth }}
        onMouseLeave={() => setIsHorizontalDragging(false)}
      >
        <CodePanel height={topHeight} />
        <Divider
          direction="horizontal"
          onMouseDown={(e: any) => {
            e.preventDefault();
            setIsHorizontalDragging(true);
          }}
          onMouseUp={() => {
            setIsHorizontalDragging(false);
          }}
        />
        <SettingsPanel />
      </div>
      <Divider
        direction="vertical"
        onMouseDown={() => setIsVerticalDragging(true)}
        onMouseUp={() => setIsVerticalDragging(false)}
      />
      <div className={classes.rightPanel}>
        <Dropdown />
        <ModelPanel />
      </div>
    </div>
  );
};
