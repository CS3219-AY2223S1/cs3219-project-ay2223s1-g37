import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../configs";
import {
  STATUS_CODE_OK,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_NOT_FOUND,
  STATUS_CODE_UNAUTHORIZED,
  STATUS_CODE_INTERNAL_SERVER_ERROR
} from "../constants";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../components/UpdateAccount.css'

function LogininPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState("error")

  const handleLogin = async () => {
    const res = await axios
      .post(URL_USER_SVC, { username, password }, { withCredentials: true })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST
          && (username === "" || password === "")) {
          setSeverity("error")
          setOpenAlert(true)
          setMessage("Missing fields!")
          console.log("Username or password is missing");
        }
        if (err.response.status === STATUS_CODE_NOT_FOUND) {
          setSeverity("error")
          setOpenAlert(true)
          setMessage(`Username: ${username} not found in database!`)
          console.log(`${username} cannot be found in database`);
        }
        if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
          setSeverity("error")
          setOpenAlert(true)
          setMessage("Incorrect password!")
          console.log("Incorrect password!");
        }
        if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
          setSeverity("error")
          setOpenAlert(true)
          setMessage("Database failure when logging in!")
        }
      });
    if (res && res.status === STATUS_CODE_OK) {
      console.log("Successfully logged in");
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("username", username);
      navigate("/home");
    }
  };

  const alert = (
        <Snackbar 
            open={openAlert} 
            autoHideDuration={5000}
            onClose={() => {
                setOpenAlert(false);
            }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
        <Alert 
            severity={severity}
            action={
                <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                    setOpenAlert(false);
                }}
                >
                    <CloseIcon/>
                </IconButton>
            }
        >
            {message}
        </Alert>
    </Snackbar>
    )

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={"30%"}
      margin={"0px auto"}
      padding={"4rem"}
    >
      {openAlert? alert : null}
      <Typography variant={"h3"} marginBottom={"2rem"}>
        Log in
      </Typography>
      <TextField
        label="Username"
        variant="standard"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginBottom: "1rem" }}
        autoFocus
      />
      <TextField
        label="Password"
        variant="standard"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: "2rem" }}
      />
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            flexDirection: "column",
          }}
        >
          <Typography component={Link} to="/signup">
            No account? Sign up here
          </Typography>
          <Typography component={Link} to="/reset">
            Forget password?
          </Typography>
        </Box>
        <Button variant={"outlined"} onClick={handleLogin}>
          Log in
        </Button>
      </Box>
    </Box>
  );
}

export default LogininPage;
