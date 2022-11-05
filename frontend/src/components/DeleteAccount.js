import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    DialogContentText,
    TextField,
    DialogContent,
    Snackbar,
    IconButton,
    Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios'
import { URL_USER_SVC } from "../configs"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { 
    STATUS_CODE_BAD_REQUEST, 
    STATUS_CODE_INTERNAL_SERVER_ERROR,
    STATUS_CODE_NOT_FOUND,
    STATUS_CODE_OK,
    STATUS_CODE_UNAUTHORIZED
} from "../constants"
import './UpdateAccount.css'

function DeleteAccount(props) {
    const navigate = useNavigate()
    const { open, close } = props
    const[username, setUsername] = useState("")
    const[password, setPassword] = useState("")
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState("error")

    const handleDelete = async () => {
        const data = {
            username: username,
            password: password
        }
        const res = await axios.delete(URL_USER_SVC, {data, withCredentials: true})
            .catch((err) => {
                    if (err.response.status === STATUS_CODE_BAD_REQUEST
                        && (username === "" || password === "")) {
                        setSeverity("error")
                        setOpenAlert(true)
                        setMessage("Missing fields!")
                        console.log("Username or password is missing");
                    }else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                        setSeverity("error")
                        setOpenAlert(true)
                        setMessage("Database failure when deleting account!")
                        console.log("Database failure when deleting account!")
                    } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                        setSeverity("error")
                        setOpenAlert(true)
                        setMessage(`Username: ${username} not found in database!`)
                    } else if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                        setSeverity("error")
                        setOpenAlert(true)
                        setMessage("Incorrect password! Unable to delete account")
                        console.log('Incorrect password! Unable to delete account')
                    } else if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                        setSeverity("error")
                        setOpenAlert(true)
                        setMessage("Unauthorized!")
                        setTimeout(() => {
                            navigate('/login')
                        }, 2000)
                    }
                })

        if (res && res.status === STATUS_CODE_OK) {
            console.log("Successfully deleted")
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('username')
            setSeverity("success")
            setOpenAlert(true)
            setMessage(`Account successfully deleted! Redirecting to login page...`)
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
            <DialogTitle>Are you sure about deleting the account?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                To delete this account, please enter both your email and your password.
                </DialogContentText>
                <TextField
                label="Username"
                variant="standard"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                />
                <TextField
                    label="Password"
                    variant="standard"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close} >Cancel</Button>
                <Button onClick={handleDelete} color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteAccount;