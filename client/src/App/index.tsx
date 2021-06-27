import { HomeView } from "../HomeView";
import { Header } from "./Header";
import { useStyles } from "./style";

export const App = () => {
  useStyles();
  return (
    <>
      {/* <Header /> */}
      <HomeView />
    </>
  );
}

export default App;
