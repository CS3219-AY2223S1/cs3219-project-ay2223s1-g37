import { Box, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CountdownPage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

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
          <Button variant={"outlined"} onClick={() => {
            navigate("/home")
          }}>
            Back
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

export default CountdownPage;
