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
      searchFlats = query(collection(db, "flats"));
      foundFlats = await getDocs(searchFlats);
    } else if (tableType === "myFlats" && currentUser) {
      searchFlats = query(
        collection(db, "flats"),
        where("userUid", "==", currentUser.uid)
      );
      foundFlats = await getDocs(searchFlats);
    } else if (tableType === "favorites" && currentUser) {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.data();
      if (userData.favorites && userData.favorites.length > 0) {
        searchFlats = query(
          collection(db, "flats"),
          where(documentId(), "in", userData.favorites)
        );
        foundFlats = await getDocs(searchFlats);
      } else {
        searchFlats = null;
        foundFlats = null;
      }
    }

    if (foundFlats) {
      const flatsList = foundFlats.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlats(flatsList);
    } else {
      setFlats([]);
    }

    if (currentUser) {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.data();
      if (userData?.favorites.length > 0) {
        setFavorites(userData.favorites);
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
      const flatDocRef = doc(db, "flats", updatedFlat.id);
      await updateDoc(flatDocRef, updatedFlat);

      setFlats((prevFlats) =>
        prevFlats.map((flat) =>
          flat.id === updatedFlat.id ? updatedFlat : flat
        )
      );

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating flat: ", error);
    }
  };

  const handleDeleteFlat = async (id) => {
    try {
      await deleteDoc(doc(db, "flats", id));
      setFlats(flats.filter((flat) => flat.id !== id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting flat: ", error);
    }
  };

  const handleDelete = (id) => {
    setEditFlatId(id);
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
  };

  const handleToggleFavorite = async (id) => {
    const userToUpdate = doc(db, "users", currentUser.uid);
    let updatedFavorites = [...favorites];

    if (!favorites.includes(id)) {
      updatedFavorites.push(id);
      await updateDoc(userToUpdate, { favorites: updatedFavorites });
    } else {
      updatedFavorites = updatedFavorites.filter((favId) => favId !== id);
      await updateDoc(userToUpdate, { favorites: updatedFavorites });
    }

    setFavorites(updatedFavorites);

    if (tableType === "favorites") {
      setFlats(flats.filter((flat) => flat.id !== id));
    }
  };

  const handleDeleteFavorite = async (id) => {
    if (!currentUser) return;

    try {
      const userToUpdate = doc(db, "users", currentUser.uid);
      const data = await getDoc(userToUpdate);
      const user = data.data();
      const updatedFavorites = user.favorites.filter((favId) => favId !== id);

      await updateDoc(userToUpdate, { favorites: updatedFavorites });

      setFavorites(updatedFavorites);

      if (tableType === "favorites") {
        setFlats(flats.filter((flat) => flat.id !== id));
      }
    } catch (error) {
      console.error("Error deleting favorite: ", error);
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
      field: "hasAc",
      headerName: "Has AC",
      flex: 1,
    },
    {
      field: "yearBuild",
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
        <IconButton onClick={() => navigate(`/flats/${params.row.id}`)}>
          <Visibility style={{ color: "green" }} />
        </IconButton>
      ),
      flex: 1,
    },
  ];

  if (tableType === "all") {
    columns.push({
      field: "favorite",
      headerName: "Favorite",
      renderCell: (params) => {
        const isOwner = params.row.userUid === currentUser.uid;
        if (!isOwner) {
          return (
            <IconButton onClick={() => handleToggleFavorite(params.row.id)}>
              {favorites.includes(params.row.id) ? (
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
          <IconButton onClick={() => handleEdit(params.row.id)}>
            <Edit style={{ color: "blue" }} />
          </IconButton>
        ),
        flex: 1,
      },
      {
        field: "delete",
        headerName: "Delete",
        renderCell: (params) => (
          <IconButton onClick={() => handleDelete(params.row.id)}>
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
        <IconButton onClick={() => handleDeleteFavorite(params.row.id)}>
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
        rows={flats}
        columns={columns}
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
