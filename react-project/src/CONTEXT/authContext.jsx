import { useContext, useEffect, useState, createContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate(); 


 useEffect(() => {
  console.log("USE EFFECT INITI CONTEXT")
  const token = localStorage.getItem("token");
  if (token) {
    verifyUser(token);
  } else {
    setLoading(false);
  }
}, []);



async function verifyUser(token) {
  setLoading(true);
  try {
    const response = await axios.get("http://localhost:3000/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`        
      },
    });
    console.log("Response from backend:", response);
    if (response.data.user) {
      setCurrentUser(response.data.user);
      const email = response.data.user.email;  

      console.log(email)
      setUserLoggedIn(true);
    }
  } catch (error) {
    if (error.response && error.response.data.message === 'jwt expired') {
      localStorage.removeItem('token'); 
      setUserLoggedIn(false);
      setCurrentUser(null);
      // navigate('/login');
    }
    console.error("User verification failed", error);
  }
  setLoading(false);
}

  
const refreshUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await axios.get("http://localhost:3000/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      setCurrentUser(response.data);
    } else {
      console.error("Failed to refresh user");
    }
  } catch (error) {
    console.error("Error refreshing user:", error);
  }
};

  

async function reauthenticate(password) {
  const user = currentUser;
  if (!user) throw new Error("No user is currently logged in.");

  try {
    const response = await axios.post("http://localhost:3000/auth/login", {
      email: user.email,
      password: password,
    });
    return response.data;
  } catch (error) {
    throw new Error("Reauthentication failed");
  }
}

const value = { currentUser, userLoggedIn, loading, reauthenticate, setCurrentUser, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
