import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown } from "./Dropdown";
import { CodePanel } from "./CodePanel";
import { SettingsPanel } from "./SettingsPanel";
import { ModelPanel } from "./ModelPanel";
import { useStyles } from "./style";
import { useMousePosition } from "./hooks";
import { useMediaQuery, useTheme } from "@material-ui/core";

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

  const handleMouseOver = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => setIsHover(false), []);
  const handleMouseDown = useCallback(
    e => {
      onMouseDown(e);
      setIsDragging(true);
    },
    [onMouseDown]
  );
  const handleMouseUp = useCallback(
    e => {
      onMouseUp(e);
      setIsDragging(false);
    },
    [onMouseUp]
  );

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
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
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
  const dropdownRef: any = useRef(null);
  const theme = useTheme();
  const showModel = useMediaQuery(theme.breakpoints.up("sm"));
  
  useEffect(() => {
    if (!isVerticalDragging || !x) return;
    // subtract half of divider width for fat divider
    setLeftWidth(x - dividerSize / 2);
  }, [isVerticalDragging, x]);
  
  useEffect(() => {
    if (!isHorizontalDragging || !y) return;
    // subtract half of divider width for fat divider
    const dropdownHeight = dropdownRef.current?.clientHeight || 0;
    // TODO: FIX THIS BS WITH A REF
    setTopHeight(y - dividerSize / 2 - (shouldWrap ? 104 : 56));
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
  
  const onMouseDownVertical = useCallback(() => setIsVerticalDragging(true), []);
  const onMouseUpVertical = useCallback(() => setIsVerticalDragging(false), []);
  const onMouseLeaveVertical = useCallback(() => setIsVerticalDragging(false), []);
  
  const onMouseDownHorizontal = useCallback(() => setIsHorizontalDragging(true), []);
  const onMouseUpHorizontal = useCallback(() => setIsHorizontalDragging(false), []);
  const onMouseLeaveHorizontal = useCallback(() => setIsHorizontalDragging(false), []);
  
  // TODO: Get's kinda wrekt on instant window resize (changing in dev tools to phone size)
  const shouldWrap = leftWidth < 700;

  return (
    <div className={classes.panelContainer} onMouseLeave={onMouseLeaveVertical}>
      <div
        className={classes.leftPanel}
        style={{ width: showModel ? leftWidth : "100%" }}
        onMouseLeave={onMouseLeaveHorizontal}
      >
        <Dropdown ref={dropdownRef} wrap={shouldWrap} />
        <CodePanel height={topHeight} />
        <Divider
          direction="horizontal"
          onMouseDown={onMouseDownHorizontal}
          onMouseUp={onMouseUpHorizontal}
        />
        <SettingsPanel />
      </div>
      {showModel && (
        <>
          <Divider
            direction="vertical"
            onMouseDown={onMouseDownVertical}
            onMouseUp={onMouseUpVertical}
          />
          <div className={classes.rightPanel}>
            <ModelPanel />
          </div>
        </>
      )}
    </div>
  );
};
