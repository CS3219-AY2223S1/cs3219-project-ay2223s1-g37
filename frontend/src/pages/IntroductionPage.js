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

function IntroductionPage() {
  return (
    <div>
      <AppBar
        sx={{ backgroundColor: "#f8f8ff" }}
        position="sticky"
        elevation={0}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant={"h5"} color="common.black">
              PeerPrep
            </Typography>
            <Box sx={{ flexGrow: 0 }}>
              <Typography
                component={Link}
                to="/login"
                variant={"h7"}
                color="common.black"
              >
                Login
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        sx={{ backgroundColor: "#f8f8ff" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Container display="flex" justifyContent="center" alignItems="center">
          <Typography
            sx={{
              fontFamily: "Garamond",
              fontWeight: "bold",
              fontSize: "4rem",
            }}
            marginBottom={"2rem"}
            marginTop={"3rem"}
            marginLeft={"17rem"}
            marginRight={"17rem"}
            align="center"
          >
            Success is best when it is{" "}
            <Typography
              sx={{
                fontFamily: "Garamond",
                fontWeight: "bold",
                fontSize: "4rem",
              }}
              display="inline"
            >
              <mark>shared</mark>
            </Typography>
            .
          </Typography>
          <Typography
            sx={{ fontFamily: "Trebuchet MS" }}
            variant={"h6"}
            marginBottom={"2rem"}
            marginLeft={"20rem"}
            marginRight={"20rem"}
            align="center"
          >
            PeerPrep helps you to prepare for technical interviews using a peer
            learning system.
          </Typography>
          <Typography align="center">
            <Button
              sx={{
                fontFamily: "Arial",
                textTransform: "none",
                fontSize: "1rem",
              }}
              component={Link}
              to="/signup"
              variant="contained"
              endIcon={<ArrowForwardIosIcon />}
            >
              Create Account
            </Button>
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export default IntroductionPage;
