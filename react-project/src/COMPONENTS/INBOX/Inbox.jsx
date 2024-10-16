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
    const fetchMessages = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const messages = userData.messages || [];

          // Group messages by senderUid
          const grouped = messages.reduce((acc, message) => {
            const senderUid = message.senderUid;
            if (!acc[senderUid]) {
              acc[senderUid] = [];
            }
            acc[senderUid].push(message);
            return acc;
          }, {});

          setGroupedMessages(grouped);

          // Fetch flat details
          const flatIds = [...new Set(messages.map((msg) => msg.flatId))];
          const flatDetailsPromises = flatIds.map(async (flatId) => {
            const flatDocRef = doc(db, "flats", flatId);
            const flatDocSnap = await getDoc(flatDocRef);
            return { flatId, ...flatDocSnap.data() };
          });

          const flatDetailsArray = await Promise.all(flatDetailsPromises);
          const flatDetailsObj = flatDetailsArray.reduce((acc, flat) => {
            acc[flat.flatId] = flat;
            return acc;
          }, {});

          setFlatDetails(flatDetailsObj);
        }
      }
    };

    fetchMessages();
  }, [currentUser]);

  const handleReplyChange = (senderUid, value) => {
    setReply({ ...reply, [senderUid]: value });
  };

  const handleSendReply = async (senderUid) => {
    if (!currentUser || !reply[senderUid]) return;

    const replyMessage = {
      content: reply[senderUid],
      senderUid: currentUser.uid,
      senderName: currentUser.fullName,
      senderEmail: currentUser.email,
      createdAt: new Date(),
    };

    try {
      const senderDocRef = doc(db, "users", senderUid);
      await updateDoc(senderDocRef, {
        messages: arrayUnion(replyMessage),
      });
      setReply({ ...reply, [senderUid]: "" }); // Clear the reply input
      setShowInput({ ...showInput, [senderUid]: false }); // Hide input after sending
      showToastr("success", "Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
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
