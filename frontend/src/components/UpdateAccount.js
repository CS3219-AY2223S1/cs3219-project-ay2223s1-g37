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
    STATUS_CODE_UNAUTHORIZED, 
    STATUS_CODE_OK, 
    STATUS_CODE_INTERNAL_SERVER_ERROR,
    STATUS_CODE_BAD_REQUEST
} from "../constants";

function UpdateAccount() {
    const [username, setUsername] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isUpdateSuccess, setIsUpdateSuccess] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const data = {
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword,
    }

    const handleUpdate = async () => {
        setIsUpdateSuccess(false)
        const res = await axios.put(URL_USER_SVC, data)
            .catch((err) => {
                if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                    setErrorDialog("Incorrect password! Unable to update account")
                } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setErrorDialog(`Username: ${username} not found in database!`)
                } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                    setErrorDialog("Database failure when changing password!")
                }else if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                    setErrorDialog("Username and/or Password are missing!")
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            setSuccessDialog("Account updated successfully");
            setIsUpdateSuccess(true)
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
            <Typography variant={"h3"} marginBottom={"2rem"}>Update password</Typography>
            <TextField
                label="Username"
                variant="standard"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{marginBottom: "1rem"}}
                autoFocus
            />
            <TextField
                label="Old Password"
                variant="standard"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                sx={{marginBottom: "1rem"}}
            />
            <TextField
                label="New Password"
                variant="standard"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{marginBottom: "2rem"}}
            />
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Box
                    sx={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', flexDirection: 'column'}}
                >
                    <Typography component={Link} to="/signup">No account? Sign up here</Typography>
                    <Typography component={Link} to="/login">Click here to log in</Typography>
                </Box>
                <Button variant={"outlined"} onClick={handleUpdate} >Log in</Button>
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
                    {isUpdateSuccess
                        ? <Button component={Link} to="/login">Update</Button>
                        : <Button onClick={closeDialog}>Done</Button>
                    }
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default UpdateAccount;