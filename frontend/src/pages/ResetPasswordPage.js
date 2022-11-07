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
    Alert,
    Snackbar
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../configs";
import { STATUS_CODE_NOT_FOUND, STATUS_CODE_UNAUTHORIZED, 
    STATUS_CODE_INTERNAL_SERVER_ERROR, STATUS_CODE_OK,
    STATUS_CODE_BAD_REQUEST
} from "../constants";
import { Link, useParams } from "react-router-dom";
import '../components/UpdateAccount.css'
import logo from '../photos/cs3219logo-transparent.png';

const rootStyle = {
    backgroundColor: "#f8f8ff",
    height: '100vh',
    overflow: "auto",
}

function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isResetSuccess, setIsResetSuccess] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState("error")

    const { id, token } = useParams()

    const data = {
        id: id,
        token: token,
        newPassword: password,
    }

    const closeDialog = () => setIsDialogOpen(false);

    const setSuccessDialog = (msg) => {
        setIsDialogOpen(true);
        setDialogTitle("Success");
        setDialogMsg(msg);
    };

    const handleReset = async () => {
        setIsResetSuccess(false)
        const res = await axios.post(URL_USER_SVC + '/reset/password', data)
            .catch((err) => {
                if (err.response.status === STATUS_CODE_BAD_REQUEST
                    && data.newPassword == "") {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Missing fields!")
                } else if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Token cannot be found! Please try again!")
                } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage(`User cannot be found in the database!`)
                } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage(`Database failure when resetting password!`)
                } else if (err.response.status === STATUS_CODE_BAD_REQUEST 
                    && err.response.data.message.includes("password")) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Password does not meet requirements")
                } else if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Unable to reset password! Please try again")
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            setSuccessDialog("Reset successfully! You can now log in");
            setIsResetSuccess(true)
        }
    }

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
                    <Typography variant={"h5"} marginBottom={"2rem"} align="center">Reset Password</Typography>
                    <TextField
                        label="Password"
                        variant="standard"
                        type="password"
                        value={password}
                        helperText="New password must have length of at least 11 and must contain a number, special character, uppercase and lowercase alphabet."
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{marginBottom: "2rem"}}
                    />
                    <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                        <Button sx={{fontFamily: "Arial", textTransform: "none"}} variant={"contained"} onClick={handleReset}>Reset</Button>
                    </Box>

                    <Dialog open={isDialogOpen} onClose={closeDialog}>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{dialogMsg}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        {isResetSuccess ? (
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
    )
}

export default ResetPasswordPage;