import React, { useState, useEffect } from "react";
import { useAuth } from "../../CONTEXT/authContext";
import axios from "axios"; 
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
  const [reply, setReply] = useState({}); 
  const [showInput, setShowInput] = useState({}); 
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found");
        }
  
        const response = await axios.get('http://localhost:3000/messages/user', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
  
        if (response.status === 404) {
          console.log("No messages found");
        } else if (response.data?.data) {
          const grouped = response.data.data.reduce((acc, message) => {
            const senderId = message.senderID._id;
            console.log(response.data.data)

            if (!acc[senderId]) {
              acc[senderId] = [];
            }
            acc[senderId].push({
              content: message.content,
              flatId: message.flatID?._id,
              flatName: message.flatID?.name,
              flatAddress: message.flatID?.address,
              senderName: message.senderID.fullName,
              createdAt: message.created,
            });
            return acc;
          }, {});
          setGroupedMessages(grouped); 
        } else {
          console.error("No data received from API.");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No messages found"); 
        } else {
          console.error("Error fetching messages:", error); 
        }
      }
    };
  
    if (currentUser) {
      fetchUserMessages(); 
    }
  }, [currentUser]);
  

  const handleReplyChange = (senderUid, value) => {
    console.log(senderUid)
    setReply({ ...reply, [senderUid]: value });
  };


  const handleSendReply = async (senderUid) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token not found");
    }
    if (!currentUser || !reply[senderUid]) return;

    const message = groupedMessages[senderUid]?.[0]; 
    const flatID = message?.flatId; 

    if (!flatID || !senderUid || !reply[senderUid]) {
        console.error("Missing required fields: flatID, receiverID, or content.");
        showToastr("error", "Please fill all required fields.");
        return; 
    }

    const messageDetails = {
        content: reply[senderUid], 
        senderID: currentUser.id,
        receiverID: senderUid, 
        flatID: flatID, 
    };

    try {
        const response = await axios.post(
            `http://localhost:3000/messages/reply/${senderUid}`, 
            messageDetails, 
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                },
            }
        );

        if (response.status === 200) {
            setReply({ ...reply, [senderUid]: "" });
            setShowInput({ ...showInput, [senderUid]: false });
            showToastr("success", "Reply sent successfully!");
        } else {
            console.error(response.data.message || "Error sending reply.");
            showToastr("error", "Failed to send reply.");
        }
    } catch (error) {
        console.error("Error sending reply:", error);
        showToastr("error", "Failed to send reply.");
    }
};








  const toggleInputVisibility = (senderUid) => {
    setShowInput({ ...showInput, [senderUid]: !showInput[senderUid] });
  };

  return (
    <>
      <ToastContainer />
      <div className="background__container__inbox">
        <Header />
        <KeyboardReturnIcon
          onClick={() => navigate("/")}
          sx={{
            color: "gray",
            margin: "10px 20px",
            cursor: "pointer",
          }}
        />
        <Container>
          <Typography sx={{ display: "flex", justifyContent: "center" }} gutterBottom>
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
                    {groupedMessages[senderUid].map((message, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <Typography variant="body1">{message.content}</Typography>
                        {message.flatName && (
                          <Typography variant="caption" color="textSecondary">
                            Flat: {message.flatName}, {message.flatAddress}
                          </Typography>
                        )}
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          Sent on:{" "}
                          {new Date(message.createdAt).toLocaleString()}
                        </Typography>
                      </div>
                    ))}
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
                        onChange={(e) => handleReplyChange(senderUid, e.target.value)}
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
