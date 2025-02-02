import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  console.log(user);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user) {
      setLoading(false);
    } else {
      navigate("/login");
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
};

export default UserAuth;
