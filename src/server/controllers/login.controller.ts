import { WebSocketClient } from "../class/WebSocketClient";

export function loginController(client: WebSocketClient, message: { type: "login", id: string, username?: unknown; }) {
    if (!("username" in message) || typeof message.username !== "string") return client.send({ message: "Debe contener un 'username' valido", from: "server" });
    if (!("publicKey" in message) || typeof message.publicKey !== "string") return client.send({ message: "Debe contener 'publicKey'", from: "server" });
    if (client.username) return client.send({ message: "Ya se encuentra logueado", from: "server" });

    client.send({ message: client.login(message.username, message.publicKey) ? "¡ Usuario Logueado !" : "Ya existe ese nombre de usuario", from: "server", id:message.id });
}