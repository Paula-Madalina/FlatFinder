import React, { useEffect, useState } from 'react';
import Header from '../HEADER/Header';
import './AllUsers.css';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { IconButton, Paper } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import axios from 'axios';

function AllUsers() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("NO TOKEN FOUND");
                }
    
                const response = await axios.get('http://localhost:3000/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const usersWithFlatsCount = await Promise.all(
                    response.data.map(async (user) => {
                        const flatsCountResponse = await axios.get(`http://localhost:3000/flats/flatsCount/${user._id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
    
                        return {
                            ...user,
                            flatsCount: flatsCountResponse.data.count,  
                        };
                    })
                );
    
                setUsers(usersWithFlatsCount); 
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
    
        fetchUsers();
    }, []);
    

    const columns = [
      { field: 'fullName', headerName: 'Name', flex: 0.2, minWidth: 120, headerClassName: 'header-style-allUsers', cellClassName: 'cell-style-allUsers' },
      { field: 'email', headerName: 'Email', flex: 0.2, minWidth: 150, headerClassName: 'header-style-allUsers', cellClassName: 'cell-style-allUsers' },
      { field: 'flatsCount', headerName: 'Flats', flex: 0.1, minWidth: 70, headerClassName: 'header-style-allUsers', cellClassName: 'cell-style-allUsers' },
      { field: 'isAdmin', headerName: 'Admin', flex: 0.1, minWidth: 90, headerClassName: 'header-style-allUsers', cellClassName: 'cell-style-allUsers' },
      {
          field: "view",
          headerName: "View",
          flex: 0.1,
          minWidth: 70,
          renderCell: (params) => (
              <IconButton onClick={() => navigate(`/users-profile/${params.row._id}`)}>
                  <VisibilityIcon className="view__icon__allusers" />
              </IconButton>
          ),
          headerClassName: 'header-style-allUsers',
          cellClassName: 'cell-style-allUsers',
      }
  ];

    return (
        <>
            <div className='backgroud__container'>
                <Header />
                <KeyboardReturnIcon
                    onClick={() => navigate("/")}
                    sx={{
                        color: "gray",
                        margin: "10px 20px",
                        cursor: "pointer"
                    }} />
                <div className='hero__content'>
                    <h1 className='hero__table__title'>ALL USERS</h1>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 10px' }}>
        <Paper sx={{ width: '100%', maxWidth: '700px', overflowX: 'auto' }}> 
            <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row._id}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                autoHeight
                sx={{
                 
                '.MuiDataGrid-menuIcon': {
                    visibility: 'visible !important',
                    width: 'auto !important',
                }, overflow: 'clip',
                    border: 0,
                    backgroundColor: 'rgba(241,243,244,255)',
                }}
            />
        </Paper>
    </div>

                </div>
            </div>
        </>
    );
}

export default AllUsers;
