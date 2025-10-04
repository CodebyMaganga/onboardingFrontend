import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useFormStore } from "./store/context";
import Login from "./pages/AuthPage";
import Home from "./pages/HomePage";
import PrivateRoute from "./components/ProtectedRoute";
import ClientPortal from "./components/ClientPortal";
import FormSubmission from "./components/FormSubmission";

function App() {
  const { state } = useFormStore();



  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
        path="/form/:formId" 
        element={
          <PrivateRoute>
            <FormSubmission form onBack={() => navigate(-1)} />
          </PrivateRoute>
        } 
      />
  
          

        {state?.user?.role === "admin" ? (
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        ) : state?.user?.role === "client" ? (
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <ClientPortal />
              </PrivateRoute>
            } 
          />
        ) : (
         
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        )}
      </Routes>
    </Router>
  );
}

export default App;