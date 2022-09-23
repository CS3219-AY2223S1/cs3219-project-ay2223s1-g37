import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/Socket.js";

function CountdownPage() {
  const location = useLocation();
  const matchEntryId = location.state.matchEntryId;

  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [pairFound, setPairFound] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const getPairing = (matchEntryId) => {
    if (isConnected) {
      socket.emit("pairing", { matchEntryId, timeLeft });
    }
  };

  const routeToNext = useCallback(
    (isPaired) => {
      if (isPaired) {
        navigate("/matchedroom");
      }
    },
    [navigate]
  );

  // On first rendering of screen, start finding a pairing
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("pairingSuccess", () => {
      setPairFound(true);
      routeToNext(true);
    });

    socket.on("pairingFailed", () => {
      routeToNext(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pairingSuccess");
      socket.off("pairingFailed");
    };
  }, [routeToNext]);

  // When there is still time left, continue getting pairing
  useEffect(() => {
    if (!pairFound) {
      getPairing(matchEntryId);
    }
  }, [timeLeft]);

  useEffect(() => {
    // Reduce timeLeft by calling setTimeLeft function 1 every second (1000ms)
    const timer =
      timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={"50%"}
      alignSelf={"center"}
      alignItems={"center"}
    >
      <Typography variant={"h3"} marginBottom={"2rem"}>
        Awaiting a match...
      </Typography>
      <Typography variant={"h3"}>{timeLeft}</Typography>
      {timeLeft === 0 ? (
        <Box display={"flex"} flexDirection={"column"}>
          <Typography variant={"h6"} marginBottom={5}>
            No match found.
          </Typography>
          <Button
            variant={"outlined"}
            onClick={() => {
              navigate("/selectdifficulty");
            }}
          >
            Back
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

export default CountdownPage;
