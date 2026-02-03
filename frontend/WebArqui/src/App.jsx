import { useState } from "react";
import Login from "./Login.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Bienvenido al Dashboard
      </h1>
    </div>
  );
}

export default App;

