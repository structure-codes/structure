import { HomeView } from "../HomeView";
import { useStyles } from "./style";

export const App = () => {
  useStyles();
  return (
    <>
      <HomeView />
    </>
  );
}

export default App;
