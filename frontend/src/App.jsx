import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import CreateSetup from "./pages/CreateSetup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create" element={<CreateSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
