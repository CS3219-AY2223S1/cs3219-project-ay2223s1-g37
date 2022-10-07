import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/Socket.js";

function SessionEndedPage() {
  // const location = useLocation();
  // const roomInfo = location.state;
  // const roomId = roomInfo.matchEntryId;
  const roomId = 2; // TODO: REMOVE. Hardcoded temporarily
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSessionComplete, setSessionComplete] = useState(false);

  const handleExit = () => {
    // TODO: Remove the pair's entry from collaboration service DB
    socket.emit("endSession", { roomId: roomId });
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
    if (isConnected) {
      socket.emit("sessionEnded", { roomId: roomId });
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // The 2 users already had their turn
    socket.on("sessionComplete", () => {
      setSessionComplete(true);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
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
