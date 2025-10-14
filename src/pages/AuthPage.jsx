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
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 p-8">
  <div className="w-full max-w-md border border-green-100 shadow-xl p-10 rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
    <h1 className="text-3xl font-extrabold text-center mb-6 text-green-700 tracking-tight">
      {isLogin ? "Welcome Back " : "Join FinOnboard "}
    </h1>

    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type="text"
          placeholder="Username"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-200"
          required
        />
      </div>

      {!isLogin && (
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-200"
            required
          />
        </div>
      )}

      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-200"
          required
        />
      </div>

      {!isLogin && (
        <div className="relative">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-200"
            required
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg mt-4 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        {isLogin ? "Login" : "Register"}
      </button>
    </form>

    <p className="text-center text-sm text-gray-700 mt-5">
      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
      <button
        type="button"
        className="text-green-600 font-semibold hover:underline hover:text-green-700 transition-all duration-200"
        onClick={() => {
          setIsLogin(!isLogin);
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