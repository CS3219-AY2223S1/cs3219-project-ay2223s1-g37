import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    DialogContentText,
    TextField,
    DialogContent,
} 
from '@mui/material'
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

function DeleteAccount(props) {
    const navigate = useNavigate()
    const { open, close } = props
    const[username, setUsername] = useState("")
    const[password, setPassword] = useState("")


    // todo: create a pop up modal for deletion
    const handleDelete = async () => {
        const data = {
            username: username,
            password: password
        }
        const res = await axios.delete(URL_USER_SVC, {data})
            .catch((err) => {
                    if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                        // setErrorDialog("Username or password is missing")
                        console.log("Username or password is missing")
                    } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
                        console.log("Error deleting account")
                    } else if (err.response.status === STATUS_CODE_NOT_FOUND) {
                        console.log(`Username ${username} successfully deleted`)
                    } else if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                        console.log('Incorrect password! Unable to delete account')
                    }
                })

        if (res && res.status === STATUS_CODE_OK) {
            console.log("Successfully deleted")
            sessionStorage.removeItem('token')
            navigate('/login')
        }
    }

    return (
        <Dialog
            open={open}
            onClose={close}
        >
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