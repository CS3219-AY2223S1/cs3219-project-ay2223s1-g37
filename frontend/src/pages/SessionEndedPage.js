import { Typography, Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { matchingSocket, collabSocket } from "../utils/Socket.js";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";

function SessionEndedPage() {
  const location = useLocation();
  const matchEntry = location.state.matchEntry;
  const roomInfo = location.state.roomInfo;
  const questionHistory = location.state.questionHistory;
  // const roomId = 2; // TODO: REMOVE. Hardcoded temporarily
  const navigate = useNavigate();

  const [isMatchingConnected, setIsMatchingConnected] = useState(
    matchingSocket.connected
  );
  const [isCollabConnected, setIsCollabConnected] = useState(
    collabSocket.connected
  );
  const [isSessionComplete, setSessionComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userLeft, setUserLeft] = useState(false);
  const [isRoleSwitched, setIsRoleSwitched] = useState(false);

  console.log("session ended match entry: " + JSON.stringify(matchEntry));
  console.log("session ended room info: " + JSON.stringify(roomInfo));

  const handleExit = () => {
    matchingSocket.emit("endSession", { roomId: matchEntry.id });
    collabSocket.emit("sessionComplete", { roomId: roomInfo.id });
    navigate("/home");
  };

  // const handleSwitchOrRestart = () => {
  //   if (isSessionComplete) {
  //     // TODO: Handle resarting of session. Ensure both parties say YES before going to matched room
  //   } else {
  //     // TODO: Switch users
  //     navigate("/matchedroom");
  //   }
  // };

  // Navigate to next page once countdown is over and roles have been switched
  useEffect(() => {
    if (
      timeLeft === 0 &&
      isRoleSwitched === true &&
      isSessionComplete === false
    ) {
      navigate("/matchedroom", {
        state: {
          matchEntryId: matchEntry,
          questionHistory: questionHistory,
        },
      });
    }
  }, [timeLeft]);

  useEffect(() => {
    // Reduce timeLeft by calling setTimeLeft function 1 every second (1000ms)
    const timer =
      timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // On initial render of the screen, update 'rounds' count
  useEffect(() => {
    if (isCollabConnected) {
      collabSocket.emit("sessionEnded", { roomId: roomInfo.id });
      collabSocket.emit("switchRoles", { roomId: roomInfo.id });
    }
  }, []);

  useEffect(() => {
    matchingSocket.on("connect", () => {
      setIsMatchingConnected(true);
    });

    matchingSocket.on("disconnect", () => {
      setIsMatchingConnected(false);
    });

    // The 2 users already had their turn
    collabSocket.on("sessionComplete", () => {
      setSessionComplete(true);
    });

    // One of the users chose to left the session
    collabSocket.on("oneUserLeft", () => {
      setSessionComplete(true);
      setUserLeft(true);
    });

    collabSocket.on("switchedRolesSuccessful", () => {
      setIsRoleSwitched(true);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      collabSocket.off("sessionComplete");
    };
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
      }}
    >
      <Typography variant={"h2"} sx={{ marginBottom: 2 }}>
        Times up!
      </Typography>
      <Typography fontSize={20} sx={{ marginBottom: 2 }}>
        {isSessionComplete
          ? // ? "Would you like to try another question with the same partner?"
            "Session complete!"
          : "Ready to switch roles and continue?"}
      </Typography>
      {userLeft ? (
        <Typography
          fontSize={20}
          style={{ color: "red" }}
          sx={{ marginBottom: 2 }}
        >
          Your partner has left the session, please start another session!
        </Typography>
      ) : null}
      {isSessionComplete ? (
        <Button
          variant="outlined"
          onClick={handleExit}
          startIcon={<HomeIcon />}
        >
          Home
        </Button>
      ) : (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography fontSize={20} sx={{ marginBottom: 2 }}>
            Next session starting in: {timeLeft}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleExit}
            startIcon={<LogoutIcon />}
          >
            Leave
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default SessionEndedPage;
