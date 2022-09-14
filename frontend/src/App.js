import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupPage from "./components/SignupPage";
import SelectDifficultyPage from "./components/SelectDifficultyPage";
import { Box } from "@mui/material";
import socketClient from "socket.io-client";
import CountdownPage from "./components/CountdownPage";

const SERVER = "http://127.0.0.1:8001";

function App() {
  var socket = socketClient(SERVER);

  return (
    <div className="App">
      <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={<Navigate replace to="/signup" />}
            ></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/difficulty" element={<SelectDifficultyPage />} />
            <Route path="/countdown" element={<CountdownPage />} />
          </Routes>
        </Router>
      </Box>
    </div>
  );
}

export default App;
