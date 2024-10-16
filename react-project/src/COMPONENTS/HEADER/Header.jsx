import { useEffect, useState } from "react";
import "./Header.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../CONTEXT/authContext";
import { doSignOut } from "../../auth";
import "boxicons/css/boxicons.min.css";
import Modal from "react-modal";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";


Modal.setAppElement("#root"); // Set the root element for accessibility

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, userLoggedIn } = useAuth();
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

const toggleDrawer = (open) => (event) => {
  if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    return;
  }
  setDrawerOpen(open);
};


  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role || "user");
    }
  }, [currentUser, role]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      style={{
        background: "linear-gradient(rgba(44, 44, 44, 0.1), transparent)",
        border: "none",
      }}
    >
      <Toolbar className="navbar__container">
        <div
          className="header__logo__and__greetings"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Greetings */}
          {currentUser && (
            <Typography variant="h6" sx={{ marginRight: 2, flexGrow: 1 }}>
              <div>
                {userLoggedIn ? (
                  <>
                    <div className="greetings__users">
                      Hello, {currentUser ? currentUser.fullName : "User"}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </Typography>
          )}
          {/* Company Logo */}
          <div
            className="logo__content"
            style={{ flexGrow: 1, textAlign: "center" }}
          >
            <Typography variant="h6" className="color-fade">
              <i className="bx bxs-home-heart"></i>
            </Typography>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="color-fade"
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                  margin: "10px",
                  fontFamily: "Baskervville SC",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: 26,
                },
              }}
            >
              FlatFinder
            </Typography>
          </div>
        </div>

        <div className="navigation__buttons">
          {/* Navigation Buttons */}
          <Button
            className="navbar__home__button navbar__button__text"
            color="inherit"
            component={Link}
            onClick={() => {
              navigate("/");
            }}
            sx={{
              flexGrow: 1,
              fontFamily: "Cormorant Upright",
              fontSize: "16px",
              fontWeight: 300,
              fontStyle: "normal",
            }}
          >
            Home
          </Button>
          <Button
            className="navbar__inbox__button navbar__button__text"
            color="inherit"
            component={Link}
            onClick={() => {
              navigate("/inbox");
            }}
            sx={{
              flexGrow: 1,
              fontFamily: "Cormorant Upright",
              fontSize: "16px",
              fontWeight: 300,
              fontStyle: "normal",
            }}
          >
            Inbox
          </Button>

          {/* All Users Button (Admin Only) */}
          {currentUser && role === "admin" && (
            <Button
              className="navbar__allUsers__button navbar__button__text"
              color="inherit"
              component={Link}
              to="/all-users"
              sx={{
                flexGrow: 1,
                whiteSpace: "nowrap",
                fontFamily: "Cormorant Upright",
                fontSize: "16px",
                fontWeight: 300,
                fontStyle: "normal",
              }}
            >
              All Users
            </Button>
          )}

          {/* User Account Menu */}
          <IconButton
            className="navbar__profile__button"
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </div>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{ marginTop: "40px" }}
        >
          <MenuItem
            sx={{ fontFamily: "inherit", fontSize: "18px" }}
            onClick={() => {
              handleClose();
              navigate("/profile-update");
            }}
          >
            My Profile
          </MenuItem>
          <MenuItem
            sx={{ fontFamily: "inherit", fontSize: "18px" }}
            onClick={() => {
              doSignOut().then(() => {
                navigate("/login");
              });
            }}
          >
            Logout
          </MenuItem>
        </Menu>

        {/* Burger Menu Icon for small screens */}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/inbox" onClick={toggleDrawer(false)}>
            <ListItemText primary="Inbox" />
          </ListItem>
          {currentUser && role === "admin" && (
            <ListItem button component={Link} to="/all-users" onClick={toggleDrawer(false)}>
              <ListItemText primary="All Users" />
            </ListItem>
          )}
          <ListItem button component={Link} to="/profile-update" onClick={toggleDrawer(false)}>
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem button onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
              toggleDrawer(false)();
            });
          }}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      </Toolbar>
    </AppBar>
  );
}
