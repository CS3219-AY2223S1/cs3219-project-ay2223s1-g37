import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {keyframes} from '@mui/system';
import logo from '../photos/cs3219logo-transparent.png';

const highlight = keyframes`
    100% {background-position: 0 0}
`;
const rootStyle = {
    backgroundColor: "#f8f8ff",
    height: '100vh',
    overflow: "auto",
}

function IntroductionPage() {
    return (
        <div style={rootStyle}>
            <AppBar sx={{ backgroundColor: "#f8f8ff" }} position="sticky" elevation={0}>
                    <Container maxWidth="xl">
                        <Toolbar sx={{ justifyContent: "space-between"}}>
                            <a href="/introduction">
                                <img src={logo} alt="logo" width="80" height="60" style={{marginLeft: 5 + 'rem', marginTop: 2 + 'rem'}}/>
                            </a>
                            <Box sx={{ flexGrow: 0 }}>
                            <Typography component={Link} to="/login" variant={"h7"} color="common.black" marginRight={"5rem"}>
                                Login
                            </Typography>
                            </Box>
                        </Toolbar>
                    </Container>        
            </AppBar>
            <Box margin={"0px auto"} alignItems="center">
                <Container>
                    <Typography sx={{fontFamily: "Garamond", fontWeight: "bold", fontSize: "4rem"}} marginBottom={"0.4rem"} marginTop={"2rem"} marginLeft={"17rem"} marginRight={"17rem"} align="center">
                        Success is best when it is <Typography sx={{ animation: `${highlight} 5s ease normal forwards infinite`, 
                                                        background: 'linear-gradient(90deg, #FFFF00 50%, rgba(255, 255, 255, 0) 50%)', 
                                                        backgroundSize: '200% 100%', 
                                                        backgroundPosition: '100% 0',
                                                        fontFamily: "Garamond", 
                                                        fontWeight: "bold", 
                                                        fontSize: "4rem"}} 
                                                    display="inline">shared</Typography>.
                    </Typography>
                    <Typography sx={{fontFamily: "Garamond", fontStyle: "italic", fontSize: "1.5rem"}} align="center" marginBottom={"2rem"}>- Howard Schultz</Typography>
                    <Typography sx={{fontFamily: "Helvetica Now"}} variant={"h5"} marginBottom={"2rem"} marginLeft={"20rem"} marginRight={"20rem"} align="center">
                        PeerPrep helps you to prepare for technical interviews using a peer learning system.
                    </Typography>
                    <Typography align="center">
                        <Button sx={{textTransform: "none", fontSize: "1rem"}} component={Link} to="/signup" variant="contained" endIcon={<ArrowForwardIosIcon />}>Create Account</Button>
                    </Typography>
                </Container>
            </Box>
        </div>
      );
}

export default IntroductionPage;
