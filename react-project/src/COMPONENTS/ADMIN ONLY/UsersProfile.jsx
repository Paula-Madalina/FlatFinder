import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogContentText,
} from "@mui/material";
import Header from "../HEADER/Header";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import "./UsersProfile.css";
import axios from "axios";

function UsersProfile() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {

      if (userId) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:3000/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("User data:", response.data);
      const flatsResponse = await axios.get(`http://localhost:3000/flats/flatByUserId/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User flats:", flatsResponse.data);

      setUserData({
        ...response.data,
        flats: flatsResponse.data.map((flat, index) => ({
          ...flat,
          id: index + 1, 
        })),
      });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]); 

  const handleMakeAdmin = () => {
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if(!token) {
        throw new Error("NO TOKEN FOUND");
      }

      const response = await axios.patch(`http://localhost:3000/users/makeAdmin/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      console.log(response.data);
      setSnackbarMessage(response.data.message || "User updated to admin");
      setOpenSnackbar(true);
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating user role:", error);
      setSnackbarMessage("Failed to update user role");
      setOpenSnackbar(true);
    }
  };

  const handleRemoveUser = async () => {
    setIsRemoveDialogOpen(true);
  };

  const handleCloseRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
  };

  const handleSaveRemoveUser = async () => {
    try {
      console.log(userId)
      const token = localStorage.getItem("token");
      if(!token) {
        throw new Error("NO TOKEN FOUND");
      }
      const response = await axios.delete(`http://localhost:3000/users/deleteUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data)

      setSnackbarMessage(response.data.message || "User and associated flats removed successfully");
      setOpenSnackbar(true);
      setUserData(null); 
      navigate("/all-users");
    } catch (error) {
      console.error("Error removing user:", error);
      setSnackbarMessage("Failed to remove user");
      setOpenSnackbar(true);
    }
  };

  if (!userData) {
    return <Typography variant="h6">Loading user data...</Typography>;
  }

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex:0.1
    },
    {
      field: "city",
      headerName: "City",
    },
    {
      field: "streetName",
      headerName: "Street Name",
      flex:0.2,
    },
    {
      field: "streetNumber",
      headerName: "Street No.",
    },
    {
      field: "areaSize",
      headerName: "Area Size",
    },
    {
      field: "rentPrice",
      headerName: "Rent Price",
    },
    {
      field: "yearBuilt",
      headerName: "Year Built",
    },
    {
      field: "dateAvailable",
      headerName: "Date Available",
      flex:0.3,
    },
    {
      field: "hasAC",
      headerName: "Has AC",
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
  ];

  return (
    <div>
      <div className="background__container__usersProfile">
        <Header></Header>
        <KeyboardReturnIcon
          onClick={() => navigate("/all-users")}
          sx={{
            color: "white",
            margin: "10px 20px",
            cursor: "pointer",
          }}
        ></KeyboardReturnIcon>

        <div className="eachUserProfile__details">
          <Typography variant="h4">PROFILE OF {userData.fullName}</Typography>
          <div className="information__container">
            <div className="users__details">
              <div>
                <PersonOutlineIcon
                  sx={{ fontSize: "160px", color: "rgb(82, 22, 139)" }}
                ></PersonOutlineIcon>
              </div>
              <div className="hero__information">
                <Typography
                  className="specific__information"
                  variant="h6"
                  sx={{ fontFamily: "inherit", mt: "15px" }}
                >
                  Id: {userData._id}
                </Typography>
                <Typography
                  className="specific__information"
                  variant="h6"
                  sx={{ fontFamily: "inherit" }}
                >
                  Email: {userData.email}
                </Typography>
                <Typography
                  className="specific__information"
                  variant="h6"
                  sx={{ fontFamily: "inherit" }}
                >
                  Birth Date: {userData.birthDate}
                </Typography>
                <Typography
                  className="specific__information"
                  variant="h6"
                  sx={{ fontFamily: "inherit" }}
                >
                  Role:{userData.isAdmin ? 'Admin' : 'User'}
                </Typography>
              </div>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  textAlign: "center",
                  height: "50px",
                  marginTop: "100px",
                }}
              >
                {!userData.isAdmin && (
                  <>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "green", fontFamily: "inherit" }}
                      onClick={handleMakeAdmin}
                    >
                      Make Admin
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "red", fontFamily: "inherit" }}
                      onClick={handleRemoveUser}
                    >
                      Remove User
                    </Button>
                  </>
                )}
              </Box>
            </div>
          </div>
        </div>

        <div className="user_flats_container">
          <Typography variant="h5">USER FLATS:</Typography>
        </div>
        <div style={{ height: 500, width: "75%", margin: "auto" }}>
          <DataGrid
            className="custom__grid__class"
            rows={userData.flats}
            columns={columns}
            autoHeight
            autosizeOnMount
            pageSize={5}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
        </div>
        <Dialog
          open={isDialogOpen}
          keepMounted
          onClose={handleClose}
          PaperProps={{
            component: "form",
            onSubmit: handleSave,
            sx: { backgroundColor: "#f2eee9", borderRadius: "30px" }, // modal background
          }}
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <DialogContentText
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "30px",
              margin: "5px",
              color: "#8a2be2",
              fontFamily: "inherit",
              fontSize: "20px",
            }}
          >
            Are you sure you want to make this user admin?
            <div>
              <Button
                onClick={handleSave}
                sx={{ color: "green", fontSize: "16px" }}
              >
                Yes
              </Button>
              <Button
                onClick={handleClose}
                sx={{ color: "red", fontSize: "16px" }}
              >
                Cancel
              </Button>
            </div>
          </DialogContentText>
        </Dialog>

        <Dialog
          open={isRemoveDialogOpen}
          keepMounted
          onClose={handleCloseRemoveDialog}
          PaperProps={{
            component: "form",
            onSubmit: handleSave,
            sx: { backgroundColor: "#f2eee9", borderRadius: "30px" }, // modal background
          }}
          sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <DialogContentText
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "30px",
              margin: "5px",
              color: "#8a2be2",
              fontFamily: "inherit",
              fontSize: "20px",
            }}
          >
            Are you sure you want to remove this user?
            <div>
              <Button
                onClick={handleSaveRemoveUser}
                sx={{ color: "green", fontSize: "16px" }}
              >
                Yes
              </Button>
              <Button
                onClick={handleCloseRemoveDialog}
                sx={{ color: "red", fontSize: "16px" }}
              >
                Cancel
              </Button>
            </div>
          </DialogContentText>
        </Dialog>

        {/* Snackbar pentru mesaje */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default UsersProfile;
