import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { chatSocket } from "../utils/Socket.js";

function Chat({ username, roomId }) {
  const [isChatSocketConnected, setIsChatSocketConnected] = useState(
    chatSocket.connected
  );
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const current = new Date();
  const time = current.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: roomId,
        author: username,
        message: currentMessage,
        time: time,
      };
      await chatSocket.emit("send message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  // Set up chat on startup
  useEffect(() => {
    if (isChatSocketConnected) {
      chatSocket.emit("start chat", roomId);
    }
  }, []);

  // Socket listening to events
  useEffect(() => {
    chatSocket.on("connect", () => {
      setIsChatSocketConnected(true);
    });

    chatSocket.on("disconnect", () => {
      setIsChatSocketConnected(false);
    });

    chatSocket.on("receive message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      chatSocket.off("connect");
      chatSocket.off("disconnect");
      chatSocket.off("receive message");
    };
  }, []);

  // Scroll to bottom every time a new message is added
  //   useEffect(() => {
  //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messageList]);

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Box className="chat-header" id="chat-header">
        <Typography variant={"h4"}>Chat</Typography>
      </Box>
      <Box
        id="chat-body"
        sx={{
          width: "100%",
          height: 300,
          overflowWrap: "break-word",
          overflow: "scroll",
          overflowX: "hidden",
          marginTop: 2,
          marginBottom: 2,
          flex: 1,
        }}
      >
        {messageList.map((messageContent) => {
          if (messageContent.author === username) {
            // Your chats
            return (
              <Box
                sx={{
                  marginTop: 1,
                  marginBottom: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#608FB7",
                    padding: 2,
                    width: "80%",
                    borderRadius: 2,
                  }}
                >
                  <Typography>{messageContent.message}</Typography>
                </Box>
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    marginLeft: 1,
                    fontSize: 14,
                  }}
                >
                  <Box sx={{ fontWeight: "bold", marginRight: 2 }}>You</Box>
                  <Box>{messageContent.time}</Box>
                </Typography>
              </Box>
            );
          } else {
            // Other user's chats
            return (
              <Box
                sx={{
                  marginTop: 1,
                  marginBottom: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#BDBDBD",
                    padding: 2,
                    width: "80%",
                    borderRadius: 2,
                  }}
                >
                  <Typography>{messageContent.message}</Typography>
                </Box>
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    marginLeft: 1,
                    fontSize: 14,
                  }}
                >
                  <Box sx={{ fontWeight: "bold", marginRight: 2 }}>
                    {messageContent.author}
                  </Box>
                  <Box>{messageContent.time}</Box>
                </Typography>
              </Box>
            );
          }
        })}
        <div ref={bottomRef} />
      </Box>
      <Box
        id="chat-footer"
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextField
          sx={{ width: "90%" }}
          value={currentMessage}
          placeholder="Type your message here!"
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <Button size="large" variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default Chat;
