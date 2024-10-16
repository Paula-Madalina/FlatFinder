import { useEffect } from "react";
import Header from "../HEADER/Header";
import "./FirstView.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../CONTEXT/authContext";
function FirstView() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const handleStart = () => {
    navigate("/");
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, []);
  return (
    <div className="background__container">
      <div className="background__image"></div>
      <div className="background__overlay"></div>
      <Header />
      <div className="hero__section">
        <h1 className="hero__title">Welcome to our platform! </h1>
        <p className="hero__description"> Feel at home</p>
        <input
          type="text"
          placeholder="Start Here"
          className="hero__input"
          role="button"
          readOnly
          onClick={handleStart}
        />
      </div>
    </div>
  );
}

export default FirstView;
