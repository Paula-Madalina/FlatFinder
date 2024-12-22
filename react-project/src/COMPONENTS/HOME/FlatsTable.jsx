import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  documentId,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../CONTEXT/authContext";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import {
  Delete,
  Edit,
  Favorite,
  FavoriteBorder,
  Visibility,
} from "@mui/icons-material";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import { useNavigate } from "react-router-dom";
import EditFlat from "../HOME ACTIONS/EditFlat";
import "./Home.css";
import "./FlatsTable.css";
import { Dialog, DialogContentText, Button } from "@mui/material";
import axios from "axios";

function FlatsTable({ tableType, refetchFlag }) {
  const [flats, setFlats] = useState([]);
  const { currentUser } = useAuth();
  const [role, setRole] = useState("user");
  const [favorites, setFavorites] = useState([]);
  const [editFlatId, setEditFlatId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const navigate = useNavigate();
  

  const fetchFlats = async () => {
    let foundFlats;
    let searchFlats;
    if (tableType === "all") {
      try {
        
        const token = localStorage.getItem("token");
        if(!token) {
          throw new Error("NO TOKEN FOUND")
        }
        const response = await axios.get(
          'http://localhost:3000/flats/getAllFlats',
          {
            headers: {
              Authorization: `Bearer ${token}`, // Trimite token-ul JWT în header
            },
          }
        );
        console.log(response)
        if (response.status !== 200) {
          throw new Error("Failed to fetch flats from backend");
        }
        // const data = await response.json();
        setFlats(response.data.data);
      } catch(error) {
        console.log("The Error is: " + error)
      }
    } else if (tableType === "myFlats" && currentUser) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("NO TOKEN FOUND");
        }
        console.log("currentUser._id:", currentUser._id); 
        const response = await axios.get(
            `http://localhost:3000/flats/getMyFlats/${currentUser._id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            }
        );
        
        console.log(response)

        if (response.status !== 200) {
            throw new Error("Failed to fetch flats from backend");
        }
        
        setFlats(response.data.data);  // Salvează apartamentele
    } catch (error) {
        if(error.response.data.message == 'No flats found for this user') {
           setFlats([]) ;
        }
    }

      
      // searchFlats = query(
      //   collection(db, "flats"),
      //   where("userUid", "==", currentUser.uid)
      // );
      // foundFlats = await getDocs(searchFlats);
  } else if (tableType === "favorites" && currentUser) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("NO TOKEN FOUND");
          }
          
          // Apelăm endpoint-ul pentru a obține doar apartamentele favorite
          const response = await axios.get(`http://localhost:3000/flats/getFavoriteFlats/${currentUser._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (response.status === 200 && response.data.data) {
            const favoriteFlats = response.data.data;
            setFlats(favoriteFlats);  // Actualizează starea cu apartamentele favorite
          } else {
            console.log('No favorite flats found');
          }
        } catch (error) {
          console.log("The Error is: " + error);
        }
      }
    };

  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role || "user");
    }
    fetchFlats();
  }, [tableType, currentUser, role, refetchFlag]);

  const handleEdit = (id) => {
    console.log("Flat ID for edit:", id); // Verifică dacă primești un ID valid
    setEditFlatId(id);
    setIsEditModalOpen(true);
};


  const handleCloseEditModal = () => {
    fetchFlats();
    setIsEditModalOpen(false);
    setEditFlatId(null);
  };

  const handleUpdateFlat = async (updatedFlat) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        const response = await axios.patch(
            `http://localhost:3000/flats/updateFlat/${updatedFlat._id}`,  // URL-ul backend-ului pentru actualizare
            updatedFlat,  // Datele flatului actualizate
            {
                headers: {
                    Authorization: `Bearer ${token}`,  // Trimite token-ul pentru autentificare
                },
            }
        );

        if (response.status === 200) {
            setFlats((prevFlats) =>
                prevFlats.map((flat) =>
                    flat.id === updatedFlat.id ? updatedFlat : flat
                )
            );
            handleCloseEditModal();
            console.log("Flat updated successfully");
        } else {
            console.log("Error updating flat:", response.data.message);
        }
    } catch (error) {
        console.error("Error updating flat:", error);
    }
};


const handleDeleteFlat = async (id) => {
  try {
      const token = localStorage.getItem("token"); // Asigură-te că ai un token valid
      if (!token) {
          throw new Error("No token found");
      }

      const response = await axios.delete(
          `http://localhost:3000/flats/deleteFlat/${id}`, // Ruta backend pentru ștergere
          {
              headers: {
                  Authorization: `Bearer ${token}`, // Trimite token-ul pentru autentificare
              },
          }
      );

      if (response.status === 200) {
          setFlats(flats.filter((flat) => flat._id !== id)); // Actualizează lista de flats în UI
          handleCloseDeleteModal(); // Închide modalul de confirmare
          console.log("Flat deleted successfully");
      } else {
          console.log("Failed to delete flat:", response.data.message);
      }
  } catch (error) {
      console.error("Error deleting flat:", error);
  }
};


  const handleDelete = (id) => {
    setEditFlatId(id);
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
  };


const handleToggleFavorite = async (flatId) => {
  try {
    const token = localStorage.getItem("token"); 
      if (!token) {
          throw new Error("No token found");
      }

      const response = await axios.post(
        `http://localhost:3000/flats/favorite/${flatId}`, 
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );

    if (response.status === 200) {
      console.log("Favorite updated:", response.data);
      // Actualizează lista locală de favorite după ce primești răspunsul de la server
      setFavorites((prevFavorites) =>
        prevFavorites.includes(flatId)
          ? prevFavorites.filter((id) => id !== flatId) // Elimină dacă există
          : [...prevFavorites, flatId] // Adaugă dacă nu există
      );
    } else {
      console.error("Error updating favorite:", response.data.error);
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};


const handleDeleteFavorite = async (id) => {
  if (!currentUser) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    console.log("ID to delete:", id);  // Verifică ID-ul care este trimis
    console.log("Favorites before update:", favorites);  // Verifică favoritele înainte de update

    // Trimite cererea DELETE către backend pentru a elimina apartamentul din favorite
    const response = await axios.delete(`http://localhost:3000/flats/removeFavorite/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response data:", response.data);  // Verifică ce răspunde backend-ul

    if (response.status === 200) {
      // Actualizează lista de favorite în frontend fără a aștepta un reload al paginii
      const updatedFavorites = favorites.filter((flat) => flat?.toString() !== id?.toString());
      console.log("Updated favorites:", updatedFavorites);

      // Actualizare directă a stării pentru favorites
      setFavorites(updatedFavorites); 

      // Actualizează lista de flats dacă suntem pe pagina de favorite
      if (tableType === "favorites") {
        const updatedFlats = flats.filter((flat) => flat?.id?.toString() !== id?.toString());
        console.log("Updated flats:", updatedFlats);
        setFlats(updatedFlats);
      }

      console.log("Flat removed from favorites:", response.data);  
      window.location.reload();
    }
  } catch (error) {
    console.error("Error deleting favorite:", error);
  }
};

 






  

  const columns = [
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "streetName",
      headerName: "St. Name",
      flex: 1,
    },
    {
      field: "streetNumber",
      headerName: "St. No.",
      flex: 1,
    },
    {
      field: "areaSize",
      headerName: "Area Size",
      flex: 1,
    },
    {
      field: "hasAC",
      headerName: "Has AC",
      flex: 1,
    },
    {
      field: "yearBuilt",
      headerName: "Year Built",
      flex: 1,
    },
    {
      field: "rentPrice",
      headerName: "Rent Price",
      flex: 1,
    },
    {
      field: "dateAvailable",
      headerName: "Date Available",
      flex: 1,
    },
    {
      field: "view",
      headerName: "View",
      renderCell: (params) => (
        <IconButton onClick={() => navigate(`/flats/${params.row._id}`)}> 
          <Visibility style={{ color: "green" }} />
        </IconButton>
      ),
      flex: 1,
    }
    
  ];

  if (tableType === "all") {
    columns.push({
      field: "favorite",
      headerName: "Favorite",
      renderCell: (params) => {
        // console.log(params.row._id, currentUser._id)
        const isOwner = params.row._id === currentUser._id;

        if (!isOwner) {
          return (
            <IconButton onClick={() => handleToggleFavorite(params.row._id)}>
              {favorites.includes(params.row._id) ? (
                <Favorite style={{ color: "red" }} />
              ) : (
                <FavoriteBorder style={{ color: "red" }} />
              )}
            </IconButton>
          );
        }
        return null;
      },
      flex: 1,
    });
  }

  if (tableType === "myFlats") {
    columns.push(
      {
        field: "edit",
        headerName: "Edit",
        renderCell: (params) => (
          <IconButton onClick={() =>  handleEdit(params.row._id)}>
            <Edit style={{ color: "blue" }} />
          </IconButton>
        ),
        flex: 1,
      },
      {
        field: "delete",
        headerName: "Delete",
        renderCell: (params) => (
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <Delete style={{ color: "red" }} />
          </IconButton>
        ),
        flex: 1,
      }
    );
  }

  if (tableType === "favorites") {
    columns.push({
      field: "favorite",
      headerName: "Delete Favorite",
      renderCell: (params) => (
        <IconButton onClick={() => handleDeleteFavorite(params.row._id)}>
          <HeartBrokenIcon style={{ color: "red" }} />
        </IconButton>
      ),
      flex: 1,
    });
  }

  return (
    <div style={{ height: 500, width: "80%", margin: "auto" }}>
      <DataGrid
        className="custom__class"
        sx={{
          ".MuiDataGrid-menuIcon": {
            visibility: "visible",
            width: "auto",
          },
        }}
        autoHeight
        autosizeOnMount
        rows={flats && Array.isArray(flats) ? flats.map(flat => ({ ...flat, id: flat._id })) : []} // Verificăm dacă flats este un array valid
        columns={columns}
        pageSize={5}
        getRowId={(row) => row._id} 
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
      />

      {/* Modal for Editing Flat */}
      {editFlatId && (
        <EditFlat
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          flatId={editFlatId}
          onUpdate={handleUpdateFlat}
        />
      )}

      <Dialog
        open={deleteModal}
        keepMounted
        onClose={handleCloseDeleteModal}
        PaperProps={{
          component: "form",
          onSubmit: handleDeleteFlat,
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
          Are you sure you want to delete this flat?
          <div>
            <Button
              onClick={() => handleDeleteFlat(editFlatId)}
              sx={{ color: "green", fontSize: "16px" }}
            >
              Yes
            </Button>
            <Button
              onClick={handleCloseDeleteModal}
              sx={{ color: "red", fontSize: "16px" }}
            >
              Cancel
            </Button>
          </div>
        </DialogContentText>
      </Dialog>
    </div>
  );
}

export default FlatsTable;
