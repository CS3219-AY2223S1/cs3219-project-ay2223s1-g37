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
  Grid,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { matchingSocket, collabSocket } from "../utils/Socket.js";
import axios from "axios";

function MatchedRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const matchEntry = location.state.matchEntryId;
  // console.log("matchEntry: " + JSON.stringify(matchEntry));

  const [documentContent, setDocumentContent] = useState("");
  const [roomInfo, setRoomInfo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isMatchingConnected, setIsMatchingConnected] = useState(
    matchingSocket.connected
  );
  const [isCollabConnected, setIsCollabConnected] = useState(
    collabSocket.connected
  );
  const [isRoomCreated, setRoomCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Number.MAX_VALUE);
  const [isInterviewer, setIsInterviewer] = useState(true);
  const [userLeft, setUserLeft] = useState(false);

  useEffect(() => {
    collabSocket.emit("createRoom", matchEntry);
  }, []);

  useEffect(() => {
    matchingSocket.on("connect", () => {
      setIsMatchingConnected(true);
    });

    matchingSocket.on("disconnect", () => {
      setIsMatchingConnected(false);
    });

    collabSocket.on("connect", (socket) => {
      setIsCollabConnected(true);
    });

    collabSocket.on("disconnect", () => {
      setIsCollabConnected(false);
    });

    // Listening for roomCreated event emitted from collaboration service
    collabSocket.on("roomCreationSuccess", ({ room }) => {
      // console.log("matchedRoom room: ", JSON.stringify(room));
      setRoomInfo(room);
      setRoomCreated(true);
      setTimeLeft(room.allocatedTime);
      setIsInterviewer(room.interviewer === sessionStorage.getItem("username"));
    });

    collabSocket.on("roomCreationFailure", () => {
      // Remove match object from Match DB
      if (isMatchingConnected) {
        matchingSocket.emit("endSession", matchEntry.id);
      }
      navigate("/home");
    });

    // Listens to changes in the collaboration space
    collabSocket.on("documentUpdated", (content) => {
      console.log(content);
      setDocumentContent(content);
    });

    // One of the users chose to left the session
    collabSocket.on("oneUserLeft", () => {
      setUserLeft(true);
      setTimeLeft(0);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      collabSocket.off("connect");
      collabSocket.off("disconnect");
      collabSocket.off("roomCreationSuccess");
      collabSocket.off("roomCreationFailure");
    };
  }, []);

  useEffect(() => {
    // Reduce timeLeft by calling setTimeLeft function 1 every second (1000ms)
    if (timeLeft === 0 && userLeft === false) {
      navigate("/sessionended", {
        state: {
          matchEntry: matchEntry,
          roomInfo: roomInfo,
        },
      });
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

  const handleExit = () => {
    if (isMatchingConnected) {
      matchingSocket.emit("endSession", { roomId: matchEntry.id });
    }
    if (isCollabConnected) {
      collabSocket.emit("sessionComplete", { roomId: roomInfo.id });
    }
    navigate("/home");
  };

  const updateDocument = (event) => {
    setDocumentContent(event.target.value);
    collabSocket.emit("uploadChanges", {
      roomId: roomInfo.id,
      docChanges: event.target.value,
    });
  };

  // add api for qns here
  // const questionBank = async() => {
  //   const res = await axios.post(..., { data: roomInfo.difficulty }, { withCredentials: true })
  //       .catch()

  // }

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <Box width={"90%"} alignSelf={"center"} padding={"2rem 0px"}>
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

          <Grid item xs={4} sx={{ textAlign: "right" }}>
            <Button variant={"outlined"} onClick={exitClicked}>
              Back to Home
            </Button>
          </Grid>
          {userLeft ? (
            <Typography fontSize={"h4"} style={{ color: "red" }}>
              Your partner has left the session, please start another session!
            </Typography>
          ) : (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <TextareaAutosize
                  onChange={updateDocument}
                  value={documentContent}
                  readOnly={isInterviewer}
                  minRows={30}
                  placeholder={
                    isInterviewer
                      ? "View the code here..."
                      : "Type your code here..."
                  }
                  style={{ padding: "0.5rem", fontSize: "1rem" }}
                />
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <Typography fontSize={"2rem"} fontWeight="bold">
              Question
            </Typography>
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
          <Button onClick={handleExit}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: "#000", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!isRoomCreated}
      >
        <CircularProgress
          sx={{ color: "white", margin: "0rem 1rem", marginBottom: "2rem" }}
        />
        <Typography variant={"h4"} color="#fff" sx={{ marginBottom: "2rem" }}>
          Loading room...
        </Typography>
      </Backdrop>
    </Box>
  );
}

export default MatchedRoom;
