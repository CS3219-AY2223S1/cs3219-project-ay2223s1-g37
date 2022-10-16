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
  Snackbar,
  IconButton,
  Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { 
  STATUS_CODE_BAD_REQUEST, 
  STATUS_CODE_INTERNAL_SERVER_ERROR,
  STATUS_CODE_OK
} from "../constants"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { matchingSocket, collabSocket } from "../utils/Socket.js";
import axios from 'axios'
import { URL_QUESTION_SVC } from "../configs.js";

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
  const [questionHistory, setQuestionHistory] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error");
  const [question, setQuestion] = useState({"_id": "", "name": "", "description": "", "category": "", "difficulty": "", "url": ""});

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
      //setQuestionHistory(location.state.questionHistory)
      getQuestion();
      console.log(question)
      console.log(roomInfo.difficulty)
      console.log(questionHistory)
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
    if (timeLeft === 0) {
      navigate("/sessionended", {
        state: {
          matchEntry: matchEntry,
          roomInfo: roomInfo,
          questionHistory: questionHistory,
        },
      });
    } else {
      const timer =
        timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const getQuestion = async() => {
      const response = await axios.post(URL_QUESTION_SVC, { difficulty: roomInfo.difficulty.toLowerCase(), questionHistory: questionHistory }, { withCredentials: true }).catch((err) => {
          if (err.response.status === STATUS_CODE_BAD_REQUEST && (!roomInfo.difficulty || !questionHistory)) {
            setSeverity("error")
            setOpenAlert(true)
            setMessage("Missing fields!")
            if (!roomInfo.difficulty) {
              console.log("Difficulty missing")
              console.log(!questionHistory)
            }
            console.log("Difficulty field or Question History field is missing");
          } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
            setSeverity("error")
            setOpenAlert(true)
            setMessage("Missing fields!")
            console.log("Database failure when retrieving question!")
          }
      })
      if (response && response.status === STATUS_CODE_OK) {
        const data = response.data;
        if (data.question) {
          setQuestion(data.question);
          setQuestionHistory(arr => {return [...arr, data.question.string_id]});
          setSeverity("success")
          setOpenAlert(false)
          setMessage("Question received successfully")
          console.log("Question received successfully");
        } else {
          setSeverity("success")
          setOpenAlert(true)
          setMessage("All questions of current difficulty has been completed.")
          console.log("No more questions of specified difficulty");
          setTimeout(() => {
            navigate('/home')
          }, 2000)
        }
      }
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

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <Box width={"90%"} alignSelf={"center"} padding={"2rem 0px"}>
      {openAlert ? (<Grid item>{alert}</Grid>) : (
      isRoomCreated ? (
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

          <Grid item xs={6}>
            <Typography fontSize={"2rem"} fontWeight="bold">
              {question.name}
            </Typography>
            <Typography fontSize={"1.5rem"}>
              {question.description}
            </Typography>

            <Typography fontSize={"1rem"} paddingTop={"1rem"}>
              Time left: {Math.floor(timeLeft / 60)} mins {timeLeft % 60} secs
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid item></Grid>
      ))}

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
