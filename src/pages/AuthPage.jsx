import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFormStore } from "../store/context";
import { ToastContainer, toast } from 'react-toastify';
import api from "../api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state, dispatch } = useFormStore();
  const navigate = useNavigate();

  const notify = (message = "Login Successful") => toast(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "success",
  });

  const loginFailed = (message) => toast(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "error",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isLogin) {
      if (password !== confirmPassword) {
        loginFailed("Passwords do not match");
        return;
      }
      if (!email) {
        loginFailed("Email is required");
        return;
      }
    }

    const payload = isLogin
      ? { username: fullName, password }
      : { 
          username: fullName, 
          email, 
          password, 
          confirm_password: confirmPassword 
        };

    try {
      const url = isLogin
        ? "auth/login/" 
        : "auth/register/"; 

      const response = await api.post(url, payload);

      if (isLogin) {
        // Store JWT tokens
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
        dispatch({type: "LOGIN", payload: response.data});
        dispatch({type: "SET_USER", payload: response.data.user});
        notify();
        navigate("/");
      } else {
        dispatch({type: "SET_USER", payload: response.data.user});
        notify("Registration successful!");
        setIsLogin(true); // Switch to login after successful registration
        // Optionally auto-login or clear form
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      const errorMessage = error.response?.data.detail || 
                          error.response?.data.message || 
                          "An error occurred";
      loginFailed(errorMessage);
      console.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ToastContainer />
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url('/login-image.jpg')` }}
      />
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Login" : "Register"} to FinOnboard
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            {!isLogin && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
            )}
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
            )}

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-bold rounded mt-4 hover:bg-blue-700 cursor-pointer"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                setIsLogin(!isLogin);
                // Clear form when switching modes
                setFullName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}