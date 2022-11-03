import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC, PREFIX_CREATE_USER} from "../configs";
import { STATUS_CODE_CONFLICT, STATUS_CODE_CREATED, STATUS_CODE_BAD_REQUEST, STATUS_CODE_INTERNAL_SERVER_ERROR } from "../constants";
import { Link } from "react-router-dom";
import logo from '../components/cs3219logo-transparent.png';

const rootStyle = {
    backgroundColor: "#f8f8ff",
    height: '100vh',
    overflow: "auto",
}

function SignupPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState("error")
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isSignupSuccess, setIsSignupSuccess] = useState(false);

    const handleSignup = async () => {
        setIsSignupSuccess(false);
        const res = await axios
        .post(URL_USER_SVC + PREFIX_CREATE_USER, { email, username, password }, { withCredentials: true })
        .catch((err) => {
            if (err.response.status === STATUS_CODE_BAD_REQUEST
                && (username === "" || password === "" || email === "")) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage("Missing fields!")
                console.log("Username or password is missing");
            } else if (err.response.status === STATUS_CODE_BAD_REQUEST
                && err.response.data.message.includes("Password")) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage("Password does not meet requirements!")
            } else if (err.response.status === STATUS_CODE_BAD_REQUEST
                && err.response.data.message.includes("Email")) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage("Invalid email format!")
            } else if (err.response.status === STATUS_CODE_CONFLICT
                && err.response.data.message.includes("Username")) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage(`Username ${username} already exist in the database!`)
            } else if (err.response.status === STATUS_CODE_CONFLICT
                && err.response.data.message.includes("Email")) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage(`Email already exist in the database!`)
            } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                setSeverity("error")
                setOpenAlert(true)
                setMessage(`Database failure when creating new account!`)
            }
        });
        if (res && res.status === STATUS_CODE_CREATED) {
            setSuccessDialog("Account successfully created! Please go to your inbox to verify your account");
            setIsSignupSuccess(true);
        }
    };

    const closeDialog = () => setIsDialogOpen(false);

    const setSuccessDialog = (msg) => {
        setIsDialogOpen(true);
        setDialogTitle("Success");
        setDialogMsg(msg);
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
        <div style={rootStyle}>
            <Box width={"30%"} margin={"0px auto"} padding={"1rem"} alignItems="center">
                {openAlert? alert : null}
                <Box sx={{textAlign: "center"}}>
                <a href="/introduction">
                    <img src={logo} alt="logo" width="80" height="60"/>
                </a>
                </Box>
                <Typography sx={{fontFamily: "Trebuchet MS", fontSize: "0.8rem"}} marginBottom={"0.9rem"} align="center">Prepare for technical interviews with your peers</Typography>
                <Box sx={{ border: 1, boxShadow: 2, backgroundColor: "white"}} display={"flex"} flexDirection={"column"} padding={"2rem"}>
                    <Typography variant={"h5"} marginBottom={"2rem"} align="center">Sign Up</Typography>
                    <TextField
                        label="Email"
                        variant="standard"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ marginBottom: "1rem" }}
                        autoFocus
                    />
                    <TextField
                        label="Username"
                        variant="standard"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{marginBottom: "1rem"}}
                    />
                    <TextField
                        label="Password"
                        variant="standard"
                        type="password"
                        value={password}
                        helperText="Password must have length of at least 11 and must contain a number, special character, uppercase and lowercase alphabet."
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{marginBottom: "2rem"}}
                    />
                    <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                        <Typography component={Link} to="/login">Have an account? Log in here</Typography>
                        <Button sx={{fontFamily: "Arial", textTransform: "none"}} variant={"contained"} onClick={handleSignup} >Sign up</Button>
                    </Box>
                    <Dialog open={isDialogOpen} onClose={closeDialog}>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>{dialogMsg}</DialogContentText>
                            </DialogContent>
                        <DialogActions>
                        {isSignupSuccess ? (
                            <Button component={Link} to="/login">
                                Log in
                            </Button>
                        ) : (
                            <Button onClick={closeDialog}>Done</Button>
                        )}
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </div>
    );
}

export default SignupPage;
