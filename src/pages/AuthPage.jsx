import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isLogin
      ? { username: fullName, password }
      : { email, password, username: fullName, confirm_password: confirmPassword };

    try {
      const url = isLogin
        ? "http://localhost:8000/api/auth/login/" // login endpoint for JWT
        : "http://localhost:8000/api/auth/register/"; // register endpoint

      const response = await axios.post(url, payload);

      if (isLogin) {
        // store JWT tokens
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
        alert("Login successful!");
        navigate("/");
      } else {
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex">
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
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
            )}
            <input
              type="text"
              placeholder="Username"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
            )}

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-bold rounded mt-4 hover:bg-blue-700"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
