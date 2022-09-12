import {BrowserRouter as Router, Routes, Route, Navigate, Link} from "react-router-dom";
import SignupPage from './components/SignupPage';
import MatchingPage from "./components/Matching";
import {Box} from "@mui/material";

function App() {
    return (
        <div className="App">
            <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
                <Router>
                    <Routes>
                        <Route exact path="/" element={<Navigate replace to="/signup" />}></Route>
                        <Route path="/signup" element={<SignupPage/>}/>
                        <Route path="/matching" element={<MatchingPage/>}/>
                    </Routes>
                </Router>
            </Box>
        </div>
    );
}

export default App;
