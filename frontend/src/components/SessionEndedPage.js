import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { matchingSocket, collabSocket } from "../utils/Socket.js";

function SessionEndedPage() {
  const location = useLocation();
  const matchEntry = location.state.matchEntry;
  const roomInfo = location.state.roomInfo;
  // const roomId = 2; // TODO: REMOVE. Hardcoded temporarily
  const navigate = useNavigate();

  const [isMatchingConnected, setIsMatchingConnected] = useState(matchingSocket.connected);
  const [isCollabConnected, setIsCollabConnected] = useState(collabSocket.connected);
  const [isSessionComplete, setSessionComplete] = useState(false);

  console.log("session ended match entry: " + JSON.stringify(matchEntry));
  console.log("session ended room info: " + JSON.stringify(roomInfo));

  const handleExit = () => {
    matchingSocket.emit("endSession", { roomId: matchEntry.id });
    collabSocket.emit("sessionComplete", { roomId: roomInfo.id });
    navigate("/home");
  };

  const handleSwitchOrRestart = () => {
    if (isSessionComplete) {
      // TODO: Handle resarting of session. Ensure both parties say YES before going to matched room
    } else {
      // TODO: Switch users
      navigate("/matchedroom");
    }
  };

  // On initial render of the screen, update 'rounds' count
  useEffect(() => {
    if (isMatchingConnected) {
      collabSocket.emit("sessionEnded", { roomId: roomInfo.id });
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

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      collabSocket.off("sessionComplete");
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 20,
      }}
    >
      <Typography variant={"h1"}>Times up!</Typography>
      <Typography fontSize={"1rem"}>
        {isSessionComplete
          ? "Would you like to try another question with the same partner?"
          : "Would you like to switch roles and continue?"}
      </Typography>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button onClick={handleSwitchOrRestart}>Yes</Button>
        <Button onClick={handleExit}>No</Button>
      </div>
    </div>
  );
}

export default SessionEndedPage;
