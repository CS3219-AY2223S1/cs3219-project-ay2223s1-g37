import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";
import {useState} from 'react'
import axios from 'axios'
import {URL_USER_SVC} from "../configs";
import {STATUS_CODE_CONFLICT, STATUS_CODE_OK} from "../constants";
import {Link} from "react-router-dom";


function LogininPage () {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoginSuccess, setIsLoginSuccess] = useState(false)

    const handleLogin = async () => {
        setIsLoginSuccess(false)
        const res = await axios.post(URL_USER_SVC, {username, password}).then((res) => res.data)
            .catch()
        if (res && res.status === STATUS_CODE_OK) {
            setIsLoginSuccess(true)
        }
        
    }

    return (
        <Box display={"flex"} flexDirection={"column"} width={"30%"} margin={"0px auto"}>
            <Typography variant={"h3"} marginBottom={"2rem"}>Log in</Typography>
            <TextField
                label="Username"
                variant="standard"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{marginBottom: "1rem"}}
                autoFocus
            />
            <TextField
                label="Password"
                variant="standard"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{marginBottom: "2rem"}}
            />
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Typography component={Link} to="/signup">No account? Sign up here</Typography>
                <Button variant={"outlined"} onClick={handleLogin} >Log in</Button>
            </Box>

            {/* <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
            >
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogMsg}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {isSignupSuccess
                        ? <Button component={Link} to="/login">Log in</Button>
                        : <Button onClick={closeDialog}>Done</Button>
                    }
                </DialogActions>
            </Dialog> */}
        </Box>
    )
}


export default LogininPage
