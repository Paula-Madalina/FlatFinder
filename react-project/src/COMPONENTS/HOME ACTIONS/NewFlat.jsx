import * as React from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Slide,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import showToastr from "../../SERVICES/toaster-service";
import { useAuth } from "../../CONTEXT/authContext";
import "../HOME/Home.css";
import axios from "axios";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewFlat({ setRefetchFlag }) {
  const [open, setOpen] = React.useState(false);
  const [hasAC, setHasAC] = React.useState(false);
  const { currentUser } = useAuth();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCheckboxChange = (event) => {
    setHasAC(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
  
    // Add the hasAc checkbox value to formJson
    formJson.hasAC = hasAC;
  
    if (currentUser) {
      const flatData = {
        ...formJson,
        userUid: currentUser._id, 
        createdAt: new Date(),
      };
      console.log(currentUser);
      console.log(flatData);
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        console.log(token);
  
        const response = await axios.post(
          `http://localhost:3000/flats/register`,
          flatData, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log(response);
  
        if (response.status !== 200) {
          throw new Error("Failed to add flat");
        }
  
        showToastr(
          "success",
          "Your flat has been successfully added! You are being redirected."
        );
  
        setRefetchFlag(true);
        handleClose();
      } catch (error) {
        showToastr("error", `Error adding flat: ${error}`);
      }
    } else {
      console.error("No currentUser is signed in.");
    }
  };
  

  return (
    <React.Fragment>
      <ToastContainer></ToastContainer>
      <div className="add_flat_box">
        <Button
          variant="outlined"
          className="add_flat_button"
          onClick={handleClickOpen}
        >
          +
        </Button>
      </div>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
          sx: { backgroundColor: "#f2eee9", borderRadius: "30px" },
        }}
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <DialogContent>
          <DialogContentText
            sx={{
              margin: "5px",
              color: "blue",
              fontFamily: "inherit",
              fontSize: "20px",
            }}
          >
            To add a new flat, please complete all fields.
          </DialogContentText>
          <Stack spacing={2} direction="row" sx={{ marginTop: 2 }}>
            <TextField
              autoFocus
              required
              margin="dense"
              name="city"
              label="City"
              type="text"
              fullWidth
              variant="outlined"
            />
            <TextField
              required
              margin="dense"
              name="streetName"
              label="Street Name"
              type="text"
              fullWidth
              variant="outlined"
            />
            <TextField
              required
              margin="dense"
              name="streetNumber"
              label="Street Number"
              type="string"
              fullWidth
              variant="outlined"
            />
          </Stack>

          <TextField
            required
            margin="dense"
            name="areaSize"
            label="Area Size"
            type="number"
            fullWidth
            variant="outlined"
            sx={{ marginTop: 2 }}
          />

          {/* Checkbox for Has AC */}
          <FormControlLabel
            control={
              <Checkbox
                checked={hasAC}
                onChange={handleCheckboxChange}
                name="hasAC"
                color="primary"
              />
            }
            label="Has AC"
            sx={{ marginTop: 2 }}
          />

          <TextField
            required
            margin="dense"
            name="yearBuilt"
            label="Year Built"
            type="number"
            fullWidth
            variant="outlined"
            sx={{ marginTop: 2 }}
          />
          <TextField
            required
            margin="dense"
            name="rentPrice"
            label="Rent Price"
            type="number"
            fullWidth
            variant="outlined"
            sx={{ marginTop: 2 }}
          />
          <TextField
            required
            margin="dense"
            name="dateAvailable"
            label="Date Available"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "red" }}>
            Cancel
          </Button>
          <Button type="submit" sx={{ color: "green" }}>
            Add Flat
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
