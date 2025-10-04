import { Navigate } from "react-router-dom";
import { useFormStore } from "../store/context";

export default function PrivateRoute({ children }) {
  const { state } = useFormStore();
  const isAuthenticated = state.isAuthenticated || !!localStorage.getItem("access_token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children; 
}