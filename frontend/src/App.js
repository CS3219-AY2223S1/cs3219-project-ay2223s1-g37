import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import LogininPage from "./components/LoginPage";
import { Box } from "@mui/material";
import CountdownPage from "./components/CountdownPage";
import MatchedRoom from "./components/MatchedRoom";
import Home from "./components/Home";
import ProtectedRoute from "./utils/ProtectedRoute";
import UpdateAccount from "./components/UpdateAccount";

function App() {
  return (
    <div className="App">
      <Box display={"flex"} flexDirection={"column"}>
        <Routes>
          <Route
            exact
            path="/"
            element={<Navigate replace to="/login" />}
          ></Route>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LogininPage />} />
          <Route path="/update" element={<UpdateAccount />} />
            <Route path="home" element={<Home />} />
            <Route path="countdown" element={<CountdownPage />} />
            <Route path="matchedroom" element={<MatchedRoom />} />
          <Route path="/" element={<ProtectedRoute />}>
          </Route>
        </Routes>
      </Box>
    </div>
  );
}

export default App;
