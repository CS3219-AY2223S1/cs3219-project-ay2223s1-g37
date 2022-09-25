import {
  Box,
  Typography,
  Button,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
  Backdrop,
  CircularProgress,
  Grid
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../utils/Socket.js"

function MatchedRoom() {
    const location = useLocation();
    const matchEntry = location.state;
    console.log("matchEntry: " + JSON.stringify(matchEntry))

    const navigate = useNavigate();
    const [roomInfo, setRoomInfo] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMsg, setDialogMsg] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isRoomCreated, setRoomCreated] = useState(true)
    const [timeLeft, setTimeLeft] = useState(Number.MAX_VALUE)
    const [isInterviewer, setIsInterviewer] = useState(true)

    useEffect(() => {
      if (isConnected) socket.emit('createRoom', matchEntry)
    }, [isConnected, matchEntry])

    useEffect(() => {
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('roomCreated', (roomInfo) => {
        setRoomInfo(roomInfo);
        setRoomCreated(true);
        setTimeLeft(roomInfo.timeLeft)
      })

      return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
    }, []);

    useEffect(() => {
      // Reduce timeLeft by calling setTimeLeft function 1 every second (1000ms)
      if (timeLeft === 0) {
        setDialogTitle("Times up!");
        setDialogMsg("Would you like to switch roles and continue?")
        setIsDialogOpen(true)
      } else {
        const timer =
          timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearInterval(timer);
      }
    }, [timeLeft]);

    const exitClicked = () => {
      setIsDialogOpen(true);
      setDialogTitle("Are you sure you want to leave this room?");
      setDialogMsg("All progress made will be lost.");
    };

    const routeToNext = () => {
      navigate('/home');
    };

    const closeDialog = () => setIsDialogOpen(false);

  return (
    <Box    
      width={"90%"}
      alignSelf={"center"}
      padding={"2rem 0px"}>

      {isRoomCreated ? (
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Typography variant={"h3"}>
              {roomInfo.username1} & {roomInfo.username2}'s coding room
            </Typography>
            <Typography fontSize={"1rem"}>
              You are now the {isInterviewer ? "interviewer" : "interviewee"}
            </Typography>
          </Grid>

          <Grid item xs={4} sx={{textAlign:"right"}}>
            <Button variant={"outlined"}>
              Back to Home
            </Button>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <TextareaAutosize
                readOnly={isInterviewer}
                minRows={30}
                placeholder={isInterviewer ? "View the code here..." : "Type your code here..."}
                style={{padding: "0.5rem", fontSize: "1rem"}} />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <Typography fontSize={"2rem"} fontWeight="bold">Question</Typography>
            <Typography fontSize={"1.5rem"}>
              Question to go here...
              {roomInfo.question}
            </Typography>

            <Typography fontSize={"1rem"} paddingTop={"1rem"}>
              Time left: {Math.floor(timeLeft / 60)} mins {timeLeft % 60} secs
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid item></Grid>
      )}

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>No</Button>
          <Button onClick={routeToNext}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!isRoomCreated}
      >
        <CircularProgress sx={{color: "white", margin:"0rem 1rem", marginBottom: "2rem"}} />
        <Typography variant={"h4"} color="#fff" sx={{marginBottom: "2rem"}}>Loading room...</Typography>
      </Backdrop>
    </Box>
  );
}

export default MatchedRoom;