import { useRef, useState, useEffect } from "react";
import { useStyles } from "./style";
import ReactFlow, { addEdge } from "react-flow-renderer/nocss";
import "react-flow-renderer/dist/style.css";
import "react-flow-renderer/dist/theme-default.css";

import { Handle, Position } from "react-flow-renderer/nocss";
import { Button, Typography } from "@material-ui/core";

const CustomNode = ({ data }: any) => {

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>(data.label);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (isEditing) {
      ref.current.focus();
    }
  }, [isEditing, ref]);

  const handleHandleDoubleClick = () => {    
    ref.current && ref.current.focus();
    setIsEditing(!isEditing);
  }
  
  return <div style={{ padding: 12 }} onDoubleClick={handleHandleDoubleClick}>
    <Handle
      type="source"
      position={Position.Top}
    />
    {isEditing ?
      <form onSubmit={(e) => {
        e.preventDefault();
        setIsEditing(false);
        setValue(value)
      }}>
      <input
        ref={ref}
        onBlur={() => {setIsEditing(false)}}
        value={value}
        onChange={(event: any) => setValue(event.target.value)}
      />
      </form>
     :
      <Typography>{value}</Typography>    
    }
  </div>
}

const defaultElements = [
  {
    id: "1",
    type: "customNode",
    data: { label: "src" },
    position: { x: 110, y: 25 },
  },  
  {
    id: "2",    
    data: { label: "Components" },
    position: { x: 110, y: 125 },
  },
  // connecteed lines like dis
  { id: "e1-2", source: "1", target: "2", animated: false },
];

export const ModelPanel = () => {
  const classes = useStyles();
  const [nodes, setNodes] = useState<any>(defaultElements);

  const handleInsertNode = () => {
    const nodesClone = [...nodes];
    const id = nodesClone.length + 1;

    nodesClone.push({
      id: `${id}`,
      type: "default",
      data: { label: "Minecraft" },
      position: { x: 0, y: 0 }
    });

    setNodes(nodesClone);
  }

  const handleDeleteNode = () => {
    const nodesClone = [...nodes];



  }

  const onConnect = (params: any) => setNodes((els: any) => addEdge(params, els));

  return (
    <div className={classes.modelContainer}>
      <Button onClick={handleInsertNode}>Add Node</Button>
      <ReactFlow 
        elementsSelectable
        nodesDraggable
        nodesConnectable
        nodeTypes={{
          customNode: CustomNode
        }}
        onConnect={onConnect}
        elements={nodes} 
      />
    </div>
  )
}