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
  Alert,
} from "@mui/material";
import Chat from "../components/Chat";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
  STATUS_CODE_OK,
} from "../constants";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { matchingSocket, collabSocket, chatSocket } from "../utils/Socket.js";
import axios from "axios";
import { URL_QUESTION_SVC } from "../configs.js";

function MatchedRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const matchEntry = location.state.matchEntryId;
  // console.log("matchEntry: " + JSON.stringify(matchEntry));

  const chatRef = useRef(null);
  const [documentContent, setDocumentContent] = useState("");
  const [roomInfo, setRoomInfo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isFinishClicked, setIsFinishClicked] = useState(false);
  const [isMatchingConnected, setIsMatchingConnected] = useState(
    matchingSocket.connected
  );
  const [isCollabConnected, setIsCollabConnected] = useState(
    collabSocket.connected
  );
  const [isRoomCreated, setRoomCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Number.MAX_VALUE);
  const [isInterviewer, setIsInterviewer] = useState(true);
  const [qnHist, setQnHist] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error");
  const [question, setQuestion] = useState({
    _id: "",
    name: "",
    description: "",
    category: "",
    difficulty: roomInfo.difficulty,
    url: "",
  });
  const [userLeft, setUserLeft] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    collabSocket.emit("createRoom", matchEntry);
  }, []);

  const getQnHistArr = (qnHistStr) => {
    const questionHistArr = qnHistStr.split(",");
    questionHistArr.pop();

    return questionHistArr;
  };

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
      setRoomInfo(room);
      setRoomCreated(true);
      setTimeLeft(room.allocatedTime);
      setIsInterviewer(room.interviewer === sessionStorage.getItem("username"));
      setQnHist(getQnHistArr(room.questionHistory));
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

    collabSocket.on("questionSet", ({ question, questionHistory }) => {
      // console.log("question has been set");
      // console.log(question);
      // console.log(getQnHistArr(questionHistory));
      setQuestion(question);
      setQnHist(getQnHistArr(questionHistory));
    });

    // One of the users chose to left the session
    collabSocket.on("oneUserLeft", () => {
      setUserLeft(true);
      setTimeLeft(0);
    });

    // When the interviewee has confirmed to finish the session early
    collabSocket.on("intervieweeConfirmedFinish", (data) => {
      navigate("/sessionended", {
        state: {
          matchEntry: data.matchEntry,
          roomInfo: data.roomInfo,
          answerUrl: question.url
        },
      });
    });

    chatSocket.on("hasNewMessage", () => {
      setHasNewMessage(true);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      collabSocket.off("connect");
      collabSocket.off("disconnect");
      collabSocket.off("roomCreationSuccess");
      collabSocket.off("roomCreationFailure");
      collabSocket.off("documentUpdated");
      collabSocket.off("questionSet");
      collabSocket.off("intervieweeConfirmedFinish");
    };
  }, []);

  useEffect(() => {
    // Reduce timeLeft by calling setTimeLeft function 1 every second (1000ms)
    if (timeLeft === 0 && userLeft === false) {
      navigate("/sessionended", {
        state: {
          matchEntry: matchEntry,
          roomInfo: roomInfo,
          answerUrl: question.url,
        },
      });
    } else {
      const timer =
        timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const getQuestion = async () => {
    const response = await axios
      .post(
        URL_QUESTION_SVC,
        { difficulty: roomInfo.difficulty, questionHistory: qnHist },
        { withCredentials: true }
      )
      .catch((err) => {
        if (
          err.response.status === STATUS_CODE_BAD_REQUEST &&
          (!roomInfo.difficulty || !qnHist)
        ) {
          setSeverity("error");
          setOpenAlert(true);
          setMessage("Missing fields!");
          if (!roomInfo.difficulty) {
            console.log("Difficulty missing");
            console.log(!qnHist);
          }
          console.log("Difficulty field or Question History field is missing");
        } else if (err.response.status === STATUS_CODE_INTERNAL_SERVER_ERROR) {
          setSeverity("error");
          setOpenAlert(true);
          setMessage("Missing fields!");
          console.log("Database failure when retrieving question!");
        }
      });
    console.log(response);

    if (response && response.status === STATUS_CODE_OK) {
      const data = response.data;

      if (data.question) {
        // console.log("collab socket connected? " + isCollabConnected);
        // console.log("roomId: " , roomInfo.id, " question:");
        // console.log(data.question);

        // Save question in room DB via collab service
        collabSocket.emit("setQuestion", {
          roomId: roomInfo.id,
          question: data.question,
        });

        // setQuestion(data.question);
        // setQuestionHistory(arr => {return [...arr, data.question.string_id]});
        setSeverity("success");
        setOpenAlert(false);
        setMessage("Question received successfully");
        console.log("Question received successfully");
      } else {
        setSeverity("success");
        setOpenAlert(true);
        setMessage("All questions of current difficulty has been completed.");
        console.log("No more questions of specified difficulty");
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (isRoomCreated) {
      console.log(qnHist);
      console.log(roomInfo.difficulty);
      getQuestion();
    }
  }, [isRoomCreated]);

  const alert = (
    <Snackbar
      open={openAlert}
      autoHideDuration={5000}
      onClose={() => {
        setOpenAlert(false);
      }}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
            <CloseIcon />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );

  const exitClicked = () => {
    setIsDialogOpen(true);
    setDialogTitle("Are you sure you want to leave this room?");
    setDialogMsg("All progress made will be lost.");
  };

  const finishClicked = () => {
    setIsDialogOpen(true);
    setIsFinishClicked(true);
    setDialogTitle("Are you sure you have finished the question?");
    setDialogMsg("This session will end.");
  };

  const handleFinishConfirm = () => {
    collabSocket.emit("finishConfirmed", {
      roomId: roomInfo.id,
      matchEntry: matchEntry,
      roomInfo: roomInfo,
    });
    navigate("/sessionended", {
      state: {
        matchEntry: matchEntry,
        roomInfo: roomInfo,
        answerUrl: question.url
      },
    });
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

  const scrollToChat = () => {
    chatRef.current.scrollIntoView({ behavior: "smooth" });
    setHasNewMessage(false);
  };

  return (
    <Box width={"90%"} alignSelf={"center"} padding={"2rem 0px"}>
      {openAlert ? (
        <Grid item>{alert}</Grid>
      ) : isRoomCreated && !userLeft ? (
        <Grid container spacing={4}>
          <Grid item xs={8} alignSelf={"center"}>
            <Typography variant={"h3"}>
              {roomInfo.username1} & {roomInfo.username2}'s coding room
            </Typography>
            <Typography fontSize={"1rem"}>
              You ({sessionStorage.getItem("username")}) are now the{" "}
              <Box fontWeight="bold" display="inline" color="#608FB7">
                {isInterviewer ? "interviewer" : "interviewee"}
              </Box>
            </Typography>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: "flex",
              alignSelf: "center",
              justifyContent: "flex-end",
            }}
          >
            {hasNewMessage ? (
              <Button
                sx={{ marginRight: 2 }}
                variant="contained"
                startIcon={<MarkUnreadChatAltIcon />}
                onClick={scrollToChat}
              >
                Chat
              </Button>
            ) : (
              <Button
                sx={{ marginRight: 2 }}
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={scrollToChat}
              >
                Chat
              </Button>
            )}
            <Button
              variant={"outlined"}
              onClick={exitClicked}
              startIcon={<HomeIcon />}
            >
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
            <Typography fontSize={"2rem"} paddingTop={"1rem"} marginBottom={5}>
              Time left: {Math.floor(timeLeft / 60)} mins {timeLeft % 60} secs
            </Typography>
            <Typography fontSize={"2rem"} fontWeight="bold">
              {question.name}
            </Typography>
            <Typography fontSize={"1rem"} style={{ whiteSpace: "pre-wrap" }}>
              {question.description}
            </Typography>
            {!isInterviewer ? (
              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                sx={{ marginTop: 5 }}
                fullWidth
                onClick={finishClicked}
              >
                Finished!
              </Button>
            ) : null}
          </Grid>
          {/* Chat box */}
          <Grid item xs={12} sx={{ marginTop: 5 }}>
            <div ref={chatRef} />
            <Chat
              username={sessionStorage.getItem("username")}
              roomId={roomInfo.id}
            />
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyCOntent: "center",
            flexDirection: "column",
          }}
        >
          <Typography fontWeight={"bold"} fontSize={20} marginBottom={2}>
            Your partner has left the session, please start another session!
          </Typography>
          <Button
            variant={"outlined"}
            onClick={exitClicked}
            startIcon={<HomeIcon />}
          >
            Back to Home
          </Button>
        </Box>
      )}

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMsg}</DialogContentText>
        </DialogContent>
        {isFinishClicked ? (
          <DialogActions>
            <Button onClick={closeDialog}>No</Button>
            <Button onClick={handleFinishConfirm}>Yes</Button>
          </DialogActions>
        ) : (
          <DialogActions>
            <Button onClick={closeDialog}>No</Button>
            <Button onClick={handleExit}>Yes</Button>
          </DialogActions>
        )}
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
