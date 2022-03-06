import React from "react";
import { useRecoilValue } from "recoil";
import { treeAtom, settingsAtom } from "../../store";
import { useStyles } from "./style";
import { useCenteredTree } from "../hooks";
import Tree from "react-d3-tree";
import "./tree.css";

// Here we're using `renderCustomNodeElement` render a component that uses
// both SVG and HTML tags side-by-side.
// This is made possible by `foreignObject`, which wraps the HTML tags to
// allow for them to be injected into the SVG namespace.
const renderForeignObjectNode = ({ nodeDatum, toggleNode }: any) => {
  const color =
    nodeDatum.name === "root" ? "#efe2c3" : nodeDatum.children.length > 0 ? "#9e7f4f" : "#748e40";
  const numChildren = nodeDatum.children.length;
  const isCollapsed = nodeDatum.__rd3t.collapsed;
  return (
    <g className="custom-node">
      <circle onClick={toggleNode} fill={color} r={15} />
      {/* `foreignObject` requires width & height to be explicitly set. */}
      <text fill="white" strokeWidth="1" stroke="white" x="20">
        {nodeDatum.name}
      </text>
      {numChildren > 0 && isCollapsed && (
        <text fill="white" x="20" dy="20" strokeWidth="1" stroke="white">
          +{numChildren}
        </text>
      )}
    </g>
  );
};

export const ModelPanel = React.memo(() => {
  const treeState = useRecoilValue(treeAtom);
  const nodes = { name: "root", children: treeState };
  const [dimensions, translate, containerRef] = useCenteredTree();

  return (
    <div style={{ height: "100%", width: "100%" }} ref={containerRef}>
      <Tree
        data={nodes}
        dimensions={dimensions}
        translate={translate}
        orientation="vertical"
        pathFunc="diagonal"
        pathClassFunc={() => "custom-link"}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        renderCustomNodeElement={({ nodeDatum, toggleNode }) =>
          renderForeignObjectNode({ nodeDatum, toggleNode })
        }
      />
    </div>
  );
});
