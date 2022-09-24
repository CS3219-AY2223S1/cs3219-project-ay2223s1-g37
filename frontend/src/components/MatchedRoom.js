import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/Socket.js";

function MatchedRoom() {
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
    </Box>
  );
}

export default MatchedRoom;
