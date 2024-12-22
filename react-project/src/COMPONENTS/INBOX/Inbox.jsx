import React, { useState, useEffect } from "react";
import { useAuth } from "../../CONTEXT/authContext";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Stack,
  Container,
} from "@mui/material";
import Header from "../HEADER/Header";
import "./Inbox.css";
import showToastr from "../../SERVICES/toaster-service";
import { ToastContainer } from "react-toastify";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  const [groupedMessages, setGroupedMessages] = useState({});
  const [flatDetails, setFlatDetails] = useState({});
  const [reply, setReply] = useState({});
  const [showInput, setShowInput] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("FlatDetails object:", flatDetails); // Vezi tot obiectul

    const fetchUserMessages = async () => {
      // console.log("dfgh");
      // console.log(currentUser);
      console.log(flatDetails);

      if (!currentUser || !flatDetails.flatID) return;
  
      try {
        console.log("dfgh");
        const response = await fetch(
          `http://localhost:5000/messages/getUserMessages/${flatDetails.flatID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
  
        const data = await response.json();
  
        if (response.ok) {
          const grouped = data.allMessages.reduce((acc, message) => {
            const senderId = message.senderID;
            if (!acc[senderId]) {
              acc[senderId] = [];
            }
            acc[senderId].push(message);
            return acc;
          }, {});
  
          setGroupedMessages(grouped);
        } else {
          console.error(data.message || "Error fetching user messages.");
        }
      } catch (error) {
        console.error("Error fetching user messages:", error);
      }
    };
  
    fetchUserMessages();
  }, [currentUser, flatDetails]);
  

  const handleReplyChange = (senderUid, value) => {
    setReply({ ...reply, [senderUid]: value });
  };

  const handleSendReply = async (flatID) => {
    if (!currentUser || !reply[flatID]) return;
  
    const messageDetails = {
      content: reply[flatID],
    };
  
    try {
      const response = await fetch(
        `http://localhost:5000/messages/addMessage/${flatID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify(messageDetails),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        setReply({ ...reply, [flatID]: "" });
        setShowInput({ ...showInput, [flatID]: false });
        showToastr("success", "Message sent successfully!");
      } else {
        console.error(data.message || "Error sending message.");
        showToastr("error", "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  const toggleInputVisibility = (senderUid) => {
    setShowInput({ ...showInput, [senderUid]: !showInput[senderUid] });
  };

  return (
    <>
      <ToastContainer></ToastContainer>
      <div className="background__container__inbox">
        <Header />
        <KeyboardReturnIcon
          onClick={() => navigate("/")}
          sx={{
            color: "gray",
            margin: "10px 20px",
            cursor: "pointer",
          }}
        ></KeyboardReturnIcon>

        <Container>
          <Typography
            sx={{ display: "flex", justifyContent: "center" }}
            gutterBottom
          >
            <h2 className="inbox__title">MESSAGES</h2>
          </Typography>
          <Stack className="stack__container" spacing={2}>
            {Object.keys(groupedMessages).length === 0 ? (
              <Typography
                sx={{
                  color: "red",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: "10px 20px",
                }}
              >
                No messages found.
              </Typography>
            ) : (
              Object.keys(groupedMessages).map((senderUid) => (
                <Card
                  sx={{ background: "rgba(0,0,0,0.4)" }}
                  className="card__container"
                  key={senderUid}
                >
                  <CardContent className="card__content">
                    <Typography variant="h6">
                      From: {groupedMessages[senderUid][0].senderName}
                    </Typography>
                    {groupedMessages[senderUid].map((message, index) => {
                      const flat = flatDetails[message.flatId];
                      return (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          {flat && (
                            <Typography variant="caption" color="textSecondary">
                              Flat Location: {flat.city}, {flat.streetName}{" "}
                              {flat.streetNumber}
                            </Typography>
                          )}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Sent on:{" "}
                            {new Date(
                              message.createdAt.seconds * 1000
                            ).toLocaleString()}
                          </Typography>
                        </div>
                      );
                    })}
                  </CardContent>
                  <CardActions
                    className="card__actions"
                    sx={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    {showInput[senderUid] && (
                      <TextField
                        className="message__input"
                        label="Reply"
                        variant="outlined"
                        value={reply[senderUid] || ""}
                        onChange={(e) =>
                          handleReplyChange(senderUid, e.target.value)
                        }
                      />
                    )}
                    <Button
                      sx={{
                        width: "200px",
                        background: "blueviolet",
                      }}
                      variant="contained"
                      onClick={() =>
                        showInput[senderUid]
                          ? handleSendReply(senderUid)
                          : toggleInputVisibility(senderUid)
                      }
                    >
                      {showInput[senderUid] ? "Send Reply" : "Reply"}
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Stack>
        </Container>
      </div>
    </>
  );
};

export default Inbox;
