import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Login } from "../screens/Login";
import { Register } from "../screens/Register";
import { Home } from "../screens/Home";
import Project from "../screens/Project";

const AppRoutes = () => {
  return (
    <div className="dark bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project" element={<Project />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRoutes;
