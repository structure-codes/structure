import { makeStyles } from "@material-ui/core/styles";

// TODO: use theme
export const useStyles = makeStyles({
  modelContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#212121",
  },

  "@global .react-flow__node-input": {
    background: "#1c1c1c",
    color: "#fff",
    fontSize: 20
  },
  "@global .react-flow__node-default": {
    background: "#1c1c1c",
    color: "#fff",
    fontSize: 20
  }
})