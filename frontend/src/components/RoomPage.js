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
    CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../utils/Socket.js"

function RoomPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [roomInfo, setRoomInfo] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isRoomCreated, setRoomCreated] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (isConnected) socket.emit('createRoom', state)
  }, [isConnected, state])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // pairInfo contains the DB entry ID of pair
    socket.on('roomCreated', (roomInfo) => {
      setRoomInfo(roomInfo);
      setRoomCreated(true);
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pairingSuccess');
      socket.off('pairingFailure');
    };
  }, []);

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
      display={"flex"}
      flexDirection={"column"}
      width={"50%"}
      margin={"0px auto"}
      padding={"4rem"}
      //   sx={{ backgroundColor: "green" }}
    >
      {isRoomCreated ? (
        <Typography variant={"h3"} marginBottom={"2rem"}>
            {roomInfo.username1} & {roomInfo.username2}'s coding room
        </Typography>
      ) : (
        <Typography variant={"h3"} marginBottom={"2rem"}/>
      )}

      <FormControl fullWidth>
        <TextareaAutosize minRows={30} placeholder="Type your code here..." style={{padding: "0.5rem", fontSize: "1rem"}} />
      </FormControl>

      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"flex-end"}
        sx={{ marginTop: 5 }}
      >
        <Button variant={"outlined"} onClick={exitClicked}>
          Back to Home
        </Button>
      </Box>

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
        <CircularProgress style={{color: "white", margin:"0rem 1rem"}} />
        <Typography variant={"h4"} color="#fff">Loading room...</Typography>
      </Backdrop>
    </Box>
  );
}

export default RoomPage;
