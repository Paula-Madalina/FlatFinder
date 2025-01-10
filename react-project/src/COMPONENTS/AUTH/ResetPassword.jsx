import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; 
import './ResetPassword.css'; 
import { ToastContainer } from "react-toastify";
import showToastr from "../../SERVICES/toaster-service";

const ResetPassword = () => {
  const { token } = useParams();  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); 
  const handleResetPassword = async (event) => {
        event.preventDefault();
      
        const token = window.location.pathname.split('/')[2]; 
      
        if (newPassword && confirmPassword) {
          try {
            const response = await axios.post(`http://localhost:3000/users/resetPassword/${token}`, {
              password: newPassword,
            });
            console.log(response.data); 
            showToastr("success", "Password reset successfully.");
            setTimeout(() => {
                navigate("/login");
              }, 2000);
          } catch (error) {
            showToastr("error", error.response?.data?.error || "An error occurred.");
          }
        } else {
          showToastr("error", "Passwords do not match.");
        }
      };
      
  return (
    <div className="reset-password-container">
              <ToastContainer />
        
      <form className="reset-password-form" onSubmit={handleResetPassword}>
        <h2>Reset Password</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div>
          <label>New Password:</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
