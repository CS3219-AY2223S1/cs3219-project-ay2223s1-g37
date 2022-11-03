import { Box, Typography, Button, CircularProgress, Fab } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { matchingSocket } from "../utils/Socket.js";
import "./CountdownPage.css";

function CountdownPage() {
  const location = useLocation();
  const matchEntryId = location.state.matchEntryId;

  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);
  const [pairFound, setPairFound] = useState(false);
  const [isConnected, setIsConnected] = useState(matchingSocket.connected);

  const getPairing = (matchEntryId) => {
    if (isConnected) {
      matchingSocket.emit("pairing", { matchEntryId, timeLeft });
    }
  };

  const routeToNext = useCallback(
    (isPaired, pairInfo) => {
      if (isPaired) {
        navigate("/matchedroom", { state: pairInfo });
      }
    },
    [navigate]
  );

  // On first rendering of screen, start finding a pairing
  useEffect(() => {
    matchingSocket.on("connect", () => {
      setIsConnected(true);
    });

    matchingSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    matchingSocket.on("pairingSuccess", (pairInfo) => {
      setPairFound(true);
      routeToNext(true, pairInfo);
    });

    matchingSocket.on("pairingFailed", () => {
      routeToNext(false);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      matchingSocket.off("pairingSuccess");
      matchingSocket.off("pairingFailed");
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
    const timer = setInterval(() => {
      setTimeLeft((timeLeft) => (timeLeft > 0 ? timeLeft - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Fab
        color="primary"
        variant="extended"
        aria-label="home"
        sx={{ mt: "35px" }}
        onClick={() => navigate("/home")}
      >
        <HomeIcon sx={{ mr: 1 }} />
        Home
      </Fab>
      <Box
        display={"flex"}
        flexDirection={"column"}
        width={"50%"}
        alignSelf={"center"}
        alignItems={"center"}
        marginTop={"30px"}
      >
        {timeLeft > 0 ? (
          <Typography variant={"h3"} marginBottom={"2rem"} className="loading">
            Awaiting a match
          </Typography>
        ) : (
          <Typography marginBottom={"2rem"}>
            <br></br>
          </Typography>
        )}
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={timeLeft * (100 / 30)}
            size={300}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="#3579DC"
              fontSize={"5rem"}
            >
              {`${timeLeft}`}
            </Typography>
          </Box>
        </Box>
        {timeLeft === 0 ? (
          <Box display={"flex"} flexDirection={"column"}>
            <Typography variant={"h6"} marginBottom={5}>
              No match found.
            </Typography>
            <Button
              variant={"outlined"}
              onClick={() => {
                navigate("/home");
              }}
            >
              Back to home
            </Button>
          </Box>
        ) : null}
      </Box>
    </div>
  );
}

export default CountdownPage;
