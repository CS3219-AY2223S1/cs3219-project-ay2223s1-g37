import {
    Alert,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Snackbar
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { URL_USER_SVC } from "../configs"
import { 
    STATUS_CODE_NOT_FOUND, 
    STATUS_CODE_UNAUTHORIZED, 
    STATUS_CODE_OK, 
    STATUS_CODE_INTERNAL_SERVER_ERROR,
    STATUS_CODE_BAD_REQUEST
} from "../constants";
import './UpdateAccount.css'

function UpdateAccount(props) {
    const navigate = useNavigate()
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState("error")
    const { open, close } = props
    const [username, setUsername] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const data = {
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword,
    }

    const handleUpdate = async () => {
        const res = await axios.put(URL_USER_SVC, data)
            .catch((err) => {
                if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Incorrect password! Unable to update account")
                } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage(`Username: ${username} not found in database!`)
                } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Database failure when changing password!")
                } else if (err.response.status === STATUS_CODE_BAD_REQUEST
                    && (username === "" || newPassword === "" || oldPassword === "")) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Missing fields!")
                } else if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("New password failed to meet requirements!")
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('username')
            setSeverity("success")
            setOpenAlert(true)
            setMessage(`Password successfully updated! Redirecting to login page...`)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
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
        <Dialog
            open={open}
            onClose={close}
        >
            {openAlert? alert : null}
            <DialogTitle>Update Account?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To update account, please enter your email, current password and your new password. You will need to re-login again after updating your password
                </DialogContentText>
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
                    helperText="New password must have length of at least 11 and must contain a number, special character, uppercase and lowercase alphabet."
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{marginBottom: "2rem"}}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close} >Cancel</Button>
                <Button onClick={handleUpdate} color="secondary">Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UpdateAccount;