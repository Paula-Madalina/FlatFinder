/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from "axios";


const EditFlat = ({ open, onClose, flatId, onUpdate }) => {
  const [flatData, setFlatData] = useState({});

  useEffect(() => {
    const fetchFlatData = async () => {
      if (flatId) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No token found");
          }

          // Cerere către backend pentru a prelua datele flatului
          const response = await axios.get(
            `http://localhost:3000/flats/getByID/${flatId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            setFlatData(response.data); // Setăm datele flatului
          }
        } catch (error) {
          console.error("Error fetching flat details:", error);
        }
      }
    };

    fetchFlatData();
  }, [flatId]);


  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFlatData({ ...flatData, [name]: type === "checkbox" ? checked : value });
  };

   const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Cerere PATCH pentru actualizarea flatului
      const response = await axios.patch(
        `http://localhost:3000/flats/updateFlat/${flatId}`,
        flatData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        onUpdate(response.data.data); 
        onClose(); 
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating flat:", error);
    }
  };
  

  return (
    <Dialog
    sx={{
      backgroundColor:"rgba(0, 0, 0, 0.7)"
    }}
      open={open}
      onClose={onClose}
      PaperProps={{
        
        component: "form",
        onSubmit: (e) => {
          e.preventDefault();
          handleSave();
        },
        sx: { backgroundColor: "#f2eee9", borderRadius:"30px" }

      }}
    >
      <DialogTitle sx={{
        color:"blue",
        fontFamily:"inherit",
        fontSize:"22px"

      }}>Edit Flat</DialogTitle>
      <DialogContent>
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
            value={flatData.city || ""}
            onChange={handleChange}
          />
          <TextField
            required
            margin="dense"
            name="streetName"
            label="Street Name"
            type="text"
            fullWidth
            variant="outlined"
            value={flatData.streetName || ""}
            onChange={handleChange}
          />
          <TextField
            required
            margin="dense"
            name="streetNumber"
            label="Street Number"
            type="number"
            fullWidth
            variant="outlined"
            value={flatData.streetNumber || ""}
            onChange={handleChange}
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
          value={flatData.areaSize || ""}
          onChange={handleChange}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={flatData.hasAC || false}
              onChange={(e) =>
                handleChange({
                  target: { name: "hasAC", value: e.target.checked },
                })
              }
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
          value={flatData.yearBuilt || ""}
          onChange={handleChange}
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
          value={flatData.rentPrice || ""}
          onChange={handleChange}
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
          value={flatData.dateAvailable || ""}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{color:"red"}}>Cancel</Button>
        <Button type="submit" sx={{color:"green"}}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFlat;
