import { Tree, TreeNode } from "react-organizational-chart";
import { useRecoilValue } from "recoil";
import { treeAtom, settingsAtom } from "../../store";
import { useStyles } from "./style";

const Leaf = ({ label }: { label: string }) => {
  return ( 
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        display: "flex",
        border: "1px solid #fff",
        borderRadius: 4,
        padding: 8,
        backgroundColor: "#4f3e5c"
      }}>{label}</div>
    </div>
  );
};

export const ModelPanel = () => {
  const classes = useStyles();
  const treeState = useRecoilValue(treeAtom);
  const settings = useRecoilValue(settingsAtom);

  const getNodes = (tree: any, depth: number): any => {
    if (depth > settings.depth) return;
    return Object.entries(tree).map(([key, children]) => {
      return <TreeNode label={<Leaf label={key} />}>{getNodes(children, depth + 1)}</TreeNode>;
    });
  };

  const nodes = getNodes(treeState, 1);
  return (
    <div className={classes.modelContainer}>
      <Tree label={null} lineColor="#fff">
        {nodes}
      </Tree>
    </div>
  );
};
