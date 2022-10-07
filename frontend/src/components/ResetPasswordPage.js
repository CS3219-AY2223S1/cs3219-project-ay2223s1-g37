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
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../configs";
import { STATUS_CODE_NOT_FOUND, STATUS_CODE_UNAUTHORIZED, 
    STATUS_CODE_INTERNAL_SERVER_ERROR, STATUS_CODE_OK
} from "../constants";
import { Link, useParams } from "react-router-dom";

function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isResetSuccess, setIsResetSuccess] = useState(false);

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

    const setErrorDialog = (msg) => {
        setIsDialogOpen(true);
        setDialogTitle("Error");
        setDialogMsg(msg);
    };

    const handleReset = async () => {
        setIsResetSuccess(false)
        const res = await axios.post(URL_USER_SVC + '/reset/password', data)
            .catch((err) => {
                if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                    setErrorDialog("Token cannot be found! Please try again")
                } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setErrorDialog(`Username: ${id} not found in database!`)
                } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                    setErrorDialog("Database failure when resetting password!")
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            setSuccessDialog("Reset successfully! You can now log in");
            setIsResetSuccess(true)
        }
    }
    
    return (
        <Box display={"flex"} flexDirection={"column"} width={"30%"} margin={"0px auto"} padding={"4rem"}>
            <Typography variant={"h3"} marginBottom={"2rem"}>Reset Password</Typography>
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
                <Button variant={"outlined"} onClick={handleReset}>Reset</Button>
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
    )
}

export default ResetPasswordPage;