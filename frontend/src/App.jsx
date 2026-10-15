import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import CreateSetup from "./pages/CreateSetup";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import SmoothScroll from "./components/SmoothScroll/SmoothScroll";
import FrontNav from "./components/FrontNav/FrontNav";

function Layout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/dashboard" && <FrontNav />}
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create" element={<CreateSetup />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
