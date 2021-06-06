import { useStyles } from "./style";
import ReactFlow from "react-flow-renderer/nocss";
// you need these styles for React Flow to work properly
import "react-flow-renderer/dist/style.css";
// additionally you can load the default theme
import "react-flow-renderer/dist/theme-default.css";

const elements = [
  {
    id: "1",
    type: "input", // input node
    data: { label: "src" },
    position: { x: 110, y: 25 },
  },
  // default node
  {
    id: "2",
    // you can also pass a React component as a label
    data: { label: "Components" },
    position: { x: 110, y: 125 },
  },
  // animated edge
  { id: "e1-2", source: "1", target: "2", animated: false },
];

export const ModelPanel = () => {
  const classes = useStyles();

  return (
    <div className={classes.modelContainer}>
      <ReactFlow elements={elements} />
    </div>
  )
}