import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import SelectDifficultyPage from "./components/SelectDifficultyPage";
import MatchedRoom from "./components/MatchedRoom";
import LogininPage from "./components/LoginPage";
import { Box } from "@mui/material";
import CountdownPage from "./components/CountdownPage";
import Home from "./views/Home";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <Box display={"flex"} flexDirection={"column"}>
        <Routes>
          {/* <Route
              exact
              path="/"
              element={<Navigate replace to="/login" />}
            ></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LogininPage/>}/>
            <Route path="/" element={<ProtectedRoute/>}> 
              <Route path="home" element={<Home/>}/> */}
          <Route path="selectdifficulty" element={<SelectDifficultyPage />} />
          <Route path="countdown" element={<CountdownPage />} />
          <Route path="matchedroom" element={<MatchedRoom />} />
          {/* </Route> */}
        </Routes>
      </Box>
    </div>
  );
}

export default App;
