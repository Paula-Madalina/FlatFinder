import React, { useState } from "react";
import { Button, TextField, Typography, Container, Paper } from "@mui/material";
import "./ForgotPassword.css";
import { ToastContainer } from "react-toastify";
import showToastr from "../../SERVICES/toaster-service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleReset = (event) => {
    event.preventDefault(); 

    if (email.trim()) {
      showToastr("success", "A link to reset your password has been sent to your email address.");
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
