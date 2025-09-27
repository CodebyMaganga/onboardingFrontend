import { Navigate } from "react-router-dom";


export default function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("access_token"); // or your auth logic

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children; // <-- must return the children
}
