import { users } from "../route";

export async function GET(_request, { params }) {
  const { id } = params; // Desestructuración del parámetro id de params

  // Buscar el usuario por id (convertido a número entero)
  const user = users.find((user) => user.id === parseInt(id, 10));

  // Si no se encuentra el usuario, se responde con un error 404
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Si el usuario se encuentra, responder con los datos del usuario
  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}