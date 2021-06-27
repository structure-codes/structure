import { Tree, TreeNode } from "react-organizational-chart";
import { useRecoilValue } from "recoil";
import { treeAtom } from "../../store";

const Leaf = ({ label }: { label: string }) => {
  return <div style={{ color: "green" }}>{label}</div>;
};

export const ModelPanel = () => {
  const treeState = useRecoilValue(treeAtom);
  const getNodes = (tree: any): any => {
    return Object.entries(tree).map(([key, children]) => {
      return <TreeNode label={<Leaf label={key} />}>{getNodes(children)}</TreeNode>;
    });
  };

  const nodes = getNodes(treeState);
  return (
    <Tree label={<Leaf label="root" />} lineColor="#fff">
      {nodes}
    </Tree>
  );
};
