import React, { useContext } from "react";
import { UserContext } from "../context/user.context.jsx";

export const Home = () => {
  const { user } = useContext(UserContext);
  return <div>{JSON.stringify(user)}</div>;
};
