import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../CONTEXT/authContext";
import { Typography, TextField, Button, Container, Grid } from "@mui/material";
import "../HOME/Home.css";
import Header from "../HEADER/Header";
import EditFlat from "./EditFlat";
import "./ViewFlat.css";
import showToastr from "../../SERVICES/toaster-service";
import { ToastContainer } from "react-toastify";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ViewFlat() {
  const { flatId } = useParams();
  const [flat, setFlat] = useState(null);
  const [message, setMessage] = useState("");
  const [owner, setOwner] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFlatId, setEditFlatId] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlatAndOwner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
  
        // Cerere către backend pentru datele flat-ului
        const flatResponse = await axios.get(
          `http://localhost:3000/flats/getByID/${flatId}`, // Ruta backend
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token pentru autentificare
            },
          }
        );
  
        setFlat(flatResponse.data); // Setăm datele flatului
  
        // Dacă dorești să preiei date despre proprietar, modifică modelul pentru flat să includă un `populate` pe `ownerID`.
        const ownerResponse = await axios.get(
          `http://localhost:3000/users/${flatResponse.data.ownerID}`, // Exemplu pentru ruta utilizatorilor
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOwner(ownerResponse.data); // Setăm datele utilizatorului
      } catch (error) {
        console.error("Error fetching flat or owner:", error);
      }
    };
  
    fetchFlatAndOwner();
  }, [flatId]);
  

  const handleEdit = () => {
    setEditFlatId(flatId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFlatId(null);
  };

  // const handleUpdateFlat = async () => {
    // const flatDoc = await getDoc(doc(db, "flats", flatId));
    // if (flatDoc.exists()) {
    //   setFlat(flatDoc.data()); // Refresh flat details
    // }
    // handleCloseEditModal();

    const handleUpdateFlat = async (updatedFlat) => {
      try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
  
          const response = await axios.get(
              `http://localhost:3000/flats/getByID/${flatId}`,
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );
  
          if (response.status === 200) {
              setFlat(response.data); // Actualizează datele flatului în UI
              handleCloseEditModal();
          }
      } catch (error) {
          console.error("Error fetching updated flat:", error);
      }
    handleCloseEditModal();

  };
  
  // };

  const handleSendMessage = async () => {
    if (!currentUser || !flat) {
      console.error("User not signed in or flat data not loaded");
      return;
    }
  
    const newMessage = {
      content: message,
      senderID: currentUser._id,  // ID-ul utilizatorului
      senderName: currentUser.fullName,
      senderEmail: currentUser.email,
      created: new Date(),
      flatID: flatId,  // ID-ul platoului
    };
  
    if (message !== "") {
      try {
        // Trimite cererea POST către backend pentru a salva mesajul în MongoDB
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `http://localhost:3000/messages/addMessage/${flatId}`,
          newMessage,
          {
            headers: {
              Authorization: `Bearer ${token}`,  // Auth token pentru a valida utilizatorul
            },
          }
        );
    
        console.log(response.data); // Răspunsul va conține acum obiectul complet cu mesajul
    
        // Dacă cererea este cu succes
        if (response.status === 200) {
          setMessage("");  // Resetează câmpul de mesaj
          showToastr("success", "Message sent successfully!");
    
          // Afișează contentul mesajului
          console.log("Message Content:", response.data.data.content); // Afișează contentul
        }
      } catch (error) {
        console.error("Error sending message:", error);
        showToastr("error", "Error sending message.");
      }
    } else {
      showToastr("error", "Can't send a message without content!");
    }
  };
  

  if (!flat || !owner) return <Typography>Loading flat details...</Typography>;

  return (
    <>
      <ToastContainer></ToastContainer>
      <div className="background__container__home">
        <Header />
        <KeyboardReturnIcon
          onClick={() => navigate("/")}
          sx={{
            color: "gray",
            margin: "10px 20px",
            cursor: "pointer",
          }}
        ></KeyboardReturnIcon>
        <div className="main__container">
          <div className="backdrop__container">
            <Container
              sx={{
                color: "white",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  marginBottom: 0,
                  color: "rgb(82, 22, 139)",
                  fontFamily: "inherit",
                  fontSize: "22px",
                }}
              >
                Flat Owner: {owner.fullName} {/*Display the owner's name*/}
              </Typography>
            </Container>
            <div className="flat__details__container">
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontFamily: "inherit" }}
              >
                Flat Details:
              </Typography>
              <Grid container width={"60%"} sx={{ marginLeft: "100px" }}>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px", mr: "10px" }}
                  >
                    Address:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    {flat.city}, {flat.streetName} {flat.streetNumber}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    Area Size:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    {flat.areaSize}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    Has AC:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    {flat.hasAC ? "Yes" : "No"}{" "}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    Year Built:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    {flat.yearBuilt}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    Rent Price:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    ${flat.rentPrice}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    Date Available:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "inherit", fontSize: "18px" }}
                  >
                    {flat.dateAvailable}
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <Container sx={{ padding: 0 }}>
              {flat.ownerID !== currentUser._id ? (
                <Container
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: 0,
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      color: "rgb(82, 22, 139)",
                      paddingTop: "10px",
                      fontFamily: "inherit",
                      fontSize: "22px",
                    }}
                  >
                    Send a message to the owner
                  </Typography>
                  <TextField
                    className="send__message__textfield"
                    label="Your Message"
                    fullWidth
                    multiline
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      marginBottom: "16px",
                      border: "2px solid black",
                      borderRadius: "7px",
                    }}
                  />
                  <Button
                    className="sendMessage__button"
                    variant="contained"
                    onClick={handleSendMessage}
                    fullWidth
                    style={{
                      height: "45px",
                      backgroundColor: "blueviolet",
                      border: "2px solid black",
                      color: "black",
                      fontFamily: "inherit",
                    }}
                  >
                    Send Message
                  </Button>
                </Container>
              ) : (
                <Container
                  sx={{
                    width: "40%",
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    color: "white",
                    padding: 0,
                  }}
                >
                  <Button
                    className="editFlat__button"
                    variant="contained"
                    onClick={handleEdit}
                    fullWidth
                    style={{
                      height: "45px",
                      width: "450px",
                      backgroundColor: "blueviolet",
                      border: "2px solid black",
                      color: "black",
                      fontFamily: "inherit",
                      fontSize: "16px",
                    }}
                  >
                    Edit Flat
                  </Button>
                </Container>
              )}
            </Container>
          </div>
        </div>
        {/* Modal for Editing Flat */}
        <EditFlat
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          flatId={editFlatId}
          onUpdate={handleUpdateFlat}
        />
      </div>
    </>
  );
}

export default ViewFlat;
