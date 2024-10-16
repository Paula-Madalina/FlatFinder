import { useState, useEffect } from "react";
import "boxicons/css/boxicons.min.css";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import GoogleIcon from "../../assets/GOOGLE-ICON.svg";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { validationRules } from "../../VALIDATIONS/validation";
import showToastr from "../../SERVICES/toaster-service";
import { ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../CONTEXT/authContext";
import { doCreateUserWithEmailAndPassword } from "../../auth";
import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";

function Register() {
  const label = [];
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [isReg, setIsReg] = useState(false);
  // const { currentUser } = useAuth();

  // useEffect(() => {
  //   console.log(currentUser);
  //   if (currentUser) {
  //     navigate("/FirstView");
  //   }
  // }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClick = async () => {
    let validationResponse = true;

    // Validate Full Name
    validationResponse =
      validationRules["fullName"](formData.fullName) && validationResponse;

    // Validate Email
    validationResponse =
      validationRules["email"](formData.email) && validationResponse;

    // Validate Birth Date
    validationResponse =
      validationRules["birthDate"](formData.birthDate) && validationResponse;

    // Validate Password
    validationResponse =
      validationRules["password"](formData.password) && validationResponse;

    // Validate Confirm Password
    validationResponse =
      validationRules["confirmPassword"](
        formData.confirmPassword,
        formData.password
      ) && validationResponse;

    if (!validationResponse) {
      // Validation failed
      console.log("Validation failed, correct the errors");
      return; // Stop execution if validation fails
    }

    if (!isReg) {
      setIsReg(true);
      try {
        const user = await doCreateUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        // Add user data in Firestore
        await setDoc(doc(db, "users", user.user.uid), {
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          email: formData.email,
          role: "user",
          favorites: [],
          uid: user.user.uid,
        });

        showToastr(
          "success",
          "Registration successful! You are being redirected."
        );

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          showToastr(
            "error",
            "Email is already in use. Please use a different email."
          );
        } else {
          console.log(
            "Error creating user or saving to Firestore. Please try again."
          );
        }
        console.log("Error creating user or saving to Firestore:", error);
      } finally {
        setIsReg(false);
      }
    }
  };

  return (
    <div>
      <ToastContainer></ToastContainer>

      <div className="background__division">
        <div className="image__section">
          <div className="formSection__responsive">
            <div>
              <h1 className="form__title">Register</h1>
              <div className="inputs__side">
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    First Name & Last Name
                  </InputLabel>
                  <Input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircleIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Email
                  </InputLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    BirthDate
                  </InputLabel>
                  <Input
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    type="date"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarMonthIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Password
                  </InputLabel>
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Confirm Password
                  </InputLabel>
                  <Input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </div>
              <div className="remember__forgot">
                <p className="checkbox__text">
                  <Checkbox {...label} className="checkbox" />
                  Accept Terms&Conditions
                </p>
              </div>

              <Stack direction="row" spacing={2}>
                <Button
                  className="login__button"
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    width: "100%",
                    height: "50px",
                  }}
                  onClick={handleClick}
                >
                  Register
                </Button>
              </Stack>

              <div className="separator">
                <div className="line"></div>
                <p className="text register__separator__text">or</p>
              </div>

              <div className="icon-container">
                <img src={GoogleIcon} className="icon" alt="Google Icon" />
                Sign Up With Google
              </div>

              <div className="navigate">
                <p className="no__account"> Already have an account?</p>
                <Link to="/login" className="navigate__button">
                  Sign In here
                </Link>
              </div>
            </div>
          </div>

          <h2 className="hero__title">Turn Your Ideas into Reality</h2>
          <p className="hero__paragraph">
            Start for free and get attractive offers from the community
          </p>
        </div>

        <div className="form__section">
          <div className="form__details">
            <div className="logo__section">
              <i className="bx bxs-home-heart"></i>
              <h4 className="company__title">FlatFinder</h4>
            </div>

            <div className="form__header">
              <h1 className="form__title">Sign Up</h1>
              <p className="form__info">
                Welcome! Please fill in the details to create your account.
              </p>
            </div>

            <div>
              <div className="inputs__side">
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    First Name & Last Name
                  </InputLabel>
                  <Input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountCircleIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Email
                  </InputLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    BirthDate
                  </InputLabel>
                  <Input
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    type="date"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarMonthIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Password
                  </InputLabel>
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl variant="standard" sx={{ width: "100%" }}>
                  <InputLabel
                    htmlFor="input-with-icon-adornment"
                    sx={{ color: "black" }}
                  >
                    Confirm Password
                  </InputLabel>
                  <Input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    id="input-with-icon-adornment"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "black" }} />
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </div>
              <div className="remember__forgot">
                <p className="checkbox__text">
                  <Checkbox {...label} className="checkbox" />
                  Accept Terms&Conditions
                </p>
              </div>

              <Stack direction="row" spacing={2}>
                <Button
                  className="login__button"
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    width: "100%",
                    height: "50px",
                  }}
                  onClick={handleClick}
                >
                  Register
                </Button>
              </Stack>

              <div className="separator">
                <div className="line"></div>
                <p className="text register__separator__text">or</p>
              </div>

              <div className="icon-container">
                <img src={GoogleIcon} className="icon" alt="Google Icon" />
                Sign Up With Google
              </div>

              <div className="navigate">
                <p className="no__account"> Already have an account?</p>
                <Link to="/login" className="navigate__button">
                  Sign In here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
