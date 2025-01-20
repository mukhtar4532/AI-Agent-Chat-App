import { createContext, useContext, useState } from "react";

// Create the UserContext
export const UserContext = createContext();

// Create a Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// // Custom hook to use the UserContext
// export const useUser = () => {
//   return useContext(UserContext);
// };
