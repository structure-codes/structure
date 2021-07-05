import { makeStyles } from "@material-ui/core/styles";

// TODO: use theme
export const useStyles = makeStyles({
  modelContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },

  "@global .react-flow__node-input": {
    background: "#1c1c1c",
    borderColor: "#000",
    color: "#fff",
    fontSize: 20
  },
  "@global .react-flow__node": {
    background: "#1c1c1c",
    borderColor: "#000",
    color: "#fff",
    fontSize: 20,
    boxShadow: "none",    
  },
  "@global .react-flow__node.selected": {    
    borderColor: "#fff",
  },
  root: {
    border: "1px solid #000",
    padding: "6px 12px 6px 12px",
  },
  isSelected: {
    borderColor: "#fff",
  }
})