import { UserProvider } from "./context/user.context.jsx";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
};

export default App;
