import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import LogininPage from "./components/LoginPage";
import { Box } from "@mui/material";
import CountdownPage from "./components/CountdownPage";
import MatchedRoom from "./components/MatchedRoom";
import SessionEndedPage from "./components/SessionEndedPage";
import Home from "./components/Home";
import ProtectedRoute from "./utils/ProtectedRoute";
import UpdateAccount from "./components/UpdateAccount";
import ResetPasswordPage from './components/ResetPasswordPage'
import ForgetPasswordPage from './components/ForgetPasswordPage'

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
          <Route path="/reset/:id/:token" element={<ResetPasswordPage />} />
          {/* most likely move updating password into protected routes */}
          <Route path="/update" element={<UpdateAccount />} />
          <Route path="/reset" element={<ForgetPasswordPage />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="home" element={<Home />} />
            <Route path="countdown" element={<CountdownPage />} />
            <Route path="matchedroom" element={<MatchedRoom />} />
            <Route path="sessionended" element={<SessionEndedPage />} />
          </Route>
        </Routes>
      </Box>
    </div>
  );
}

export default App;
