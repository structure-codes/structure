import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { treeAtom, templateAtom } from "../../store";
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
        {nodeDatum.name} {numChildren > 0 && isCollapsed && `(+${numChildren})`}
      </text>
    </g>
  );
};

const defaultTranslate = { x: 0, y: 0 }
export const ModelPanel = React.memo(() => {
  const treeState = useRecoilValue(treeAtom);
  const selectedTemplate = useRecoilValue(templateAtom);
  const nodes = { name: "root", children: treeState };

  const [translate, setTranslate] = useState(defaultTranslate);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [origin, setOrigin] = useState(defaultTranslate);
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setOrigin({ x: width / 2, y: height / 2 });
      setTranslate({ x: width / 2, y: height / 2 });
      setDimensions({ width, height });
    }
  }, []);
  
  useEffect(() => {
    setTranslate(origin);
  }, [selectedTemplate, setTranslate, origin]);

  const onUpdate = ({translate: nodeTranslate, zoom}: any) => {
    setTranslate(nodeTranslate);
    setZoom(zoom);
  }


  return (
    <div style={{ height: "100%", width: "100%" }} ref={containerRef}>
      <Tree
        data={nodes}
        dimensions={dimensions}
        translate={translate}
        zoom={zoom}
        orientation="vertical"
        onUpdate={onUpdate}
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
