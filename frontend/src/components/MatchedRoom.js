import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/Socket.js";

function MatchedRoom() {
  // const location = useLocation();
  // const matchEntryId = location.state.updatedMatchId;
  const matchEntryId = 1;
  const navigate = useNavigate();

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={"50%"}
      alignSelf={"center"}
      alignItems={"center"}
    >
      <Typography variant={"h3"} marginBottom={"2rem"}>
        You are in a match room!
      </Typography>
      <Button
        variant={"outlined"}
        onClick={() => {
          navigate("/sessionended", { state: matchEntryId });
        }}
      >
        Next
      </Button>
    </Box>
  );
}

export default MatchedRoom;
