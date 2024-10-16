import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./COMPONENTS/AUTH/Login.jsx";
import Register from "./COMPONENTS/AUTH/Register.jsx";
import Home from "./COMPONENTS/HOME/Home.jsx";
import Inbox from "./COMPONENTS/INBOX/Inbox.jsx";
import ViewFlat from "./COMPONENTS/HOME ACTIONS/ViewFlat.jsx";
import ForgotPassword from "./COMPONENTS/AUTH/ForgotPassword.jsx";
import FirstView from "./COMPONENTS/FIRST_VIEW/FirstView.jsx";
import Profile from "./COMPONENTS/PROFILE/Profile.jsx";
import { AuthProvider } from "./CONTEXT/authContext.jsx";
import AllUsers from "./COMPONENTS/ADMIN ONLY/AllUsers.jsx";
import UsersProfile from "./COMPONENTS/ADMIN ONLY/UsersProfile.jsx";
import "./COMPONENTS/AUTH/Auth.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/register",
    element: <Register></Register>,
  },
  {
    path: "/inbox",
    element: <Inbox></Inbox>,
  },
  {
    path: "/flats/:flatId",
    element: <ViewFlat></ViewFlat>,
  },
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "/ForgotPassword",
    element: <ForgotPassword></ForgotPassword>,
  },
  {
    path: "/FirstView",
    element: <FirstView></FirstView>,
  },
  {
    path: "/profile-update",
    element: <Profile></Profile>,
  },
  {
    path: "/all-users",
    element: <AllUsers></AllUsers>,
  },
  {
    path: "/users-profile/:userUId",
    element: <UsersProfile></UsersProfile>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
