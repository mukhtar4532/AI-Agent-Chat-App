import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Login } from "../screens/Login";
import { Register } from "../screens/Register";
import { Home } from "../screens/Home";
import Project from "../screens/Project";
import UserAuth from "../auth/UserAuth";

const AppRoutes = () => {
  return (
    <div className="dark bg-amber-300  min-h-screen flex items-center justify-center">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <UserAuth>
                <Home />
              </UserAuth>
            }
            // element={<Home />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/project"
            element={
              <UserAuth>
                <Project />
              </UserAuth>
            }
            // element={<Project />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRoutes;
