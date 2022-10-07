import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { URL_USER_SVC } from "../configs"
import { 
    STATUS_CODE_NOT_FOUND,  
    STATUS_CODE_OK, 
    STATUS_CODE_INTERNAL_SERVER_ERROR,
    STATUS_CODE_BAD_REQUEST
} from "../constants";

function ForgetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isEmailSentSuccess, setIsEmailSentSuccess] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleUpdate = async () => {
        setIsEmailSentSuccess(false)
        const res = await axios.post(URL_USER_SVC + '/reset', { email })
            .catch((err) => {
                if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                    setErrorDialog("Invalid email format")
                } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setErrorDialog(`Email cannot be found in database`)
                } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                    setErrorDialog("Failed to send email. Please try again later")
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            setSuccessDialog("Email to reset password is sent successfully. Please check your inbox");
            setIsEmailSentSuccess(true)
        }
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

    return (
        <Box display={"flex"} flexDirection={"column"} width={"30%"} margin={"0px auto"} padding={"4rem"}>
            <Typography variant={"h3"} marginBottom={"2rem"}>Reset Password</Typography>
            <TextField
                label="Email"
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ marginBottom: "1rem" }}
                autoFocus
            />
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box
                    sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', flexDirection: 'column'}}
                >
                    <Typography component={Link} to="/signup">No account? Sign up here</Typography>
                    <Typography component={Link} to="/login">Click here to log in</Typography>
                </Box>
                <Button variant={"outlined"} onClick={handleUpdate} >Reset</Button>
            </Box>

            <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
            >
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogMsg}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {isEmailSentSuccess
                        ? <Button component={Link} to="/login">Log in</Button>
                        : <Button onClick={closeDialog}>Done</Button>
                    }
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default ForgetPasswordPage;