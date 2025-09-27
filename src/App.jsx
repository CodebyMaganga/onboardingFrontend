import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/ProtectedRoute";

import Home from "./pages/HomePage";
import Login from "./pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
