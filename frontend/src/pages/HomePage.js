import {
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Tooltip,
    Typography,
    Box,
    Menu,
    MenuItem,
    Modal, Snackbar, Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { useState } from 'react'
import axios from 'axios'
import SelectDifficultyPage from '../components/SelectDifficulty'
import { useNavigate } from "react-router-dom";
import {STATUS_CODE_OK, STATUS_CODE_UNAUTHORIZED} from "../constants";
import { URL_USER_SVC } from "../configs";
import DeleteAccount from "../components/DeleteAccount"
import UpdateAccount from '../components/UpdateAccount';
import CloseIcon from "@mui/icons-material/Close";


function Home() {
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [visibleDelete, setVisisbleDelete] = useState(false);
    const [visibleUpdate, setVisisbleUpdate] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState("error")

    const showModalDelete = () => {
        setVisisbleDelete(true)
    }

    const showModalUpdate = () => {
        setVisisbleUpdate(true)
    }

    const closeModalDelete = () => {
        setVisisbleDelete(false)
    }

    const closeModalUpdate = () => {
        setVisisbleUpdate(false)
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

    const handleLogout = async () => {
        const res = await axios.post(URL_USER_SVC + '/auth', {},  { withCredentials: true })
            .catch(err => {
                if (err.response.status === STATUS_CODE_UNAUTHORIZED) {
                    setSeverity("error")
                    setOpenAlert(true)
                    setMessage("Unauthorized!")
                    setTimeout(() => {
                        navigate('/login')
                    }, 2000)
                }
            })
            if (res && res.status === STATUS_CODE_OK) {
                console.log("Successfully log out!")
                sessionStorage.removeItem('token')
                sessionStorage.removeItem('username');
                navigate('/login')
            }
    }

    const handleOpenUserMenu = (e) => {
        setAnchorElUser(e.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: '#F2F3F5',
        border: '2px',
        borderRadius: '2rem',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div style={{ height: '100%' }}>
            {openAlert? alert : null}
            <AppBar sx={{ backgroundColor: "#232F3D" }} position="sticky">
                <Container maxWidth="xl">
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Typography 
                            style={{ fontFamily: "Courier New, Courier, monospace" }} 
                        >
                            PeerPrep
                        </Typography>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="What is PeerPrep?">
                            <IconButton sx={{ color: "inherit"}} onClick={handleOpen}>
                                <QuestionMarkIcon/>
                            </IconButton>
                            </Tooltip>
                            <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    What is PeerPrep?
                                </Typography>
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                     PeerPrep is a tool to help you and your peer prepare for upcoming interview sessions, 
                                     with coding challenges ranging from easy to hard to test your skills!
                                </Typography>
                                </Box>
                            </Modal>
                            <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ color: "inherit"}}>
                                <SettingsIcon />
                            </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                                >
                                <MenuItem onClick={showModalDelete}>
                                    Delete Account
                                </MenuItem>
                                <MenuItem onClick={showModalUpdate}>Update Password</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>        
            </AppBar>
            {visibleDelete? 
                <DeleteAccount open={visibleDelete} close={closeModalDelete}/>
             : null}
            {visibleUpdate?
                <UpdateAccount open={visibleUpdate} close={closeModalUpdate}/>
            : null}
            <SelectDifficultyPage />
        </div>
    )
}

export default Home
