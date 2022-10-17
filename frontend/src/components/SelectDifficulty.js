import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { matchingSocket } from "../utils/Socket.js";

function SelectDifficultyPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isConnected, setIsConnected] = useState(matchingSocket.connected);

  const handleSelect = (event) => {
    setDifficulty(event.target.value);
  };

  const nextClicked = () => {
    if (difficulty === "") {
      setIsDialogOpen(true);
      setDialogTitle("Error");
      setDialogMsg("Please select a difficulty level to continue");
      return;
    }

    sendMatch(difficulty);
  };

  const sendMatch = (difficulty) => {
    let username1 = sessionStorage.getItem("username");
    if (isConnected) matchingSocket.emit("match", { username1, difficulty });
  };

  const routeToNext = useCallback(
    (isMatchCreated, userInfo) => {
      if (isMatchCreated) {
        navigate("/countdown", { state: userInfo });
      } else {
        setIsDialogOpen(true);
        setDialogTitle("Error");
        setDialogMsg("Please try again");
      }
    },
    [navigate]
  );

  const closeDialog = () => setIsDialogOpen(false);

  useEffect(() => {
    matchingSocket.on("connect", () => {
      setIsConnected(true);
    });

    matchingSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // userInfo contains the DB entry ID of successfully created user
    matchingSocket.on("matchCreationSuccess", (userInfo) => {
      routeToNext(true, userInfo);
    });

    matchingSocket.on("matchCreationFailure", () => {
      routeToNext(false);
    });

    return () => {
      matchingSocket.off("connect");
      matchingSocket.off("disconnect");
      matchingSocket.off("matchCreationSuccess");
      matchingSocket.off("matchCreationFailure");
    };
  }, [routeToNext]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={"50%"}
      margin={"0px auto"}
      padding={"4rem"}
      //   sx={{ backgroundColor: "green" }}
    >
      <Typography variant={"h3"} marginBottom={"2rem"}>
        Select your difficulty:
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="label">Difficulty</InputLabel>
        <Select
          labelId="label"
          id="select"
          label="Difficulty"
          value={difficulty}
          onChange={handleSelect}
        >
          <MenuItem value={"Easy"}>Easy</MenuItem>
          <MenuItem value={"Medium"}>Medium</MenuItem>
          <MenuItem value={"Hard"}>Hard</MenuItem>
        </Select>
      </FormControl>

      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"flex-end"}
        sx={{ marginTop: 5 }}
      >
        <Button variant={"outlined"} onClick={nextClicked}>
          Next
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SelectDifficultyPage;