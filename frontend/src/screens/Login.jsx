import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { useContext, useState } from "react";
import { UserContext } from "../context/user.context.jsx";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    axios
      .post("/users/login", {
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
    <div className="w-full max-w-md p-8 space-y-4 bg-slate-400 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center">Login</h2>

      <form className="space-y-4" onSubmit={submitHandler}>
        <div>
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg bg-slate-300 placeholder-black outline-none"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 font-medium">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            className="w-full px-4 py-2 rounded-lg bg-slate-300 placeholder-black outline-none"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white bg-black rounded-lg">
          Login
        </button>
      </form>
      <p className="text-sm text-center font-semibold">
        Don't have an account?{" "}
        <Link
          to="/register"
          className=" text-red-700 font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};
