import {
    Box,
    Typography,
    Button
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import socket from "../utils/Socket.js"
  
  function SessionEndedPage() {
    const location = useLocation();
    const roomInfo = location.state;

    const navigate = useNavigate();

    const handleExit = () => {
      // TODO: Remove the pair's entry from collaboration service DB
      // TODO: Remove the pair's entry from matching service DB
      navigate('/home');
    }
  
    const handleSwitch = () => {
      // TODO: Emit event to request collaboration service to switch user roles
    }
  
    return (
      <Box    
        width={"90%"}
        alignSelf={"center"}
        padding={"2rem 0px"}>
  
        <Typography variant={"h1"}>Times up!</Typography>
        <Typography fontSize={"1rem"}>
          {/* {roomInfo.hasSwitched
              ? "Would you like to switch roles and continue?"
              : "Would you like to try another question with the same partner?"
          } */}
          
          Would you like to switch roles and continue?
        </Typography>

        <Button onClick={handleExit}>No</Button>
        <Button onClick={handleSwitch}>Yes</Button>
      </Box>
    );
  }
  
  export default SessionEndedPage;