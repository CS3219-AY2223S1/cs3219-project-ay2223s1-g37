import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LogininPage from "./pages/LoginPage";
import { Box } from "@mui/material";
import CountdownPage from "./pages/CountdownPage";
import MatchedRoom from "./pages/MatchedRoom";
import SessionEndedPage from "./pages/SessionEndedPage";
import Home from "./pages/HomePage";
import ProtectedRoute from "./utils/ProtectedRoute";
import UpdateAccount from "./components/UpdateAccount";
import ResetPasswordPage from './pages/ResetPasswordPage'
import ForgetPasswordPage from './pages/ForgetPasswordPage'

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
