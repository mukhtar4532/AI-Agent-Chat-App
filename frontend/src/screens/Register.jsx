import axios from "../config/axios.js";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context.jsx";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);

  function submitHandler(e) {
    e.preventDefault();
    axios
      .post("/users/register", {
        email,
        password,
      })
      .then((res) => {
        console.log(res.data);

        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);

        navigate("/");
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }
  return (
    <div className="w-full max-w-md p-8 space-y-4 bg-[#2d2d2d] rounded-lg shadow-md border border-[#3d3d3d] text-gray-200 font-sans">
      <h2 className="text-3xl font-bold text-center">Sign Up</h2>

      <form className="space-y-4" onSubmit={submitHandler}>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 font-medium text-gray-300"
          >
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg bg-[#3d3d3d] text-gray-200 placeholder-gray-400 outline-none border border-[#4d4d4d] focus:border-[#e86c00]"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 font-medium text-gray-300"
          >
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-lg bg-[#3d3d3d] text-gray-200 placeholder-gray-400 outline-none border border-[#4d4d4d] focus:border-[#e86c00]"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-gray-200 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg transition-colors duration-200"
        >
          Sign Up
        </button>
      </form>
      <p className="text-sm text-center font-semibold text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#e86c00] font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};
