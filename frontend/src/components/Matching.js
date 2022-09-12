import {
  Box,
  Button,
  ButtonGroup,
  Typography
} from "@mui/material";
import axios from "axios";
import {Link} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:8001');

function MatchingPage() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const sendMatch = (difficulty) => {
    let username1 = "abc";
    socket.emit('match', {username1, difficulty});
  }

  return (
    <Box display={"flex"} flexDirection={"column"} width={"30%"}>
      <Typography variant={"h3"} marginBottom={"2rem"}>Select Difficulty</Typography>
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={ () => sendMatch("easy") }>Easy</Button>
        <Button onClick={ () => sendMatch("medium") }>Medium</Button>
        <Button onClick={ () => sendMatch("difficult") }>Difficult</Button>
      </ButtonGroup>
    </Box>
  );
}

export default MatchingPage;