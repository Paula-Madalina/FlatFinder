import React, { useState } from "react";
import { Button, TextField, Typography, Container, Paper } from "@mui/material";
import "./ForgotPassword.css";
import { ToastContainer } from "react-toastify";
import showToastr from "../../SERVICES/toaster-service";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleReset = async (event) => {
    event.preventDefault(); 

    if (email.trim()) {
      console.log('Email:', email); // Asigură-te că emailul este trimis corect

      try {
        // Trimiterea cererii către backend pentru resetarea parolei
        const response = await axios.post("http://localhost:3000/users/forgotPassword", { email });
        console.log('Response:', response);

        showToastr("success", response.data.message || "A link to reset your password has been sent.");
        setTimeout(() => {
          navigate(`/resetPassword/${response.data.token}`);
        }, 2000);
      } catch (error) {
        // Erorile de la server
        showToastr("error", error.response?.data?.error || "An error occurred.");
      }
    } else {
      showToastr("error", "Please enter your email address.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <ToastContainer />

      <Paper elevation={3} className="forgot-password-paper">
        <Typography component="h1" variant="h5" className="forgot-password-title">
          Forgot Password
        </Typography>
        <Typography variant="body1" className="forgot-password-description">
          Enter your email address below and we will send you a link to reset your password.
        </Typography>
        <form className="forgot-password-form" onSubmit={handleReset}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
            value={email}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="forgot-password-submit"
          >
            Send Reset Link
          </Button>
        </form>
      </Paper>
    </Container>
  );
};


export default ForgotPassword;
