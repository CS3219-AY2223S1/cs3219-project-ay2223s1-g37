import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/Socket.js";

function SessionEnd() {
  //   const location = useLocation();
  //   const matchEntryId = location.state.matchEntryId;
  const matchEntryId = 2;
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSessionComplete, setSessionComplete] = useState(false);

  const chooseEndSession = () => {
    socket.emit("endSession", { matchEntryId: matchEntryId });
    navigate("/home");
  };

  // On initial render of the screen, get and update round count
  useEffect(() => {
    if (isConnected) {
      socket.emit("sessionEnded", { matchEntryId: matchEntryId });
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
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 20,
      }}
    >
      {isSessionComplete ? (
        <Box display={"flex"} flexDirection={"column"}>
          <Typography variant={"h4"} marginBottom={5}>
            Session complete!
          </Typography>
          <Button variant={"outlined"} onClick={chooseEndSession}>
            Return to home
          </Button>
          <Button
            variant={"outlined"}
            onClick={() => {
              // TODO: Handle resarting of session. Ensure both parties say YES before going to matched room
              // navigate("/matchedroom");
            }}
          >
            Try again with same match?
          </Button>
        </Box>
      ) : (
        <Box display={"flex"} flexDirection={"column"}>
          <Typography variant={"h4"} marginBottom={5}>
            Ready for the next session?
          </Typography>
          <Button
            variant={"outlined"}
            onClick={() => {
              navigate("/matchedroom");
            }}
          >
            Continue
          </Button>
        </Box>
      )}
    </div>
  );
}

export default SessionEnd;
