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
    <div className="w-full max-w-md p-8 space-y-4 bg-amber-400 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>

      <form className="space-y-4" onSubmit={submitHandler}>
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg bg-amber-300 placeholder-black outline-none"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-lg bg-amber-300 placeholder-black outline-none"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
          Sign Up
        </button>
      </form>
      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};
