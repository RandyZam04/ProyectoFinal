import { useState } from "react";

function App() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const enviarDatos = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, email }),
    });

    setNombre("");
    setEmail("");
    alert("✨ Usuario guardado correctamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Registro de usuarios
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Ingresa los datos y guárdalos en la base de datos
        </p>

        <form onSubmit={enviarDatos} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition duration-300"
          >
            Guardar usuario
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;
