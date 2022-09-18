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
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react'
import axios from 'axios'
import SelectDifficultyPage from '../components/SelectDifficultyPage'
import { useNavigate } from "react-router-dom";
import { STATUS_CODE_OK } from "../constants";
import { URL_USER_SVC } from "../configs";


function Home() {
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleLogout = async () => {
        const res = await axios.post(URL_USER_SVC + '/auth', {},  { withCredentials: true })
            .catch(err => {
                console.log("error logging out")
            })
            if (res && res.status === STATUS_CODE_OK) {
            console.log("Successfully log out!")
            sessionStorage.removeItem('token')
            navigate('/login')
        }
    }

    const test = async () => {
        const res = await axios.get(URL_USER_SVC + '/auth', { withCredentials: true })
            .catch(err => {
                console.log("error")
            })
        console.log(res)
    }

    const handleOpenUserMenu = (e) => {
        setAnchorElUser(e.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    return (
        <div>
            <AppBar sx={{ backgroundColor: "#232F3D" }} position="sticky">
                <Container maxWidth="xl">
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <Typography>
                            PeerPrep
                        </Typography>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, color: "inherit"}}>
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
                                {/* {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))} */}
                                <MenuItem onClick={handleCloseUserMenu}>Delete Account</MenuItem>
                                <MenuItem onClick={test}>Update Password</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>        
            </AppBar>
            <SelectDifficultyPage />
        </div>
    )
}

export default Home
