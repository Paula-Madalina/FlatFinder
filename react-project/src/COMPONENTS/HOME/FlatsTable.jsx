import { useEffect, useState } from "react";
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
  const [favorites, setFavorites] = useState(currentUser?.favoriteFlatList || []);
  const [editFlatId, setEditFlatId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const navigate = useNavigate();
  

  const fetchFlats = async () => {
    let foundFlats;
    let searchFlats;
    console.log(currentUser)
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
              Authorization: `Bearer ${token}`, 
            },
          }
        );
        console.log(response)
        if (response.status !== 200) {
          throw new Error("Failed to fetch flats from backend");
        }

        const response2 = await axios.get(`http://localhost:3000/flats/getFavoriteFlats/${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.data);
        console.log(response2.data.data);

        setFlats(response.data.data);
        let updatedFavorites;
        try{
          console.log(favorites)
          updatedFavorites = favorites.filter((flat) => flat?._id.toString() !== currentUser._id?.toString());
          console.log(updatedFavorites)
          let array=[];
          for(let arr of updatedFavorites)
          {
            array.push(arr._id);
          }
          console.log(array);
    
          setFavorites(array); 
       }
       catch{
         
         updatedFavorites=favorites.filter(x=>x!==currentUser._id?.toString())
         console.log(favorites,updatedFavorites)
         
         setFavorites(updatedFavorites); 
       }
      } catch(error) {
        console.log("The Error is: " + error)
      }
    } else if (tableType === "myFlats" && currentUser) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("NO TOKEN FOUND");
        }
        const response = await axios.get(
            `http://localhost:3000/flats/getMyFlats/${currentUser._id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            }
        );
        

        if (response.status !== 200) {
            throw new Error("Failed to fetch flats from backend");
        }

        setFlats(response.data.data);  
    } catch (error) {
        if(error.response.data.message == 'No flats found for this user') {
           setFlats([]) ;
        }
    }

      
  } else if (tableType === "favorites" && currentUser) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("NO TOKEN FOUND");
          }
          
          const response = await axios.get(`http://localhost:3000/flats/getFavoriteFlats/${currentUser._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (response.status === 200 && response.data.data) {
            const favoriteFlats = response.data.data;
            setFlats(favoriteFlats);  
           
            setFavorites(favoriteFlats)
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
            `http://localhost:3000/flats/updateFlat/${updatedFlat._id}`, 
            updatedFlat,  
            {
                headers: {
                    Authorization: `Bearer ${token}`,  
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
      const token = localStorage.getItem("token");
      if (!token) {
          throw new Error("No token found");
      }

      const response = await axios.delete(
          `http://localhost:3000/flats/deleteFlat/${id}`,
          {
              headers: {
                  Authorization: `Bearer ${token}`, 
              },
          }
      );

      if (response.status === 200) {
          setFlats(flats.filter((flat) => flat._id !== id)); 
          handleCloseDeleteModal(); 
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
     
      setFavorites((prevFavorites) =>
        prevFavorites.includes(flatId)
          ? prevFavorites.filter((id) => id !== flatId) 
          : [...prevFavorites, flatId] 
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

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

   
    const response = await axios.delete(`http://localhost:3000/flats/removeFavorite/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    if (response.status === 200) {
      console.log(favorites)
      let updatedFavorites;
    try{
       updatedFavorites = favorites.filter((flat) => flat?._id.toString() !== id?.toString());
       console.log(updatedFavorites)
       let array=[];
       for(let arr of updatedFavorites)
       {
         array.push(arr._id);
       }
       console.log(array);
 
       setFavorites(array); 
    }
    catch{
      
      updatedFavorites=favorites.filter(x=>x!==id?.toString())
      console.log(favorites,updatedFavorites)
      
      setFavorites(updatedFavorites); 
    }
    
      if (tableType === "favorites") {
        const updatedFlats = flats.filter((flat) => flat?._id?.toString() !== id?.toString());
        setFlats(updatedFlats);
      }

    
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
        console.log(params.row, favorites)
        const isOwner = params.row._id === currentUser._id;

        if (!isOwner) {
          return (
            <IconButton onClick={() => handleToggleFavorite(params.row._id)}>
              {
              
              
              favorites.includes(params.row._id) ? (
                <Favorite style={{ color: "red" }} />
              ) : (
                <FavoriteBorder style={{ color: "red" }} />
              )
              
              }
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
        rows={flats && Array.isArray(flats) ? flats.map(flat => ({ ...flat, id: flat._id })) : []} 
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
          sx: { backgroundColor: "#f2eee9", borderRadius: "30px" },
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
