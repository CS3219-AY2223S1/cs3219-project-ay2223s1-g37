import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupPage from "./components/SignupPage";
import SelectDifficultyPage from "./components/SelectDifficultyPage";
import LogininPage from './components/LoginPage';
import { Box } from "@mui/material";
import CountdownPage from "./components/CountdownPage";

function App() {

  return (
    <div className="App">
      <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
          <Routes>
            <Route
              exact
              path="/"
              element={<Navigate replace to="/signup" />}
            ></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/difficulty" element={<SelectDifficultyPage />} />
            <Route path="/login" element={<LogininPage/>}/>
            <Route path="/countdown" element={<CountdownPage />} />
          </Routes>
      </Box>
    </div>
  );
}

export default App;
