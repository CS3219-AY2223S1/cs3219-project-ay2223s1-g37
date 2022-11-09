import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  Icon,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {matchingSocket} from "../utils/Socket.js";
import './SelectDifficulty.css'
import leetcode from '../photos/leetcode.png'
import hackerrank from '../photos/hackerrank.png'
import hackerearth from '../photos/hackerearth.png'
import coderbyte from '../photos/coderbyte.png'


function SelectDifficultyPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isConnected, setIsConnected] = useState(matchingSocket.connected);

  const handleSelect = (event) => {
    setDifficulty(event.target.value);
  };

  const nextClicked = () => {
    if (difficulty === "") {
      setIsDialogOpen(true);
      setDialogTitle("Error");
      setDialogMsg("Please select a difficulty level to continue");
      return;
    }

    sendMatch(difficulty);
  };

  const sendMatch = (difficulty) => {
    let username1 = sessionStorage.getItem("username");
    if (isConnected) matchingSocket.emit("match", { username1, difficulty });
  };

  const routeToNext = useCallback(
    (isMatchCreated, userInfo) => {
      if (isMatchCreated) {
        navigate("/countdown", { state: userInfo });
      } else {
        setIsDialogOpen(true);
        setDialogTitle("Error");
        setDialogMsg("Please try again");
      }
    },
    [navigate]
  );

  const getUsername = () => {
    return sessionStorage.getItem('username')
  }

  const closeDialog = () => setIsDialogOpen(false);

  useEffect(() => {
    matchingSocket.on("connect", () => {
      setIsConnected(true);
    });

    matchingSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // userInfo contains the DB entry ID of successfully created user
    matchingSocket.on("matchCreationSuccess", (userInfo) => {
      routeToNext(true, userInfo);
    });

    matchingSocket.on("matchCreationFailure", () => {
      routeToNext(false);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      matchingSocket.off("matchCreationSuccess");
      matchingSocket.off("matchCreationFailure");
    };
  }, [routeToNext]);

  return (
    <div>
      <Typography variant={"h3"} 
        style={{ display: 'flex', justifyContent: 'center', padding: '20px'}}
      >
        Welcome back User {getUsername()}!
      </Typography>
      <Grid container spacing={2}>
        <Grid item lg={4} md={6}>
          <Box 
            className="instructions"
            display={"flex"}
            flexDirection={"column"}
            marginBottom={'20px'}
            padding={"4rem"}
          >
            <Typography variant={"h6"} marginBottom={"2rem"}>
                How to use PeerPrep:
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                1. To use PeerPrep, select the difficulty that you want to challenge
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                2. After selecting, you will be brought to a waiting room to wait for 30s 
                while we match you to an appropriate peer
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                3. After finding a match, both you and your peer will be brought to a coding room 
                where a coding interview will be simulated with one of you being the interviewee 
                and the other being the interviewer
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                4. Depending on the difficulty selected, after the time is up, the roles will be switched in which
                the interviewer will become the interviewee and vice-versa
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                5. After the entire process is done, you can either choose to do another coding interview 
                with the same peer or leave the room
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                6. In the event that we are unable to find a match for you, you will be brought back
                to the home page
            </Typography>
            <Typography variant={"h7"} marginBottom={"1rem"}>
                7. In the event that one of you leave the coding interview room halfway, you will be brought back
                to the home page
            </Typography>
          </Box>
        </Grid>
        <Grid item lg={8} md={6}>
          <Grid item xs={12}>
              <Box
              display={"flex"}
              flexDirection={"column"}
              width={"75%"}
              margin={"0px auto"}
              padding={"4rem"}
              className="main"
            >
              <Typography variant={"h6"} marginBottom={"2rem"}>
                Select your difficulty:
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="label">Difficulty</InputLabel>
                <Select
                  labelId="label"
                  id="select"
                  label="Difficulty"
                  value={difficulty}
                  onChange={handleSelect}
                >
                  <MenuItem value={"Easy"}>Easy</MenuItem>
                  <MenuItem value={"Medium"}>Medium</MenuItem>
                  <MenuItem value={"Hard"}>Hard</MenuItem>
                </Select>
              </FormControl>

              <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
                sx={{ marginTop: 5 }}
              >
                <Button variant={"outlined"} onClick={nextClicked}>
                  Next
                </Button>
              </Box>

              <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                  <DialogContentText>{dialogMsg}</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeDialog}>Done</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              display={"flex"}
              flexDirection={"column"}
              width={"75%"}
              margin={"30px auto"}
              padding={"4rem"}
              className="resources"
            >
              <Typography variant={"h6"} marginBottom={"2rem"}>
                List of resources:
              </Typography>
              <Link href="https://leetcode.com" underline="none">
                <Typography className="links">
                   <Icon style={{ paddingRight: '10px' }}>
                    <img src={leetcode} alt='' height={25} width={25}/>
                  </Icon>
                  Leetcode
                </Typography>
              </Link>
              <Link href="https://www.hackerrank.com" underline="none">
                <Typography className="links">
                   <Icon style={{ paddingRight: '10px' }}>
                    <img src={hackerrank} alt='' height={25} width={25}/>
                  </Icon>
                  HackerRank
                </Typography>
              </Link>
              <Link href="https://www.hackerearth.com" underline="none">
                <Typography className="links">
                   <Icon style={{ paddingRight: '10px' }}>
                    <img src={hackerearth} alt='' height={25} width={25}/>
                  </Icon>
                  Hackerearth
                </Typography>
              </Link>
              <Link href="https://coderbyte.com" underline="none">
                <Typography style={{display: 'flex', justifyContent: 'flex-start'}}>
                   <Icon style={{ paddingRight: '10px' }}>
                    <img src={coderbyte} alt='' height={25} width={25}/>
                  </Icon>
                  coderbyte
                </Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default SelectDifficultyPage;
