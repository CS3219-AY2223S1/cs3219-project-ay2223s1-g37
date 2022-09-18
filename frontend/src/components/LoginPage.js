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
import {STATUS_CODE_OK, STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND} from "../constants";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";


function LogininPage () {
    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoginSuccess, setIsLoginSuccess] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");

    const handleLogin = async () => {
        setIsLoginSuccess(false)
        const res = await axios.post(URL_USER_SVC, {username, password}, {withCredentials: true})
            .catch((err) => {
                if (err.response.status === STATUS_CODE_BAD_REQUEST) {
                    setErrorDialog("Username or password is missing")
                    console.log("Username or password is missing")
                }
                if (err.response.status === STATUS_CODE_NOT_FOUND) {
                    setErrorDialog(`${username} cannot be found in database!`)
                    console.log(`${username} cannot be found in database`)
                }
            })
        if (res && res.status === STATUS_CODE_OK) {
            console.log("Successfully logged in")
            setIsLoginSuccess(true)
            navigate('/home')
        }
    }

    const closeDialog = () => setIsDialogOpen(false);

    const setErrorDialog = (msg) => {
        setIsDialogOpen(true);
        setDialogTitle("Error");
        setDialogMsg(msg);
    };

    return (
        <Box display={"flex"} flexDirection={"column"} width={"30%"} margin={"0px auto"} padding={"4rem"}>
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
                <Box>
                    <Typography component={Link} to="/signup">No account? Sign up here</Typography>
                    <Typography>Forget password?</Typography>
                </Box>
                <Button variant={"outlined"} onClick={handleLogin} >Log in</Button>
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
                    {isLoginSuccess
                        ? <Button component={Link} to="/login">Log in</Button>
                        : <Button onClick={closeDialog}>Done</Button>
                    }
                </DialogActions>
            </Dialog>
        </Box>
    )
}


export default LogininPage
