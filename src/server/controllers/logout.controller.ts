import { WebSocketClient } from "../class/WebSocketClient";

export function logoutController(client: WebSocketClient) {
    client.send({message:client.logout()?"¡ Usuario Deslogueado !":"No se encuentra logueado", from:"server"})
}