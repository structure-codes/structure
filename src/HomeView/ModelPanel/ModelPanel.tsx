import React from "react";
import { useRecoilValue } from "recoil";
import { treeAtom, settingsAtom } from "../../store";
// import { treeJsonToNodes } from "../../tree";
import { useStyles } from "./style";
// import { Tree } from "react-organizational-chart";
import Tree from "react-d3-tree";
import "./tree.css";

// Here we're using `renderCustomNodeElement` render a component that uses
// both SVG and HTML tags side-by-side.
// This is made possible by `foreignObject`, which wraps the HTML tags to
// allow for them to be injected into the SVG namespace.
const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
}: any) => (
  <g>
    <circle onClick={toggleNode} r={15}></circle>
    {/* `foreignObject` requires width & height to be explicitly set. */}
    <foreignObject width={100} height={100}>
      <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
    </foreignObject>
  </g>
);

export const ModelPanel = React.memo(() => {
  const classes = useStyles();
  const treeState = useRecoilValue(treeAtom);
  const settings = useRecoilValue(settingsAtom);

  const nodes = { name: "root", children: treeState };

  return (
    <Tree
      data={nodes}
      orientation="vertical"
      pathFunc="step"
      rootNodeClassName="node__root"
      branchNodeClassName="node__branch"
      leafNodeClassName="node__leaf"
      renderCustomNodeElement={(rd3tProps) =>
        renderForeignObjectNode({ ...rd3tProps })
      }
    />
  );
});
